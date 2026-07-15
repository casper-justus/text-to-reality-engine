import { json, findUser, createUser, hashPassword, signToken, sessionCookie, publicUser } from "../_db.js";

export async function onRequestPost(ctx) {
  try {
    const { request } = ctx;
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const role = body.role === "school" ? "school" : "teacher";
    if (!name || !email || !password) return json({ error: "Name, email and password are required" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
    if (await findUser(ctx, email)) return json({ error: "An account with that email already exists" }, 409);

    const user = {
      id: "u_" + crypto.randomUUID(),
      name, email, role,
      password: await hashPassword(password),
      created_at: Date.now()
    };
    await createUser(ctx, user);
    const token = await signToken({ sub: user.id, email: user.email, role: user.role }, ctx);
    return json({ user: publicUser(user) }, 201, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    return json({ error: "Server error", detail: String(e && e.stack || e) }, 500);
  }
}
