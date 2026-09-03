import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { course, enrollment, lesson } from "../db/schema";
import { isLessonReleased, lessonReleaseDate } from "./learning-rules";

export async function getAccessibleLesson(input: {
  userId: string;
  lessonId?: string;
  courseSlug?: string;
  lessonSlug?: string;
  now?: Date;
}) {
  const conditions = [
    eq(enrollment.userId, input.userId),
    eq(enrollment.status, "active"),
    eq(course.status, "published"),
    eq(lesson.published, true),
  ];
  if (input.lessonId) conditions.push(eq(lesson.id, input.lessonId));
  if (input.courseSlug) conditions.push(eq(course.slug, input.courseSlug));
  if (input.lessonSlug) conditions.push(eq(lesson.slug, input.lessonSlug));

  const [record] = await getDb().select({
    id: lesson.id,
    courseId: course.id,
    courseSlug: course.slug,
    lessonSlug: lesson.slug,
    enrolledAt: enrollment.enrolledAt,
    dripDelayDays: lesson.dripDelayDays,
  }).from(lesson)
    .innerJoin(course, eq(lesson.courseId, course.id))
    .innerJoin(enrollment, eq(enrollment.courseId, course.id))
    .where(and(...conditions)).limit(1);

  if (!record || !isLessonReleased(record.enrolledAt, record.dripDelayDays, input.now)) return null;
  return { ...record, releaseAt: lessonReleaseDate(record.enrolledAt, record.dripDelayDays) };
}
