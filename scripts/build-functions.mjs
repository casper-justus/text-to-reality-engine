// Build-time: inline HTML sources into Pages Function modules (Workers runtime
// has no node:fs at runtime). Run before deploy.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/html";
const page = (f) => JSON.stringify(readFileSync(`${SRC}/${f}`, "utf8"));

const guardPages = {
  "teacher-dashboard": page("teacher-dashboard.html"),
  "messages": page("messages.html"),
  "post-hiring-request": page("post-hiring-request.html"),
  "admin-review": page("admin-review.html"),
  "admin-review-kenya": page("admin-review-kenya.html"),
};

const guard = `import { requireUser } from "./api/_db.js";

const PAGES = ${JSON.stringify(Object.fromEntries(Object.entries(guardPages).map(([k,v])=>[k, JSON.parse(v)])), null, 2)};

export async function serveGuarded(key, request, ctx) {
  const user = await requireUser(request, ctx);
  if (!user) {
    return new Response(null, { status: 302, headers: { Location: "/login.html" } });
  }
  const body = PAGES[key];
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
`;
writeFileSync("functions/guard.js", guard);

const teacher = `import { readFileSync } from "node:fs";

const HTML = ${page("teacher-profile.html")};

export async function onRequest() {
  return new Response(JSON.parse(${JSON.stringify(JSON.stringify(page("teacher-profile.html")))}), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
`;
// simpler: inline directly
const teacherSimple = `export async function onRequest() {
  const body = ${page("teacher-profile.html")};
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
`;
writeFileSync("functions/teacher.js", teacherSimple);

console.log("Generated functions/guard.js and functions/teacher.js");
