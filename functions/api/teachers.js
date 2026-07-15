import { json, listTeachers, getTeacher } from "./_db.js";

export async function onRequestGet(ctx) {
  const id = new URL(ctx.request.url).searchParams.get("id");
  if (id) {
    const teacher = await getTeacher(ctx, id);
    if (!teacher) return json({ error: "Teacher not found" }, 404);
    return json(teacher);
  }
  const teachers = await listTeachers(ctx);
  return json({ teachers });
}
