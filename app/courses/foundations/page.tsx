import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard, SectionHeading } from "../../components";
import { courses } from "../../data";

export const metadata: Metadata = {
  title: "دوره حضوری آشپزی – سطح مبانی",
  description: "دوره حضوری و عملی آشپزی سطح مبانی آکادمی سپهر سرلک؛ شش جلسه هشت‌ساعته در تهران.",
};

const course = courses[0];

export default function FoundationsCoursePage() {
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
        <div className="detail-hero-image"><img src={course.image} alt="کارپاچیو، تصویر شاخص دوره حضوری آشپزی سطح مبانی" /><span>آموزش کاملاً عملی برای هر هنرجو</span></div>
      </section>

      <section className="course-facts"><div className="container facts-grid"><div><small>زمان‌بندی</small><strong>۶ جلسه ۸ ساعته</strong></div><div><small>ظرفیت</small><strong>۱۶ هنرجو</strong></div><div><small>محل برگزاری</small><strong>تهران، تجریش</strong></div><div><small>مدرسان</small><strong>سپهر سرلک و علی نادری</strong></div></div></section>

      <section className="detail-main section">
        <div className="container detail-layout">
          <div className="detail-content">
            <div className="detail-intro"><span className="eyebrow">درباره دوره</span><h2>از مفاهیم پایه<br />تا اجرای عملی</h2><p>مواد اولیه برای هر هنرجو به‌صورت جداگانه تأمین می‌شود. در هر جلسه، هنرجو بشقاب آموزش‌داده‌شده را آماده و پرزنت می‌کند و عملکرد او توسط مدرسان ارزیابی می‌شود.</p></div>
            <div className="learning-outcomes">
              <h3>در این دوره چه می‌آموزید؟</h3>
              <ul><li><span>01</span>شناخت انواع پروتئین؛ گوشت قرمز، مرغ، ماهی و تخم‌مرغ</li><li><span>02</span>تکنیک‌های اصلی قصابی و آماده‌سازی مواد اولیه</li><li><span>03</span>روش‌های پخت مانند رُست، بریز، سوته و کنفی</li><li><span>04</span>اصول mise en place، بهداشت، نظم و زمان‌بندی</li><li><span>05</span>اجرای تمرینی بشقاب‌های کلاسیک و مدرن</li><li><span>06</span>آماده‌سازی و ارائه ۱۵ بشقاب نهایی توسط هنرجو</li></ul>
            </div>
            <div className="curriculum">
              <div className="curriculum-head"><div><span className="eyebrow">ساختار آموزش</span><h2>تمرین در آشپزخانه واقعی</h2></div><p>۶ جلسه · مجموعاً ۴۸ ساعت</p></div>
              <details open><summary><span><b>بخش ۱</b>پروتئین‌ها و آماده‌سازی</span></summary><div><p>شناخت گوشت قرمز، مرغ، ماهی و تخم‌مرغ و اجرای تکنیک‌های اصلی قصابی و آماده‌سازی.</p></div></details>
              <details><summary><span><b>بخش ۲</b>روش‌های پخت</span></summary><div><p>تمرین روش‌هایی مانند رُست کردن، بریز کردن، سوته کردن و کنفی کردن.</p></div></details>
              <details><summary><span><b>بخش ۳</b>نظم و مدیریت ایستگاه</span></summary><div><p>تمرین mise en place، بهداشت، نظم و زمان‌بندی در محیط حرفه‌ای آشپزخانه.</p></div></details>
              <details><summary><span><b>بخش ۴</b>اجرا، پرزنت و ارزیابی</span></summary><div><p>آماده‌سازی بشقاب‌ها توسط هنرجو، ارائه نهایی و دریافت ارزیابی مستقیم از مدرسان.</p></div></details>
            </div>
          </div>

          <aside className="enroll-card">
            <span className="enroll-label">ثبت‌نام دوره</span>
            <div className="enroll-price"><strong>۹۵ میلیون</strong><span>تومان</span></div>
            <p>پرداخت نقدی یا اقساط منعطف؛ پرداخت نقدی شامل ۵ میلیون تومان تخفیف است.</p>
            <Link className="button button-wide" href="https://wa.me/989362233949">پیام برای ثبت‌نام</Link>
            <Link className="button button-ghost button-wide" href="https://wa.me/989362233949">مشاوره پیش از ثبت‌نام</Link>
            <ul><li>آموزش عملی در آشپزخانه صنعتی</li><li>مواد اولیه جداگانه برای هر هنرجو</li><li>پرسش و پاسخ تلگرامی تا سه ماه</li><li>گواهی‌نامه پایان دوره</li><li>ارزیابی عملکرد هر هنرجو</li></ul>
            <small>پیش‌نیاز: دوره آنلاین آشپزی – سطح پایه</small>
          </aside>
        </div>
      </section>

      <section className="instructor-section">
        <div className="container instructor-grid"><div className="instructor-image"><img src="/media/sepehr-about-bw.jpg" alt="سپهر سرلک در آشپزخانه آکادمی" /></div><div><span className="eyebrow eyebrow-light">مدرسان دوره</span><h2>سپهر سرلک<br />و علی نادری</h2><p>تمام تمرین‌ها زیر نظر تیم آکادمی انجام می‌شود و هر هنرجو برای آماده‌سازی، اجرای بشقاب و تحلیل عملکرد خود بازخورد دریافت می‌کند.</p><div className="instructor-metrics"><span><strong>۶</strong> جلسه عملی</span><span><strong>۱۶</strong> نفر ظرفیت</span></div></div></div>
      </section>

      <section className="more-courses section"><div className="container"><div className="heading-row"><SectionHeading eyebrow="دیگر دوره‌ها" title="دوره‌ها و کارگاه‌های آکادمی" /><Link className="arrow-link large" href="/courses">همه دوره‌ها <span>←</span></Link></div><div className="course-grid">{courses.slice(1, 4).map((item) => <CourseCard key={item.slug} course={item} />)}</div></div></section>

      <section className="detail-final" id="enroll"><div className="container"><span className="eyebrow eyebrow-light">ثبت‌نام دوره حضوری</span><h2>پایه حرفه‌ای شما<br />از تمرین ساخته می‌شود.</h2><div><div className="enroll-price light"><strong>۹۵ میلیون</strong><span>تومان</span></div><Link className="button button-light" href="https://wa.me/989362233949">پیام در واتس‌اپ</Link></div></div></section>
    </>
  );
}
