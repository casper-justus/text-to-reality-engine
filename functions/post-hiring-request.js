import { serveGuarded } from "../guard.js";

export async function onRequest(context) {
  return serveGuarded("public/post-hiring-request.html", context.request, context);
}
