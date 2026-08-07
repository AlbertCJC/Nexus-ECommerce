-- Migration: create_order RPC function with transaction handling and stock management
-- Also adds idempotency_key column for Risk 4

-- 1. Add idempotency_key column to orders table (Risk 4)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders (idempotency_key);

-- 2. Create create_order function that wraps all operations in a transaction
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_checkout_data JSONB,
  p_cart_items JSONB,
  p_idempotency_key UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_data JSONB;
  v_item JSONB;
  v_product_record RECORD;
  v_stock INTEGER;
  v_order_items JSONB[] := '{}';
  -- Totals variables (moved to outer scope)
  v_subtotal_cents INTEGER := 0;
  v_shipping_cents INTEGER := 0;
  v_tax_cents INTEGER := 0;
  v_total_cents INTEGER := 0;
BEGIN
  -- Check if order with this idempotency key already exists (idempotency for Risk 4)
  SELECT id INTO v_order_id
  FROM orders
  WHERE idempotency_key = p_idempotency_key;

  IF v_order_id IS NOT NULL THEN
    -- Order already exists, return it
    RETURN jsonb_build_object(
      'id', v_order_id,
      'already_exists', true
    );
  END IF;

  -- Calculate totals from cart items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    v_subtotal_cents := v_subtotal_cents + (v_item ->> 'product' ->> 'price_cents')::INTEGER * (v_item ->> 'quantity')::INTEGER;
  END LOOP;

  v_shipping_cents := CASE WHEN v_subtotal_cents >= 10000 THEN 0 ELSE 999 END;
  v_tax_cents := ROUND(v_subtotal_cents * 0.1)::INTEGER;
  v_total_cents := v_subtotal_cents + v_shipping_cents + v_tax_cents;

  -- Create the order
  INSERT INTO orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    subtotal_cents,
    shipping_cents,
    tax_cents,
    total_cents,
    payment_method,
    notes,
    idempotency_key,
    status
  ) VALUES (
    p_user_id,
    p_checkout_data ->> 'name',
    p_checkout_data ->> 'email',
    p_checkout_data ->> 'phone',
    p_checkout_data -> 'address',
    v_subtotal_cents,
    v_shipping_cents,
    v_tax_cents,
    v_total_cents,
    p_checkout_data ->> 'payment_method',
    p_checkout_data ->> 'notes',
    p_idempotency_key,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- Process each cart item: check stock, decrement stock, create order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Lock the product row and check stock (SELECT ... FOR UPDATE prevents race conditions - Risk 2)
    SELECT stock INTO v_stock
    FROM products
    WHERE id = (v_item ->> 'product_id')::UUID
    FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item ->> 'product_id';
    END IF;

    IF v_stock < (v_item ->> 'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %',
        v_item ->> 'product_id', v_item ->> 'quantity', v_stock;
    END IF;

    -- Decrement stock
    UPDATE products
    SET stock = stock - (v_item ->> 'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item ->> 'product_id')::UUID;

    -- Create order item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      unit_price_cents,
      quantity
    ) VALUES (
      v_order_id,
      (v_item ->> 'product_id')::UUID,
      v_item ->> 'product_name',
      v_item ->> 'product_image',
      (v_item ->> 'unit_price_cents')::INTEGER,
      (v_item ->> 'quantity')::INTEGER
    );

    -- Build response data
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_item ->> 'product_id',
      'quantity', (v_item ->> 'quantity')::INTEGER
    );
  END LOOP;

  -- Clear the user's cart
  DELETE FROM cart_items WHERE user_id = p_user_id;

  -- Return the created order with items
  RETURN jsonb_build_object(
    'id', v_order_id,
    'already_exists', false,
    'items', v_order_items
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE NOTICE 'create_order failed: %', SQLERRM;
    RAISE;
END;
$$;

-- 3. Create cancel_order function to restore stock on cancellation (Risk 2)
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_status TEXT;
  v_order_user_id UUID;
  v_item RECORD;
BEGIN
  -- Verify order exists and belongs to user (or user is admin)
  SELECT status, user_id INTO v_order_status, v_order_user_id
  FROM orders
  WHERE id = p_order_id;

  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Check authorization: user owns order OR user is admin
  IF v_order_user_id != p_user_id THEN
    -- Check if user is admin via user_profiles
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = p_user_id AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Permission denied: cannot cancel this order';
    END IF;
  END IF;

  -- Only allow cancellation of pending/confirmed orders
  IF v_order_status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Cannot cancel order with status: %', v_order_status;
  END IF;

  -- Restore stock for each order item
  FOR v_item IN
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    UPDATE products
    SET stock = stock + v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id;
  END LOOP;

  -- Update order status to cancelled
  UPDATE orders
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'restored_items', (
      SELECT jsonb_agg(jsonb_build_object('product_id', product_id, 'quantity', quantity))
      FROM order_items WHERE order_id = p_order_id
    )
  );
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION create_order(UUID, JSONB, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order(UUID, UUID) TO authenticated;