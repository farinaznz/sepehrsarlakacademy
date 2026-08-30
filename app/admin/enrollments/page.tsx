import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "../../../db";
import { course, enrollment, user } from "../../../db/schema";
import { requireAdmin } from "../../../lib/session";
import { enrollStudent, revokeEnrollment } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  await requireAdmin();
  const db = getDb();
  const [students, courses, activeEnrollments] = await Promise.all([
    db.select({ id: user.id, name: user.name, email: user.email, phone: user.phoneNumber }).from(user).orderBy(desc(user.createdAt)),
    db.select({ id: course.id, title: course.title }).from(course).where(eq(course.status, "published")),
    db.select({ id: enrollment.id, student: user.name, email: user.email, course: course.title })
      .from(enrollment).innerJoin(user, eq(enrollment.userId, user.id)).innerJoin(course, eq(enrollment.courseId, course.id))
      .where(eq(enrollment.status, "active")).orderBy(desc(enrollment.enrolledAt)),
  ]);

  return (
    <section className="student-area section">
      <div className="container admin-enrollment-shell">
        <div className="student-heading">
          <div><span className="eyebrow">مدیریت آکادمی</span><h1>ثبت‌نام دستی هنرجو</h1><p>یک حساب هنرجویی را به دوره موردنظر متصل کنید.</p></div>
          <Link className="button button-ghost" href="/dashboard">بازگشت به داشبورد</Link>
        </div>
        <form className="admin-enrollment-form" action={enrollStudent}>
          <label>هنرجو<select name="userId" required defaultValue=""><option value="" disabled>انتخاب هنرجو</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.phone || student.email}</option>)}</select></label>
          <label>دوره<select name="courseId" required defaultValue=""><option value="" disabled>انتخاب دوره</option>{courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <button className="button" type="submit">فعال‌سازی ثبت‌نام</button>
        </form>
        <div className="admin-enrollment-list">
          <h2>ثبت‌نام‌های فعال</h2>
          {activeEnrollments.map((item) => (
            <div key={item.id}><span><strong>{item.student}</strong><small>{item.email}</small></span><span>{item.course}</span><form action={revokeEnrollment}><input type="hidden" name="enrollmentId" value={item.id} /><button type="submit">لغو دسترسی</button></form></div>
          ))}
          {!activeEnrollments.length ? <p>ثبت‌نام فعالی وجود ندارد.</p> : null}
        </div>
      </div>
    </section>
  );
}
