import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "../../db";
import { course, enrollment, lesson, lessonProgress, profile } from "../../db/schema";
import { userHasAnyRole, userHasRole } from "../../lib/auth-foundation";
import { courseProgress, isLessonReleased, lessonReleaseDate } from "../../lib/learning-rules";
import { requireSession } from "../../lib/session";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const current = await requireSession();
  const db = getDb();
  const [studentProfile, isAdmin, isLearningStaff] = await Promise.all([
    db.select().from(profile).where(eq(profile.userId, current.user.id)).limit(1).then(([item]) => item),
    userHasRole(current.user.id, "admin"),
    userHasAnyRole(current.user.id, ["instructor", "admin"]),
  ]);
  const rows = await db.select({
    enrollmentId: enrollment.id, enrolledAt: enrollment.enrolledAt,
    courseSlug: course.slug, courseTitle: course.title, courseDescription: course.description,
    lessonId: lesson.id, lessonSlug: lesson.slug, lessonTitle: lesson.title, sectionTitle: lesson.sectionTitle,
    dripDelayDays: lesson.dripDelayDays, progress: lessonProgress.percent, lastViewedAt: lessonProgress.lastViewedAt,
  }).from(enrollment)
    .innerJoin(course, eq(enrollment.courseId, course.id))
    .leftJoin(lesson, and(eq(lesson.courseId, course.id), eq(lesson.published, true)))
    .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lesson.id), eq(lessonProgress.userId, current.user.id)))
    .where(and(eq(enrollment.userId, current.user.id), eq(enrollment.status, "active"), eq(course.status, "published")))
    .orderBy(asc(course.title), asc(lesson.position));

  const now = new Date();
  const enrolledCourses = new Map<string, {
    title: string; description: string; slug: string;
    lessons: Array<{ id: string; slug: string; title: string; sectionTitle: string; percent: number; available: boolean; releaseAt: Date; lastViewedAt: Date | null }>;
  }>();
  for (const row of rows) {
    const entry = enrolledCourses.get(row.enrollmentId) ?? {
      title: row.courseTitle, description: row.courseDescription, slug: row.courseSlug, lessons: [],
    };
    if (row.lessonId && row.lessonSlug && row.lessonTitle && row.dripDelayDays !== null) {
      entry.lessons.push({
        id: row.lessonId, slug: row.lessonSlug, title: row.lessonTitle, sectionTitle: row.sectionTitle ?? "درس‌های دوره", percent: row.progress ?? 0,
        available: isLessonReleased(row.enrolledAt, row.dripDelayDays, now),
        releaseAt: lessonReleaseDate(row.enrolledAt, row.dripDelayDays), lastViewedAt: row.lastViewedAt,
      });
    }
    enrolledCourses.set(row.enrollmentId, entry);
  }

  return <section className="student-area section"><div className="container">
    <div className="student-heading">
      <div><span className="eyebrow">فضای هنرجویی</span><h1>سلام، {studentProfile?.displayName || current.user.name}</h1><p>از همان‌جایی که متوقف شدید ادامه دهید.</p></div>
      <div className="student-actions">
        {isLearningStaff ? <Link className="button button-ghost" href="/admin/learning">مدیریت آموزش</Link> : null}
        {isAdmin ? <Link className="button" href="/admin/enrollments">مدیریت ثبت‌نام‌ها</Link> : null}<SignOutButton />
      </div>
    </div>
    {enrolledCourses.size ? <div className="student-course-grid">{[...enrolledCourses.values()].map((item) => {
      const availableLessons = item.lessons.filter((entry) => entry.available);
      const percent = courseProgress(availableLessons);
      const nextLesson = availableLessons.find((entry) => entry.percent < 100) ?? availableLessons.at(-1);
      const lessonSections = item.lessons.reduce<Array<{ title: string; lessons: typeof item.lessons }>>((sections, lessonItem) => {
        const latest = sections.at(-1);
        if (latest?.title === lessonItem.sectionTitle) latest.lessons.push(lessonItem);
        else sections.push({ title: lessonItem.sectionTitle, lessons: [lessonItem] });
        return sections;
      }, []);
      return <article className="student-course-card" key={item.slug}>
        <span className="student-course-state">ثبت‌نام فعال</span><h2>{item.title}</h2><p>{item.description}</p>
        <div className="course-progress" aria-label={`پیشرفت ${percent} درصد`}><span style={{ width: `${percent}%` }} /></div>
        <div className="course-progress-copy"><strong>{percent}٪</strong><span>{availableLessons.filter((entry) => entry.percent === 100).length} از {availableLessons.length} درس در دسترس تکمیل شده</span></div>
        {nextLesson ? <Link className="button button-wide" href={`/learn/${item.slug}/${nextLesson.slug}`}>{percent === 100 ? "مرور آخرین درس" : "ادامه یادگیری"}</Link> : null}
        <div className="student-lesson-list">{lessonSections.map((section, sectionIndex) => <details className="student-lesson-section" key={section.title} open={sectionIndex === 0 || section.lessons.some((entry) => entry.lastViewedAt && entry.percent < 100)}>
          <summary><strong>{section.title}</strong><small>{section.lessons.length} درس</small></summary>
          <div className="student-lesson-branch">{section.lessons.map((entry) => entry.available ?
            <Link key={entry.id} href={`/learn/${item.slug}/${entry.slug}`}><span>{entry.title}</span><small>{entry.percent === 100 ? "تکمیل‌شده" : entry.lastViewedAt ? "ادامه" : "شروع"}</small></Link> :
            <div className="locked-lesson" key={entry.id}><span>{entry.title}</span><small>فعال‌سازی {entry.releaseAt.toLocaleDateString("fa-IR")}</small></div>
          )}</div>
        </details>)}</div>
      </article>;
    })}</div> : <div className="student-empty"><span aria-hidden="true">◇</span><h2>هنوز دوره‌ای برای شما فعال نشده است.</h2><p>می‌توانید دوره‌های رایگان را همان لحظه شروع کنید؛ برای دوره‌های دیگر نیز تیم آکادمی همراه شماست.</p><Link className="button" href="/courses">مشاهده دوره‌ها</Link></div>}
  </div></section>;
}
