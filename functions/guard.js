import { readFile } from "node:fs/promises";
import { requireUser } from "./_db.js";

export async function serveGuarded(path, request, ctx) {
  const user = await requireUser(request, ctx);
  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login.html" },
    });
  }
  try {
    const body = await readFile(path, "utf8");
    return new Response(body, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
