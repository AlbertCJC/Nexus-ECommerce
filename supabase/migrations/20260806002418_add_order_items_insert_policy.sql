-- Add INSERT policy for order_items (missing from initial migration)
-- Allows users to insert order items for their own orders

create policy "own order items insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);