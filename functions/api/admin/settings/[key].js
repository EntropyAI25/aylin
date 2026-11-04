import { json } from "../../../_lib/db.js";

// Saves one settings section, e.g. PUT /api/admin/settings/hero with { value: {...} }.
export async function onRequestPut({ request, env, params }) {
  const { value } = await request.json();
  await env.DB.prepare(
    "insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value"
  ).bind(params.key, JSON.stringify(value)).run();
  return json({ ok: true });
}
