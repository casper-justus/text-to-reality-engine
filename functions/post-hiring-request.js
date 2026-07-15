import { serveGuarded } from "./guard.js";

export async function onRequest(context) {
  return serveGuarded("post-hiring-request", context.request, context);
}
