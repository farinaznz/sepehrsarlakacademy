import { and, asc, desc, eq, or } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "../../../../db";
import { course, lesson, lessonComment, lessonNote, lessonProgress, profile } from "../../../../db/schema";
import { getAccessibleLesson } from "../../../../lib/learning-access";
import { isLessonReleased, lessonReleaseDate } from "../../../../lib/learning-rules";
import { requireSession } from "../../../../lib/session";
import { saveLessonNote, setLessonCompletion, submitLessonComment } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProtectedLessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const route = await params;
  const current = await requireSession(`/learn/${route.courseSlug}/${route.lessonSlug}`);
  const access = await getAccessibleLesson({ userId: current.user.id, courseSlug: route.courseSlug, lessonSlug: route.lessonSlug });
  if (!access) notFound();

  const db = getDb();
  const [[record], lessonRows, [note], comments] = await Promise.all([
    db.select({
      id: lesson.id, title: lesson.title, summary: lesson.summary, content: lesson.content,
      courseTitle: course.title, progress: lessonProgress.percent,
    }).from(lesson).innerJoin(course, eq(lesson.courseId, course.id))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lesson.id), eq(lessonProgress.userId, current.user.id)))
      .where(eq(lesson.id, access.id)).limit(1),
    db.select({ id: lesson.id, slug: lesson.slug, title: lesson.title, dripDelayDays: lesson.dripDelayDays, progress: lessonProgress.percent })
      .from(lesson).leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lesson.id), eq(lessonProgress.userId, current.user.id)))
      .where(and(eq(lesson.courseId, access.courseId), eq(lesson.published, true))).orderBy(asc(lesson.position)),
    db.select({ body: lessonNote.body }).from(lessonNote)
      .where(and(eq(lessonNote.lessonId, access.id), eq(lessonNote.userId, current.user.id))).limit(1),
    db.select({
      id: lessonComment.id, body: lessonComment.body, status: lessonComment.status,
      createdAt: lessonComment.createdAt, author: profile.displayName, userId: lessonComment.userId,
    }).from(lessonComment).innerJoin(profile, eq(profile.userId, lessonComment.userId))
      .where(and(eq(lessonComment.lessonId, access.id), or(eq(lessonComment.status, "approved"), eq(lessonComment.userId, current.user.id))))
      .orderBy(desc(lessonComment.createdAt)),
  ]);
  if (!record) notFound();

  const now = new Date();
  await db.insert(lessonProgress).values({
    id: crypto.randomUUID(), userId: current.user.id, lessonId: record.id, percent: 0, lastViewedAt: now,
  }).onConflictDoUpdate({ target: [lessonProgress.userId, lessonProgress.lessonId], set: { lastViewedAt: now, updatedAt: now } });

  const navigation = lessonRows.map((item) => ({
    ...item,
    available: isLessonReleased(access.enrolledAt, item.dripDelayDays, now),
    releaseAt: lessonReleaseDate(access.enrolledAt, item.dripDelayDays),
  }));
  const currentIndex = navigation.findIndex((item) => item.id === record.id);
  const previous = navigation.slice(0, currentIndex).reverse().find((item) => item.available);
  const next = navigation.slice(currentIndex + 1).find((item) => item.available);

  return <section className="protected-lesson section"><div className="container lesson-layout">
    <aside className="lesson-sidebar">
      <Link className="arrow-link" href="/dashboard">→ فضای هنرجویی</Link>
      <h2>{record.courseTitle}</h2>
      <nav aria-label="درس‌های دوره">{navigation.map((item) => item.available ?
        <Link className={item.id === record.id ? "active" : ""} key={item.id} href={`/learn/${route.courseSlug}/${item.slug}`}><span>{item.progress === 100 ? "✓" : "○"}</span>{item.title}</Link> :
        <div className="locked" key={item.id}><span>◇</span><span>{item.title}<small>{item.releaseAt.toLocaleDateString("fa-IR")}</small></span></div>
      )}</nav>
    </aside>
    <article className="lesson-main">
      <header><span className="eyebrow">{record.courseTitle}</span><h1>{record.title}</h1><p>{record.summary}</p></header>
      <div className="protected-lesson-content"><p>{record.content}</p></div>
      <div className="lesson-actions">
        <form action={setLessonCompletion}><input type="hidden" name="lessonId" value={record.id} /><input type="hidden" name="completed" value={record.progress === 100 ? "false" : "true"} /><button className="button" type="submit">{record.progress === 100 ? "بازکردن دوباره درس" : "علامت‌گذاری به‌عنوان تکمیل‌شده"}</button></form>
        <nav>{previous ? <Link href={`/learn/${route.courseSlug}/${previous.slug}`}>→ درس قبلی</Link> : <span />}{next ? <Link href={`/learn/${route.courseSlug}/${next.slug}`}>درس بعدی ←</Link> : <Link href="/dashboard">پایان دوره ←</Link>}</nav>
      </div>
      <section className="learning-panel"><h2>یادداشت شخصی</h2><p>فقط شما می‌توانید این یادداشت را ببینید.</p><form action={saveLessonNote}><input type="hidden" name="lessonId" value={record.id} /><textarea name="body" maxLength={5000} defaultValue={note?.body ?? ""} placeholder="نکته‌ها، تمرین‌ها و پرسش‌های خود را بنویسید…" /><button className="button button-small" type="submit">ذخیره یادداشت</button></form></section>
      <section className="learning-panel"><h2>گفت‌وگوی درس</h2><p>دیدگاه شما پس از تأیید مدرس برای دیگر هنرجویان نمایش داده می‌شود.</p><form action={submitLessonComment}><input type="hidden" name="lessonId" value={record.id} /><textarea name="body" maxLength={2000} required placeholder="دیدگاه یا پرسش خود را بنویسید…" /><button className="button button-small" type="submit">ارسال برای بررسی</button></form>
        <div className="lesson-comments">{comments.map((comment) => <article key={comment.id}><div><strong>{comment.author}</strong><time>{comment.createdAt.toLocaleDateString("fa-IR")}</time>{comment.status === "pending" ? <small>در انتظار بررسی</small> : comment.status === "rejected" ? <small>تأیید نشد</small> : null}</div><p>{comment.body}</p></article>)}{!comments.length ? <p>هنوز دیدگاهی ثبت نشده است.</p> : null}</div>
      </section>
    </article>
  </div></section>;
}
