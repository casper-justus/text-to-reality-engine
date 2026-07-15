import { getTeacher, json } from "./_db.js";

export async function onRequest(context) {
  const id = new URL(context.request.url).searchParams.get("id");
  const teacher = await getTeacher(context, id);
  if (!teacher) return json({ error: "Teacher not found" }, 404);
  return json(teacher);
}
