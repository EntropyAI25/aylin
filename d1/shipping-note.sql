-- Adds the optional per-product note shown under the price (e.g. "plus shipping").
-- Already-created databases: npx wrangler d1 execute aylin --remote --file=d1/shipping-note.sql
alter table products add column shipping_note text;
