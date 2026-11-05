import { json, publicCache } from "../_lib/db.js";

// Public: all categories in display order.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("select * from categories order by sort").all();
  return json(results, { headers: publicCache });
}
