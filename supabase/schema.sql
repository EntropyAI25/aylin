-- AYLIN: run this once in Supabase → SQL Editor → New query → Run.
-- Before running, replace the email on the last "insert into admins" line.

create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  image text default '',
  sort int default 0
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  price numeric not null default 0,
  sale_price numeric,
  description text default '',
  details text default '',
  images text[] default '{}',
  sizes text[] default '{}',
  colors jsonb default '[]'::jsonb,
  in_stock boolean default true,
  featured boolean default false,
  active boolean default true,
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists admins (email text primary key);

create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table settings   enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table admins     enable row level security;

-- Everyone can read the shop. Only listed admins can change anything.
create policy "public read settings"   on settings   for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read products"   on products   for select using (active or is_admin());
create policy "admin write settings"   on settings   for all using (is_admin()) with check (is_admin());
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin write products"   on products   for all using (is_admin()) with check (is_admin());
create policy "admin read admins"      on admins     for select using (is_admin());

-- Image storage
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "public read media"  on storage.objects for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "admin update media" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "admin delete media" on storage.objects for delete using (bucket_id = 'media' and is_admin());

-- >>> REPLACE with the email you will log in to /admin with <<<
insert into admins (email) values ('you@example.com') on conflict do nothing;
