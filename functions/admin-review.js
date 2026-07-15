import { serveGuarded } from "./guard.js";

export async function onRequest(context) {
  return serveGuarded("admin-review", context.request, context);
}
