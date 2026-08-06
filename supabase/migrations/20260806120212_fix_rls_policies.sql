-- Fix RLS policies to check user_metadata.role instead of JWT role claim

-- Drop and recreate INSERT policy for categories
drop policy if exists "admin categories insert" on categories;
create policy "admin categories insert" on categories for insert with check (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate INSERT policy for brands
drop policy if exists "admin brands insert" on brands;
create policy "admin brands insert" on brands for insert with check (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate INSERT policy for products
drop policy if exists "admin products insert" on products;
create policy "admin products insert" on products for insert with check (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate UPDATE policy for categories
drop policy if exists "admin categories update" on categories;
create policy "admin categories update" on categories for update using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate UPDATE policy for brands
drop policy if exists "admin brands update" on brands;
create policy "admin brands update" on brands for update using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate UPDATE policy for products
drop policy if exists "admin products update" on products;
create policy "admin products update" on products for update using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
) with check (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate DELETE policy for categories
drop policy if exists "admin categories delete" on categories;
create policy "admin categories delete" on categories for delete using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate DELETE policy for brands
drop policy if exists "admin brands delete" on brands;
create policy "admin brands delete" on brands for delete using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Drop and recreate DELETE policy for products
drop policy if exists "admin products delete" on products;
create policy "admin products delete" on products for delete using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Also add INSERT policy for order_items (missing from initial migration)
drop policy if exists "own order items insert" on order_items;
create policy "own order items insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
