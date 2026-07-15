import { serveGuarded } from "../guard.js";

export async function onRequest(context) {
  return serveGuarded("public/admin-review-kenya.html", context.request, context);
}
