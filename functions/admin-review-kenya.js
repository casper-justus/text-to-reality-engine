import { serveGuarded } from "./guard.js";

export async function onRequest(context) {
  return serveGuarded("admin-review-kenya", context.request, context);
}
