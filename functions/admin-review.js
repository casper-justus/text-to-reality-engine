import { serveGuarded } from "../guard.js";

export async function onRequest(context) {
  return serveGuarded("public/admin-review.html", context.request, context);
}
