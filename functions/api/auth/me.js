import { json, getToken, verifyToken, findUser, clearCookie, publicUser } from "../_db.js";

async function handler(ctx) {
  const token = getToken(ctx.request);
  const payload = token ? await verifyToken(token, ctx) : null;
  const user = payload ? await findUser(ctx, payload.email) : null;
  if (!user) return json({ error: "Not authenticated" }, 401, { "Set-Cookie": clearCookie() });
  return json({ user: publicUser(user) });
}

export async function onRequestPost(ctx) { return handler(ctx); }
export async function onRequestGet(ctx) { return handler(ctx); }
