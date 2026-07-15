import { json, listTeachers } from "./_db.js";

export async function onRequestGet(ctx) {
  const teachers = await listTeachers(ctx);
  return json({ teachers });
}
