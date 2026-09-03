import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "../../../db";
import { course, lesson, lessonComment, profile, user, userRole } from "../../../db/schema";
import { userHasRole } from "../../../lib/auth-foundation";
import { requireLearningStaff } from "../../../lib/session";
import { moderateComment, saveLesson, setInstructorRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function LearningAdminPage() {
  const current = await requireLearningStaff();
  const db = getDb();
  const isAdmin = await userHasRole(current.user.id, "admin");
  const [lessons, pendingComments, users, instructors, courses] = await Promise.all([
    db.select({ id: lesson.id, courseId: lesson.courseId, slug: lesson.slug, title: lesson.title, summary: lesson.summary, content: lesson.content, position: lesson.position, courseTitle: course.title, published: lesson.published, dripDelayDays: lesson.dripDelayDays })
      .from(lesson).innerJoin(course, eq(course.id, lesson.courseId)).orderBy(asc(course.title), asc(lesson.position)),
    db.select({ id: lessonComment.id, body: lessonComment.body, createdAt: lessonComment.createdAt, author: profile.displayName, lessonTitle: lesson.title, courseTitle: course.title })
      .from(lessonComment).innerJoin(profile, eq(profile.userId, lessonComment.userId)).innerJoin(lesson, eq(lesson.id, lessonComment.lessonId)).innerJoin(course, eq(course.id, lesson.courseId))
      .where(eq(lessonComment.status, "pending")).orderBy(asc(lessonComment.createdAt)),
    isAdmin ? db.select({ id: user.id, name: user.name, email: user.email }).from(user).orderBy(desc(user.createdAt)) : Promise.resolve([]),
    isAdmin ? db.select({ userId: userRole.userId }).from(userRole).where(eq(userRole.roleId, "instructor")) : Promise.resolve([]),
    db.select({ id: course.id, title: course.title }).from(course).orderBy(asc(course.title)),
  ]);
  const instructorIds = new Set(instructors.map((item) => item.userId));

  return <section className="student-area section"><div className="container admin-learning-shell">
    <div className="student-heading"><div><span className="eyebrow">مدیریت آموزش</span><h1>محتوا و گفت‌وگوها</h1><p>انتشار، زمان‌بندی و بررسی دیدگاه‌های هنرجویان.</p></div><div className="student-actions">{isAdmin ? <Link className="button" href="/admin/enrollments">ثبت‌نام‌ها</Link> : null}<Link className="button button-ghost" href="/dashboard">داشبورد</Link></div></div>
    <section className="admin-learning-section"><h2>درس‌ها و انتشار قطره‌ای</h2>
      <details className="lesson-editor create-lesson"><summary>افزودن درس جدید</summary><form action={saveLesson}><label>دوره<select name="courseId" required defaultValue=""><option value="" disabled>انتخاب دوره</option>{courses.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>عنوان<input name="title" required /></label><label>نشانی انگلیسی<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label><label>خلاصه<input name="summary" /></label><label>متن درس<textarea name="content" required /></label><div className="lesson-editor-row"><label>ترتیب<input type="number" name="position" min="1" defaultValue="1" required /></label><label>روز پس از ثبت‌نام<input type="number" name="dripDelayDays" min="0" max="3650" defaultValue="0" required /></label><label><input type="checkbox" name="published" /> منتشر شود</label></div><button className="button button-small" type="submit">ساخت درس</button></form></details>
      <div className="admin-lesson-list">{lessons.map((item) => <details className="lesson-editor" key={item.id}><summary><span><strong>{item.title}</strong><small>{item.courseTitle} · روز {item.dripDelayDays} · {item.published ? "منتشرشده" : "پیش‌نویس"}</small></span></summary><form action={saveLesson}><input type="hidden" name="lessonId" value={item.id} /><input type="hidden" name="courseId" value={item.courseId} /><label>عنوان<input name="title" defaultValue={item.title} required /></label><label>نشانی انگلیسی<input name="slug" defaultValue={item.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label><label>خلاصه<input name="summary" defaultValue={item.summary} /></label><label>متن درس<textarea name="content" defaultValue={item.content} required /></label><div className="lesson-editor-row"><label>ترتیب<input type="number" name="position" min="1" defaultValue={item.position} required /></label><label>روز پس از ثبت‌نام<input type="number" name="dripDelayDays" min="0" max="3650" defaultValue={item.dripDelayDays} required /></label><label><input type="checkbox" name="published" defaultChecked={item.published} /> منتشر شده</label></div><button className="button button-small" type="submit">ذخیره درس</button></form></details>)}</div>
    </section>
    <section className="admin-learning-section"><h2>دیدگاه‌های در انتظار بررسی <small>{pendingComments.length}</small></h2><div className="moderation-list">{pendingComments.map((item) => <article key={item.id}><span>{item.courseTitle} · {item.lessonTitle}</span><h3>{item.author}</h3><p>{item.body}</p><time>{item.createdAt.toLocaleString("fa-IR")}</time><div><form action={moderateComment}><input type="hidden" name="commentId" value={item.id} /><input type="hidden" name="status" value="approved" /><button className="button button-small" type="submit">تأیید</button></form><form action={moderateComment}><input type="hidden" name="commentId" value={item.id} /><input type="hidden" name="status" value="rejected" /><button className="button button-small button-ghost" type="submit">رد</button></form></div></article>)}{!pendingComments.length ? <p>دیدگاهی در صف بررسی نیست.</p> : null}</div></section>
    {isAdmin ? <section className="admin-learning-section"><h2>دسترسی مدرس</h2><div className="admin-enrollment-list">{users.map((item) => { const enabled = instructorIds.has(item.id); return <div key={item.id}><span><strong>{item.name}</strong><small>{item.email}</small></span><span>{enabled ? "مدرس" : "هنرجو"}</span><form action={setInstructorRole}><input type="hidden" name="userId" value={item.id} /><input type="hidden" name="enabled" value={enabled ? "false" : "true"} /><button type="submit">{enabled ? "لغو نقش مدرس" : "اعطای نقش مدرس"}</button></form></div>; })}</div></section> : null}
  </div></section>;
}
