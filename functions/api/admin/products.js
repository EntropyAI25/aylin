import { columns, fail, json, productRow, toProduct, uniqueProductSlug } from "../../_lib/db.js";

// All products, including hidden ones.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("select * from products order by sort, created_at desc").all();
  return json(results.map(toProduct));
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const row = productRow(body);
  if (!row.name) return fail("Please enter a name.");
  const id = crypto.randomUUID();
  const slug = await uniqueProductSlug(env.DB, row.name);
  const { keys, values } = columns({ ...row, slug });
  await env.DB.prepare(`insert into products (id, ${keys.join(", ")}) values (?${", ?".repeat(keys.length)})`).bind(id, ...values).run();
  return json(toProduct(await env.DB.prepare("select * from products where id = ?").bind(id).first()), { status: 201 });
}
