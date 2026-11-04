import { fail, json, slugify } from "../../../_lib/db.js";

export async function onRequestPut({ request, env, params }) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return fail("Please enter a name.");
  try {
    await env.DB.prepare("update categories set name = ?, slug = ?, image = ?, sort = ? where id = ?")
      .bind(name, slugify(name), body.image ?? "", Number(body.sort) || 0, params.id).run();
  } catch {
    return fail("A category with this name already exists.", 409);
  }
  return json({ ok: true });
}

// Products in the category stay on the website; they just become uncategorised (see schema.sql).
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("delete from categories where id = ?").bind(params.id).run();
  return json({ ok: true });
}
