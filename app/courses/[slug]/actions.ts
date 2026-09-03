"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "../../../db";
import { course, enrollment } from "../../../db/schema";
import { writeAuditRecord } from "../../../lib/auth-foundation";
import { requireSession } from "../../../lib/session";

export async function subscribeToFreeCourse(formData: FormData) {
  const slug = formData.get("courseSlug");
  if (typeof slug !== "string") return;
  const current = await requireSession(`/courses/${slug}`);
  const db = getDb();
  const [eligibleCourse] = await db.select({ id: course.id }).from(course).where(and(
    eq(course.slug, slug), eq(course.status, "published"), eq(course.enrollmentMode, "self_service"),
  )).limit(1);
  if (!eligibleCourse) return;

  const [saved] = await db.insert(enrollment).values({
    id: crypto.randomUUID(), userId: current.user.id, courseId: eligibleCourse.id,
    enrolledByUserId: current.user.id, status: "active",
  }).onConflictDoUpdate({
    target: [enrollment.userId, enrollment.courseId],
    set: { status: "active", enrolledByUserId: current.user.id, updatedAt: new Date() },
  }).returning({ id: enrollment.id });
  await writeAuditRecord({
    actorUserId: current.user.id, action: "enrollment.self_service.activated",
    entityType: "enrollment", entityId: saved.id, metadata: { courseId: eligibleCourse.id },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/courses/${slug}`);
  redirect("/dashboard");
}
