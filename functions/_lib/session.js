// Admin sign-in with one password. A successful sign-in sets a signed cookie that expires after 24 hours.
// The password (env ADMIN_PASSWORD) is also the signing key, so nothing else needs to be configured.
// Fails closed: if ADMIN_PASSWORD is not set, nobody can sign in.

export const COOKIE = "aylin_admin";
const DAY = 24 * 60 * 60;
const enc = new TextEncoder();

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

// Compares two strings in the same time whatever the input, so the check leaks nothing about the password.
async function sameText(a, b) {
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const bx = new Uint8Array(x), by = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < bx.length; i++) diff |= bx[i] ^ by[i];
  return diff === 0;
}

export async function checkPassword(password, env) {
  if (!env.ADMIN_PASSWORD || typeof password !== "string") return false;
  return sameText(password, env.ADMIN_PASSWORD);
}

// Cookie value: "<expiry in seconds>.<HMAC of the expiry>"
export async function newSessionCookie(env) {
  const expires = Math.floor(Date.now() / 1000) + DAY;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env.ADMIN_PASSWORD), enc.encode(String(expires)));
  return `${COOKIE}=${expires}.${toHex(sig)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DAY}`;
}

export const clearedCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function isSignedIn(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const match = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expires, sigHex] = match[1].split(".");
  if (!expires || !sigHex || Number(expires) * 1000 < Date.now()) return false;
  const sig = Uint8Array.from(sigHex.match(/../g).map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", await hmacKey(env.ADMIN_PASSWORD), sig, enc.encode(expires));
}
