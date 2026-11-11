// Shared helpers for the API routes: JSON responses, row mapping and slugs.

export const publicCache = { "cache-control": "public, max-age=30, s-maxage=60" };

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...init.headers },
  });
}

export const fail = (message, status = 400) => json({ error: message }, { status });

const parse = (value, fallback) => {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
};

// D1 stores booleans as 0/1 and lists as JSON text. The site expects real booleans and arrays.
export function toProduct(row) {
  return {
    ...row,
    images: parse(row.images, []),
    sizes: parse(row.sizes, []),
    sizes_out: parse(row.sizes_out, []),
    colors: parse(row.colors, []),
    in_stock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
  };
}

// Only these fields can be written from the admin. Values are already in D1 form.
export function productRow(body) {
  const sizes = body.sizes ?? [], out = body.sizes_out ?? [];
  return {
    name: String(body.name ?? "").trim(),
    category_id: body.category_id || null,
    price: Number(body.price) || 0,
    sale_price: body.sale_price === null || body.sale_price === "" || body.sale_price === undefined ? null : Number(body.sale_price),
    sale_label: body.sale_label || null,
    shipping_note: body.shipping_note || null,
    description: body.description ?? "",
    details: body.details ?? "",
    images: JSON.stringify(body.images ?? []),
    sizes: JSON.stringify(body.sizes ?? []),
    sizes_out: JSON.stringify(body.sizes_out ?? []),
    colors: JSON.stringify(body.colors ?? []),
    in_stock: body.in_stock && !(sizes.length && sizes.every((s) => out.includes(s))) ? 1 : 0,
    featured: body.featured ? 1 : 0,
    active: body.active ? 1 : 0,
    sort: Number(body.sort) || 0,
  };
}

export const slugify = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Column names come from the code above, never from the request, so building the SQL from them is safe.
export function columns(row) {
  const keys = Object.keys(row);
  return { keys, set: keys.map((k) => `${k} = ?`).join(", "), values: keys.map((k) => row[k]) };
}

export async function uniqueProductSlug(db, base) {
  let slug = slugify(base) || "product", n = 1;
  while (await db.prepare("select 1 from products where slug = ?").bind(slug).first()) slug = `${slugify(base)}-${++n}`;
  return slug;
}
