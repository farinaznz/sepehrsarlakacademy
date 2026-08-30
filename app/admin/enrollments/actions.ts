"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { course, enrollment, user } from "../../../db/schema";
import { writeAuditRecord } from "../../../lib/auth-foundation";
import { requireAdmin } from "../../../lib/session";

export async function enrollStudent(formData: FormData) {
  const current = await requireAdmin();
  const userId = formData.get("userId");
  const courseId = formData.get("courseId");
  if (typeof userId !== "string" || typeof courseId !== "string") return;

  const db = getDb();
  const [targetUser] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
  const [targetCourse] = await db.select({ id: course.id }).from(course).where(eq(course.id, courseId)).limit(1);
  if (!targetUser || !targetCourse) return;

  const id = crypto.randomUUID();
  const [saved] = await db.insert(enrollment).values({
    id,
    userId,
    courseId,
    enrolledByUserId: current.user.id,
    status: "active",
  }).onConflictDoUpdate({
    target: [enrollment.userId, enrollment.courseId],
    set: { status: "active", enrolledByUserId: current.user.id, updatedAt: new Date() },
  }).returning({ id: enrollment.id });

  await writeAuditRecord({
    actorUserId: current.user.id,
    action: "enrollment.activated",
    entityType: "enrollment",
    entityId: saved.id,
    metadata: { userId, courseId },
  });
  revalidatePath("/admin/enrollments");
  revalidatePath("/dashboard");
}

export async function revokeEnrollment(formData: FormData) {
  const current = await requireAdmin();
  const enrollmentId = formData.get("enrollmentId");
  if (typeof enrollmentId !== "string") return;

  const [updated] = await getDb().update(enrollment).set({ status: "revoked", updatedAt: new Date() })
    .where(and(eq(enrollment.id, enrollmentId), eq(enrollment.status, "active")))
    .returning({ id: enrollment.id, userId: enrollment.userId, courseId: enrollment.courseId });
  if (updated) {
    await writeAuditRecord({
      actorUserId: current.user.id,
      action: "enrollment.revoked",
      entityType: "enrollment",
      entityId: updated.id,
      metadata: { userId: updated.userId, courseId: updated.courseId },
    });
  }
  revalidatePath("/admin/enrollments");
  revalidatePath("/dashboard");
}
