-- Migration to fix UPDATE RLS policy for products using user_profiles table

-- Drop all existing admin policies for products
drop policy if exists "admin products insert" on products;
drop policy if exists "admin products update" on products;
drop policy if exists "admin products delete" on products;
drop policy if exists "admin products select" on products;

-- Recreate policies using user_profiles table check (more reliable than user_metadata)
-- Admin can insert products
create policy "admin products insert" on products for insert with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Admin can update products
create policy "admin products update" on products for update using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Admin can delete products
create policy "admin products delete" on products for delete using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Admin can select all products
create policy "admin products select" on products for select using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Also fix categories policies
drop policy if exists "admin categories insert" on categories;
drop policy if exists "admin categories update" on categories;
drop policy if exists "admin categories delete" on categories;
drop policy if exists "admin categories select" on categories;

create policy "admin categories insert" on categories for insert with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin categories update" on categories for update using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin categories delete" on categories for delete using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin categories select" on categories for select using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Also fix brands policies
drop policy if exists "admin brands insert" on brands;
drop policy if exists "admin brands update" on brands;
drop policy if exists "admin brands delete" on brands;
drop policy if exists "admin brands select" on brands;

create policy "admin brands insert" on brands for insert with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin brands update" on brands for update using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin brands delete" on brands for delete using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

create policy "admin brands select" on brands for select using (
  exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role = 'admin'
  )
);

-- Drop ALL old function versions to avoid overloading issues
drop function if exists soft_delete_product(uuid);
drop function if exists soft_delete_product(text);
drop function if exists soft_delete_product();