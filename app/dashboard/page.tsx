import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "../../db";
import { course, enrollment, lesson, lessonProgress, profile } from "../../db/schema";
import { userHasRole } from "../../lib/auth-foundation";
import { requireSession } from "../../lib/session";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const current = await requireSession();
  const db = getDb();
  const [studentProfile] = await db.select().from(profile).where(eq(profile.userId, current.user.id)).limit(1);
  const isAdmin = await userHasRole(current.user.id, "admin");
  const rows = await db
    .select({
      enrollmentId: enrollment.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      lessonPosition: lesson.position,
      progress: lessonProgress.percent,
    })
    .from(enrollment)
    .innerJoin(course, eq(enrollment.courseId, course.id))
    .leftJoin(lesson, and(eq(lesson.courseId, course.id), eq(lesson.published, true)))
    .leftJoin(
      lessonProgress,
      and(eq(lessonProgress.lessonId, lesson.id), eq(lessonProgress.userId, current.user.id)),
    )
    .where(and(eq(enrollment.userId, current.user.id), eq(enrollment.status, "active")))
    .orderBy(asc(course.title), asc(lesson.position));

  const enrolledCourses = new Map<string, {
    title: string;
    slug: string;
    lessons: Array<{ slug: string; title: string; progress: number }>;
  }>();
  for (const row of rows) {
    const entry = enrolledCourses.get(row.enrollmentId) ?? {
      title: row.courseTitle,
      slug: row.courseSlug,
      lessons: [],
    };
    if (row.lessonSlug && row.lessonTitle) {
      entry.lessons.push({ slug: row.lessonSlug, title: row.lessonTitle, progress: row.progress ?? 0 });
    }
    enrolledCourses.set(row.enrollmentId, entry);
  }

  return (
    <section className="student-area section">
      <div className="container">
        <div className="student-heading">
          <div>
            <span className="eyebrow">فضای هنرجویی</span>
            <h1>سلام، {studentProfile?.displayName || current.user.name}</h1>
            <p>دوره‌ها و مسیر یادگیری شما از اینجا در دسترس است.</p>
          </div>
          <div className="student-actions">
            {isAdmin ? <Link className="button" href="/admin/enrollments">مدیریت ثبت‌نام‌ها</Link> : null}
            <SignOutButton />
          </div>
        </div>

        {enrolledCourses.size ? (
          <div className="student-course-grid">
            {[...enrolledCourses.values()].map((item) => {
              const completed = item.lessons.filter((entry) => entry.progress === 100).length;
              return (
                <article className="student-course-card" key={item.slug}>
                  <span className="student-course-state">ثبت‌نام فعال</span>
                  <h2>{item.title}</h2>
                  <p>{completed} از {item.lessons.length} درس تکمیل شده</p>
                  <div className="student-lesson-list">
                    {item.lessons.map((entry) => (
                      <Link key={entry.slug} href={`/learn/${item.slug}/${entry.slug}`}>
                        <span>{entry.title}</span><small>{entry.progress === 100 ? "تکمیل‌شده" : "مشاهده درس"}</small>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="student-empty">
            <span aria-hidden="true">◇</span>
            <h2>هنوز دوره‌ای برای شما فعال نشده است.</h2>
            <p>پس از ثبت‌نام دستی توسط تیم آکادمی، دوره و درس‌های آن اینجا نمایش داده می‌شود.</p>
            <Link className="button" href="/contact">ارتباط با آکادمی</Link>
          </div>
        )}
      </div>
    </section>
  );
}
