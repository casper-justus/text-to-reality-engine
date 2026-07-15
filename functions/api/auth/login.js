import { json, findUser, createUser, hashPassword, verifyPassword, signToken, sessionCookie, publicUser } from "../_db.js";

export async function onRequestPost(ctx) {
  const { request, env } = ctx;
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) return json({ error: "Email and password are required" }, 400);

  const user = await findUser(ctx, email);
  if (!user) return json({ error: "No account found for that email" }, 401);
  const ok = await verifyPassword(password, user.password);
  if (!ok) return json({ error: "Incorrect password" }, 401);

  const token = await signToken({ sub: user.id, email: user.email, role: user.role }, ctx);
  return json({ user: publicUser(user) }, 200, { "Set-Cookie": sessionCookie(token) });
}
