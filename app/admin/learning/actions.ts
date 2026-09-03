"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { lesson, lessonComment, role, user, userRole } from "../../../db/schema";
import { writeAuditRecord } from "../../../lib/auth-foundation";
import { sanitizeLessonContent } from "../../../lib/lesson-content";
import { requireAdmin, requireLearningStaff } from "../../../lib/session";

export async function saveLesson(formData: FormData) {
  const current = await requireLearningStaff();
  const lessonId = formData.get("lessonId");
  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const slug = formData.get("slug");
  const summary = formData.get("summary");
  const sectionTitle = formData.get("sectionTitle");
  const content = formData.get("content");
  const parsedPosition = Number(formData.get("position"));
  const parsedDelay = Number(formData.get("dripDelayDays"));
  if (typeof courseId !== "string" || typeof title !== "string" || typeof slug !== "string" ||
      typeof summary !== "string" || typeof sectionTitle !== "string" || typeof content !== "string" || !title.trim() || !content.trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !Number.isInteger(parsedPosition) || parsedPosition < 1 ||
      !Number.isInteger(parsedDelay) || parsedDelay < 0 || parsedDelay > 3650) return;
  const db = getDb();
  const [duplicate] = await db.select({ id: lesson.id }).from(lesson)
    .where(and(eq(lesson.courseId, courseId), eq(lesson.slug, slug))).limit(1);
  if (duplicate && duplicate.id !== lessonId) return;
  const values = {
    courseId, title: title.trim(), slug, summary: summary.trim(), sectionTitle: sectionTitle.trim(), content: sanitizeLessonContent(content), position: parsedPosition,
    published: formData.get("published") === "on", dripDelayDays: parsedDelay, updatedAt: new Date(),
  };
  const [saved] = typeof lessonId === "string" && lessonId
    ? await db.update(lesson).set(values).where(eq(lesson.id, lessonId)).returning({ id: lesson.id })
    : await db.insert(lesson).values({ id: crypto.randomUUID(), ...values }).returning({ id: lesson.id });
  if (!saved) return;
  await writeAuditRecord({
    actorUserId: current.user.id, action: lessonId ? "lesson.updated" : "lesson.created", entityType: "lesson", entityId: saved.id,
    metadata: { courseId, published: formData.get("published") === "on", dripDelayDays: parsedDelay },
  });
  revalidatePath("/admin/learning"); revalidatePath("/dashboard"); revalidatePath("/learn/[courseSlug]/[lessonSlug]", "page");
}

export async function moderateComment(formData: FormData) {
  const current = await requireLearningStaff();
  const commentId = formData.get("commentId");
  const status = formData.get("status");
  if (typeof commentId !== "string" || (status !== "approved" && status !== "rejected")) return;
  const now = new Date();
  const [updated] = await getDb().update(lessonComment).set({
    status, moderatedByUserId: current.user.id, moderatedAt: now, updatedAt: now,
  }).where(and(eq(lessonComment.id, commentId), eq(lessonComment.status, "pending"))).returning({ id: lessonComment.id, lessonId: lessonComment.lessonId });
  if (!updated) return;
  await writeAuditRecord({ actorUserId: current.user.id, action: `comment.${status}`, entityType: "lesson_comment", entityId: updated.id });
  revalidatePath("/admin/learning"); revalidatePath("/learn/[courseSlug]/[lessonSlug]", "page");
}

export async function setInstructorRole(formData: FormData) {
  const current = await requireAdmin();
  const userId = formData.get("userId");
  const enabled = formData.get("enabled") === "true";
  if (typeof userId !== "string") return;
  const db = getDb();
  const [[target]] = await Promise.all([db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1), db.insert(role).values({ id: "instructor", label: "مدرس" }).onConflictDoNothing()]);
  if (!target) return;
  if (enabled) await db.insert(userRole).values({ userId, roleId: "instructor" }).onConflictDoNothing();
  else await db.delete(userRole).where(and(eq(userRole.userId, userId), eq(userRole.roleId, "instructor")));
  await writeAuditRecord({ actorUserId: current.user.id, action: enabled ? "instructor.granted" : "instructor.revoked", entityType: "user", entityId: userId });
  revalidatePath("/admin/learning");
}
