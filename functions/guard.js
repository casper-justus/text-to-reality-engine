import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { requireUser } from "./_db.js";

export async function serveGuarded(file, request, ctx) {
  const user = await requireUser(request, ctx);
  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login.html" },
    });
  }
  try {
    const body = await readFile(join(import.meta.dirname, "..", "public", file), "utf8");
    return new Response(body, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
