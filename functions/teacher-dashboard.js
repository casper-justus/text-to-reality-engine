import { serveGuarded } from "./guard.js";

export async function onRequest(context) {
  return serveGuarded("teacher-dashboard", context.request, context);
}
