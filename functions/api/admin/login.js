import { checkPassword, newSessionCookie } from "../../_lib/session.js";
import { fail, json } from "../../_lib/db.js";

export async function onRequestPost({ request, env }) {
  const { password } = await request.json().catch(() => ({}));
  if (!(await checkPassword(password, env))) return fail("Wrong password.", 401);
  return json({ ok: true }, { headers: { "set-cookie": await newSessionCookie(env) } });
}
