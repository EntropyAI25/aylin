-- AYLIN database (Cloudflare D1, SQLite).
-- Apply with: npx wrangler d1 execute aylin --remote --file=d1/schema.sql
-- Access control now lives in Cloudflare Access, so there is no admins table or row-level security.

create table if not exists settings (
  key text primary key,
  value text not null default '{}'
);

create table if not exists categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  image text default '',
  sort integer default 0
);

create table if not exists products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category_id text references categories(id) on delete set null,
  price real not null default 0,
  sale_price real,
  sale_label text,
  shipping_note text,
  description text default '',
  details text default '',
  images text not null default '[]',   -- JSON array of URLs
  sizes text not null default '[]',    -- JSON array of strings
  colors text not null default '[]',   -- JSON array of { name, hex, images[] }
  in_stock integer not null default 1,
  featured integer not null default 0,
  active integer not null default 1,
  sort integer default 0,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Uploaded images. Kept in D1 for now (free, no extra service). Each file is capped at 900 KB by the upload route.
create table if not exists media (
  key text primary key,
  type text not null,
  data blob not null
);

create index if not exists products_active_sort on products (active, sort, created_at);
create index if not exists products_category on products (category_id);
