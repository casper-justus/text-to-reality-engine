import { json, getToken, verifyToken, clearCookie } from "../_db.js";

export async function onRequestPost(ctx) {
  // Any valid or invalid token is cleared on logout.
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}

export async function onRequestGet(ctx) {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
