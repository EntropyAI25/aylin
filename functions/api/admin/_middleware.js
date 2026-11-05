import { isSignedIn } from "../../_lib/session.js";
import { fail } from "../../_lib/db.js";

// Every /api/admin/* route runs through here, except sign-in and sign-out. Requests need a valid session cookie.
export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname;
  if (path === "/api/admin/login" || path === "/api/admin/logout") return next();
  if (!(await isSignedIn(request, env))) return fail("Sign in to the admin first.", 401);
  return next();
}
