"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "../../../../db";
import { lessonComment, lessonNote, lessonProgress } from "../../../../db/schema";
import { writeAuditRecord } from "../../../../lib/auth-foundation";
import { getAccessibleLesson } from "../../../../lib/learning-access";
import { requireSession } from "../../../../lib/session";

async function actionContext(formData: FormData) {
  const current = await requireSession();
  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string") return null;
  const allowed = await getAccessibleLesson({ userId: current.user.id, lessonId });
  return allowed ? { current, allowed } : null;
}

function refreshLesson(courseSlug: string, lessonSlug: string) {
  revalidatePath(`/learn/${courseSlug}/${lessonSlug}`);
  revalidatePath("/dashboard");
}

export async function setLessonCompletion(formData: FormData) {
  const context = await actionContext(formData);
  if (!context) return;
  const completed = formData.get("completed") === "true";
  const now = new Date();
  await getDb().insert(lessonProgress).values({
    id: crypto.randomUUID(), userId: context.current.user.id, lessonId: context.allowed.id,
    percent: completed ? 100 : 0, completedAt: completed ? now : null, lastViewedAt: now,
  }).onConflictDoUpdate({
    target: [lessonProgress.userId, lessonProgress.lessonId],
    set: { percent: completed ? 100 : 0, completedAt: completed ? now : null, lastViewedAt: now, updatedAt: now },
  });
  await writeAuditRecord({
    actorUserId: context.current.user.id,
    action: completed ? "lesson.completed" : "lesson.reopened",
    entityType: "lesson", entityId: context.allowed.id,
  });
  refreshLesson(context.allowed.courseSlug, context.allowed.lessonSlug);
}

export async function saveLessonNote(formData: FormData) {
  const context = await actionContext(formData);
  const body = formData.get("body");
  if (!context || typeof body !== "string" || body.length > 5000) return;
  const now = new Date();
  await getDb().insert(lessonNote).values({
    id: crypto.randomUUID(), userId: context.current.user.id, lessonId: context.allowed.id, body: body.trim(),
  }).onConflictDoUpdate({
    target: [lessonNote.userId, lessonNote.lessonId], set: { body: body.trim(), updatedAt: now },
  });
  refreshLesson(context.allowed.courseSlug, context.allowed.lessonSlug);
}

export async function submitLessonComment(formData: FormData) {
  const context = await actionContext(formData);
  const body = formData.get("body");
  if (!context || typeof body !== "string") return;
  const cleanBody = body.trim();
  if (!cleanBody || cleanBody.length > 2000) return;
  const [created] = await getDb().insert(lessonComment).values({
    id: crypto.randomUUID(), userId: context.current.user.id, lessonId: context.allowed.id,
    body: cleanBody, status: "pending",
  }).returning({ id: lessonComment.id });
  await writeAuditRecord({
    actorUserId: context.current.user.id, action: "comment.submitted",
    entityType: "lesson_comment", entityId: created.id, metadata: { lessonId: context.allowed.id },
  });
  refreshLesson(context.allowed.courseSlug, context.allowed.lessonSlug);
}
