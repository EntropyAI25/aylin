-- Adds the list of sizes marked "unavailable" (shown crossed out on the product page).
-- Already-created databases: npx wrangler d1 execute aylin --remote --file=d1/sizes-out.sql
alter table products add column sizes_out text not null default '[]';
