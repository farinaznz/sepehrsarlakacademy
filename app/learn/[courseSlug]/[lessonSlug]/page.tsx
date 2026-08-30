import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "../../../../db";
import { course, enrollment, lesson, lessonProgress } from "../../../../db/schema";
import { requireSession } from "../../../../lib/session";
import { completeLesson } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProtectedLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const route = await params;
  const current = await requireSession(`/learn/${route.courseSlug}/${route.lessonSlug}`);
  const [record] = await getDb().select({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    content: lesson.content,
    courseTitle: course.title,
    progress: lessonProgress.percent,
  }).from(lesson)
    .innerJoin(course, eq(lesson.courseId, course.id))
    .innerJoin(enrollment, and(
      eq(enrollment.courseId, course.id),
      eq(enrollment.userId, current.user.id),
      eq(enrollment.status, "active"),
    ))
    .leftJoin(lessonProgress, and(
      eq(lessonProgress.lessonId, lesson.id),
      eq(lessonProgress.userId, current.user.id),
    ))
    .where(and(
      eq(course.slug, route.courseSlug),
      eq(lesson.slug, route.lessonSlug),
      eq(lesson.published, true),
    )).limit(1);
  if (!record) notFound();

  const now = new Date();
  await getDb().insert(lessonProgress).values({
    id: crypto.randomUUID(), userId: current.user.id, lessonId: record.id, percent: 0, lastViewedAt: now,
  }).onConflictDoUpdate({
    target: [lessonProgress.userId, lessonProgress.lessonId],
    set: { lastViewedAt: now, updatedAt: now },
  });

  return (
    <article className="protected-lesson section">
      <div className="container protected-lesson-shell">
        <Link className="arrow-link" href="/dashboard">→ بازگشت به فضای هنرجویی</Link>
        <header><span className="eyebrow">{record.courseTitle}</span><h1>{record.title}</h1><p>{record.summary}</p></header>
        <div className="protected-lesson-content"><p>{record.content}</p></div>
        <form action={completeLesson} className="lesson-complete-form">
          <input type="hidden" name="lessonId" value={record.id} />
          <button className="button" type="submit" disabled={record.progress === 100}>{record.progress === 100 ? "این درس تکمیل شده است" : "علامت‌گذاری به‌عنوان تکمیل‌شده"}</button>
        </form>
      </div>
    </article>
  );
}
