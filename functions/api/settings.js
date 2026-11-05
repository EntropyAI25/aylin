import { json, publicCache } from "../_lib/db.js";

// Public: every saved setting as { key: value }. Missing keys fall back to the defaults in js/seed.js.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("select key, value from settings").all();
  return json(Object.fromEntries(results.map((r) => [r.key, JSON.parse(r.value)])), { headers: publicCache });
}
