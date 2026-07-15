import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function onRequest(context) {
  try {
    const body = await readFile(join(import.meta.dirname, "..", "public", "teacher-profile.html"), "utf8");
    return new Response(body, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
