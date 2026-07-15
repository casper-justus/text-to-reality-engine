import { serveGuarded } from "../guard.js";

export async function onRequest(context) {
  return serveGuarded("public/messages.html", context.request, context);
}
