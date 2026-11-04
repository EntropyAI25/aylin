import { fail, json } from "../../_lib/db.js";

const MAX_BYTES = 900 * 1024;

// Stores an image in D1 and returns the path the site uses to show it (/media/<key>).
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return fail("No file received.");
  if (!file.type.startsWith("image/")) return fail("Please upload an image.");
  if (file.size > MAX_BYTES) return fail("Image is too big (max 900 KB). Please compress it and try again.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await env.DB.prepare("insert into media (key, type, data) values (?, ?, ?)")
    .bind(key, file.type, await file.arrayBuffer()).run();
  return json({ url: `/media/${key}` }, { status: 201 });
}
