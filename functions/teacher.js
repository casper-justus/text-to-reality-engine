import { readFile } from "node:fs/promises";

export async function onRequest(context) {
  try {
    const body = await readFile("public/teacher.html", "utf8");
    return new Response(body, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
