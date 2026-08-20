import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard, SectionHeading } from "../../components";
import { courses } from "../../data";
import { courseContents } from "../content";
import { CourseBody } from "../CourseBody";
import { CourseCoverSlideshow } from "../CourseCoverSlideshow";
import { withBasePath } from "../../site-path";

export const metadata: Metadata = {
  title: "دوره حضوری آشپزی – سطح مبانی",
  description: "دوره حضوری و عملی آشپزی سطح مبانی آکادمی سپهر سرلک؛ شش جلسه هشت‌ساعته در تهران.",
};

const course = courses[0];
const courseContent = courseContents.find((item) => item.slug === course.slug);

export default function FoundationsCoursePage() {
  const gallery = courseContent?.gallery?.length
    ? courseContent.gallery
    : [{ src: course.image, alt: course.title }];

  return (
    <>
      <section className="detail-hero">
        <div className="detail-hero-copy">
          <div className="breadcrumbs"><Link href="/">خانه</Link><span>/</span><Link href="/courses">دوره‌ها</Link><span>/</span><span>سطح مبانی</span></div>
          <span className="eyebrow eyebrow-light">دوره عملی · حضوری</span>
          <h1>{course.title}</h1>
          <p>نخستین دوره از مجموعه آموزش‌های عملی آکادمی؛ از شناخت پروتئین و آماده‌سازی مواد اولیه تا روش‌های پخت و اجرای بشقاب در یک آشپزخانه حرفه‌ای.</p>
          <div className="detail-rating"><strong>ثبت‌نام باز</strong><small>دوره بعدی: پنجشنبه‌ها و جمعه‌ها، مرداد و شهریور ۱۴۰۵</small></div>
        </div>
        <div className="detail-hero-image"><CourseCoverSlideshow slides={gallery} /><span>آموزش کاملاً عملی برای هر هنرجو</span></div>
      </section>

      <section className="course-facts"><div className="container facts-grid"><div><small>زمان‌بندی</small><strong>۶ جلسه ۸ ساعته</strong></div><div><small>ظرفیت</small><strong>۱۶ هنرجو</strong></div><div><small>محل برگزاری</small><strong>تهران، تجریش</strong></div><div><small>مدرسان</small><strong>سپهر سرلک و علی نادری</strong></div></div></section>

      <section className="detail-main section">
        <div className="container detail-layout">
          <div className="detail-content">
            <div className="detail-intro"><span className="eyebrow">درباره دوره</span><h2>از مفاهیم پایه<br />تا اجرای عملی</h2><p>مواد اولیه برای هر هنرجو به‌صورت جداگانه تأمین می‌شود. در هر جلسه، هنرجو بشقاب آموزش‌داده‌شده را آماده و پرزنت می‌کند و عملکرد او توسط مدرسان ارزیابی می‌شود.</p></div>
            <CourseBody blocks={courseContent?.body ?? []} />
          </div>

          <aside className="enroll-card">
            <span className="enroll-label">ثبت‌نام دوره</span>
            <div className="enroll-price"><strong>۹۵ میلیون</strong><span>تومان</span></div>
            <p>پرداخت نقدی یا اقساط منعطف؛ پرداخت نقدی شامل ۵ میلیون تومان تخفیف است.</p>
            <Link className="button button-wide" href="https://wa.me/989362233949">پیام برای ثبت‌نام</Link>
            <Link className="button button-ghost button-wide" href="/contact">مشاوره پیش از ثبت‌نام</Link>
            <ul><li>آموزش عملی در آشپزخانه صنعتی</li><li>مواد اولیه جداگانه برای هر هنرجو</li><li>پرسش و پاسخ تلگرامی تا سه ماه</li><li>گواهی‌نامه پایان دوره</li><li>ارزیابی عملکرد هر هنرجو</li></ul>
            <small>پیش‌نیاز: دوره آنلاین آشپزی – سطح پایه</small>
          </aside>
        </div>
      </section>

      <section className="instructor-section">
        <div className="container instructor-grid"><div className="instructor-image"><img src={withBasePath("/media/sepehr-about-bw.jpg")} alt="سپهر سرلک در آشپزخانه آکادمی" /></div><div><span className="eyebrow eyebrow-light">مدرسان دوره</span><h2>سپهر سرلک<br />و علی نادری</h2><p>تمام تمرین‌ها زیر نظر تیم آکادمی انجام می‌شود و هر هنرجو برای آماده‌سازی، اجرای بشقاب و تحلیل عملکرد خود بازخورد دریافت می‌کند.</p><div className="instructor-metrics"><span><strong>۶</strong> جلسه عملی</span><span><strong>۱۶</strong> نفر ظرفیت</span></div></div></div>
      </section>

      <section className="more-courses section"><div className="container"><div className="heading-row"><SectionHeading eyebrow="دیگر دوره‌ها" title="دوره‌ها و کارگاه‌های آکادمی" /><Link className="arrow-link large" href="/courses">همه دوره‌ها <span>←</span></Link></div><div className="course-grid">{courses.slice(1, 4).map((item) => <CourseCard key={item.slug} course={item} />)}</div></div></section>

      <section className="detail-final" id="enroll"><div className="container"><span className="eyebrow eyebrow-light">ثبت‌نام دوره حضوری</span><h2>پایه حرفه‌ای شما<br />از تمرین ساخته می‌شود.</h2><div><div className="enroll-price light"><strong>۹۵ میلیون</strong><span>تومان</span></div><Link className="button button-light" href="https://wa.me/989362233949">پیام در واتس‌اپ</Link></div></div></section>
    </>
  );
}
