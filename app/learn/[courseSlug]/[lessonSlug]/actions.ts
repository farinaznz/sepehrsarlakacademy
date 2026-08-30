"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../../db";
import { course, enrollment, lesson, lessonProgress } from "../../../../db/schema";
import { writeAuditRecord } from "../../../../lib/auth-foundation";
import { requireSession } from "../../../../lib/session";

export async function completeLesson(formData: FormData) {
  const current = await requireSession();
  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string") return;

  const [allowed] = await getDb().select({ lessonId: lesson.id, courseSlug: course.slug, lessonSlug: lesson.slug })
    .from(lesson)
    .innerJoin(course, eq(lesson.courseId, course.id))
    .innerJoin(enrollment, and(
      eq(enrollment.courseId, course.id),
      eq(enrollment.userId, current.user.id),
      eq(enrollment.status, "active"),
    ))
    .where(and(eq(lesson.id, lessonId), eq(lesson.published, true))).limit(1);
  if (!allowed) return;

  const now = new Date();
  await getDb().insert(lessonProgress).values({
    id: crypto.randomUUID(), userId: current.user.id, lessonId, percent: 100, completedAt: now, lastViewedAt: now,
  }).onConflictDoUpdate({
    target: [lessonProgress.userId, lessonProgress.lessonId],
    set: { percent: 100, completedAt: now, lastViewedAt: now, updatedAt: now },
  });
  await writeAuditRecord({
    actorUserId: current.user.id,
    action: "lesson.completed",
    entityType: "lesson",
    entityId: lessonId,
  });
  revalidatePath(`/learn/${allowed.courseSlug}/${allowed.lessonSlug}`);
  revalidatePath("/dashboard");
}
