import { columns, fail, json, productRow, toProduct } from "../../../_lib/db.js";

export async function onRequestPut({ request, env, params }) {
  const row = productRow(await request.json());
  if (!row.name) return fail("Please enter a name.");
  const { set, values } = columns(row);
  await env.DB.prepare(`update products set ${set} where id = ?`).bind(...values, params.id).run();
  return json(toProduct(await env.DB.prepare("select * from products where id = ?").bind(params.id).first()));
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("delete from products where id = ?").bind(params.id).run();
  return json({ ok: true });
}
