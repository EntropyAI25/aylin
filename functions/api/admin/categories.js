import { fail, json, slugify } from "../../_lib/db.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return fail("Please enter a name.");
  const category = { id: crypto.randomUUID(), name, slug: slugify(name), image: body.image ?? "", sort: Number(body.sort) || 0 };
  try {
    await env.DB.prepare("insert into categories (id, name, slug, image, sort) values (?, ?, ?, ?, ?)")
      .bind(category.id, category.name, category.slug, category.image, category.sort).run();
  } catch {
    return fail("A category with this name already exists.", 409);
  }
  return json(category, { status: 201 });
}
