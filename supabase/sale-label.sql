-- Adds the optional sale message shown under the price (e.g. "Product launch discount").
-- Run once in Supabase -> SQL Editor.
alter table products add column if not exists sale_label text;
