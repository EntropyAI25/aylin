// Serves uploaded images from D1. Keys include a timestamp and random id, so they never change and can be cached for a year.
export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare("select type, data from media where key = ?").bind(params.key).first();
  if (!row) return new Response("Not found", { status: 404 });
  // D1 returns BLOB columns as arrays of byte values, so convert them before sending.
  return new Response(new Uint8Array(row.data), {
    headers: { "content-type": row.type, "cache-control": "public, max-age=31536000, immutable" },
  });
}
