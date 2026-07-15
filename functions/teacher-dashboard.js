import { serveGuarded } from "../guard.js";

export async function onRequest(context) {
  return serveGuarded("public/teacher-dashboard.html", context.request, context);
}
