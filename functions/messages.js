import { serveGuarded } from "./guard.js";

export async function onRequest(context) {
  return serveGuarded("messages", context.request, context);
}
