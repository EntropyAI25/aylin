import { fail, json } from "../../../_lib/db.js";

// Sets the display order from a list of product ids, first one first. Nothing else about the products changes.
export async function onRequestPost({ request, env }) {
  const { ids } = await request.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length || !ids.every((id) => typeof id === "string")) return fail("No products to order.");
  const update = env.DB.prepare("update products set sort = ? where id = ?");
  await env.DB.batch(ids.map((id, i) => update.bind(i + 1, id)));
  return json({ ok: true });
}
