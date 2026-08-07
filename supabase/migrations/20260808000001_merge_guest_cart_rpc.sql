-- Migration: merge_guest_cart RPC function for efficient guest cart merging (Risk 5)

CREATE OR REPLACE FUNCTION merge_guest_cart(
  p_user_id UUID,
  p_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_merged_count INTEGER := 0;
  v_product_exists BOOLEAN;
BEGIN
  -- Validate input
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array' THEN
    RAISE EXCEPTION 'p_items must be a JSON array';
  END IF;

  -- Process each item in a single transaction
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Verify product exists and is active
    SELECT EXISTS(
      SELECT 1 FROM products
      WHERE id = (v_item ->> 'product_id')::UUID
      AND status = 'active'
    ) INTO v_product_exists;

    IF NOT v_product_exists THEN
      RAISE NOTICE 'Skipping invalid product: %', v_item ->> 'product_id';
      CONTINUE;
    END IF;

    -- Upsert cart item: insert new or update quantity if exists
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (
      p_user_id,
      (v_item ->> 'product_id')::UUID,
      (v_item ->> 'quantity')::INTEGER
    )
    ON CONFLICT (user_id, product_id) DO UPDATE SET
      quantity = cart_items.quantity + EXCLUDED.quantity,
      updated_at = NOW();

    v_merged_count := v_merged_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'merged_count', v_merged_count,
    'message', 'Guest cart merged successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'merge_guest_cart failed: %', SQLERRM;
    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION merge_guest_cart(UUID, JSONB) TO authenticated;