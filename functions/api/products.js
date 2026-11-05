import { json, publicCache, toProduct } from "../_lib/db.js";

// Public: visible products only, in display order (newest first within the same order).
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("select * from products where active = 1 order by sort, created_at desc").all();
  return json(results.map(toProduct), { headers: publicCache });
}
