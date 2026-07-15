import { json, createHiringRequest } from "./_db.js";

export async function onRequestPost(ctx) {
  let body;
  try { body = await ctx.request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const required = ["school", "role", "subject", "location"];
  for (const f of required) if (!body[f]) return json({ error: `Missing field: ${f}` }, 400);
  const row = await createHiringRequest(ctx, body);
  return json({ request: row }, 201);
}

export async function onRequestGet() {
  return json({ error: "POST a hiring request to /api/hiring-requests" }, 405);
}
