import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard, SectionHeading } from "../../components";
import { courses } from "../../data";

export const metadata: Metadata = {
  title: "دوره مبانی آشپزی حرفه‌ای",
  description: "دوره جامع مبانی آشپزی حرفه‌ای؛ آموزش تکنیک، شناخت مواد اولیه و نظم آشپزخانه.",
};

const course = courses[0];

export default function FoundationsCoursePage() {
  return (
    <>
      <section className="detail-hero">
        <div className="detail-hero-copy">
          <div className="breadcrumbs"><Link href="/">خانه</Link><span>/</span><Link href="/courses">دوره‌ها</Link><span>/</span><span>مبانی آشپزی</span></div>
          <span className="eyebrow eyebrow-light">دوره جامع · آنلاین</span>
          <h1>{course.title}</h1>
          <p>یک مسیر ساختاریافته برای کسانی که می‌خواهند آشپزی را اصولی شروع کنند، تکنیک را بفهمند و در آشپزخانه با اطمینان تصمیم بگیرند.</p>
          <div className="detail-rating"><strong>۴٫۹</strong><span>★★★★★</span><small>از ۱۸۶ هنرجو</small></div>
        </div>
        <div className="detail-hero-image"><img src={course.image} alt="نمونه بشقاب حرفه‌ای از دوره مبانی آشپزی" /><span>از مواد اولیه تا بشقاب نهایی</span></div>
      </section>

      <section className="course-facts"><div className="container facts-grid"><div><small>مدت دوره</small><strong>۱۲ هفته</strong></div><div><small>محتوای آموزشی</small><strong>۴۸ درس ویدیویی</strong></div><div><small>سطح دوره</small><strong>بدون پیش‌نیاز</strong></div><div><small>پشتیبانی</small><strong>بازخورد استاد</strong></div></div></section>

      <section className="detail-main section">
        <div className="container detail-layout">
          <div className="detail-content">
            <div className="detail-intro"><span className="eyebrow">درباره دوره</span><h2>از اجرای دستور<br />به درک آشپزی برسید.</h2><p>این دوره مجموعه‌ای از ویدیوهای پراکنده نیست. هر فصل بر فصل قبلی بنا می‌شود تا شناخت مواد، کنترل حرارت، کار با ابزار و سازماندهی آشپزخانه به یک مهارت منسجم تبدیل شود.</p></div>
            <div className="learning-outcomes">
              <h3>در پایان این دوره می‌توانید:</h3>
              <ul><li><span>01</span>ابزار و ایستگاه کاری خود را حرفه‌ای سازماندهی کنید.</li><li><span>02</span>حرارت و روش پخت مناسب هر ماده را انتخاب کنید.</li><li><span>03</span>برش‌های پایه را دقیق، سریع و ایمن انجام دهید.</li><li><span>04</span>استاک‌ها، سس‌های پایه و ساختار طعم را بسازید.</li><li><span>05</span>اشتباه‌های رایج را تحلیل و مستقل اصلاح کنید.</li><li><span>06</span>یک بشقاب متعادل را از ایده تا اجرا پیش ببرید.</li></ul>
            </div>
            <div className="curriculum">
              <div className="curriculum-head"><div><span className="eyebrow">سرفصل‌ها</span><h2>یک مسیر قدم‌به‌قدم</h2></div><p>۸ فصل · ۴۸ درس · ۲۴ ساعت ویدیو</p></div>
              <details open><summary><span><b>فصل ۱</b>ذهنیت و نظم آشپزخانه حرفه‌ای</span><small>۵ درس · ۱:۴۰ ساعت</small></summary><div><p>لباس و ایمنی، بهداشت، ایستگاه کاری، برنامه‌ریزی و زبان مشترک آشپزخانه.</p></div></details>
              <details><summary><span><b>فصل ۲</b>ابزار و مهارت چاقو</span><small>۷ درس · ۳:۱۰ ساعت</small></summary><div><p>شناخت چاقوها، نگهداری، تیز کردن و اجرای برش‌های پایه.</p></div></details>
              <details><summary><span><b>فصل ۳</b>شناخت مواد اولیه</span><small>۸ درس · ۴:۰۰ ساعت</small></summary><div><p>انتخاب، نگهداری و آماده‌سازی سبزیجات، پروتئین‌ها و لبنیات.</p></div></details>
              <details><summary><span><b>فصل ۴</b>حرارت و روش‌های پخت</span><small>۶ درس · ۳:۲۰ ساعت</small></summary><div><p>رسانش، همرفت، تابش و کنترل واکنش‌های اصلی در پخت.</p></div></details>
              <details><summary><span><b>فصل ۵ تا ۸</b>استاک، سس، پروتئین و پروژه نهایی</span><small>۲۲ درس · ۱۱:۵۰ ساعت</small></summary><div><p>ساخت پایه‌های طعم و اجرای یک منوی کامل به عنوان پروژه پایان دوره.</p></div></details>
            </div>
          </div>

          <aside className="enroll-card">
            <span className="enroll-label">ثبت‌نام دوره</span>
            <div className="enroll-price"><strong>{course.price}</strong><span>تومان</span></div>
            <p>دسترسی یک‌ساله به محتوای دوره</p>
            <Link className="button button-wide" href="#enroll">ثبت‌نام و شروع یادگیری</Link>
            <Link className="button button-ghost button-wide" href="#consult">مشاوره پیش از ثبت‌نام</Link>
            <ul><li>۴۸ درس ویدیویی با کیفیت HD</li><li>جزوه و تمرین‌های قابل دانلود</li><li>بازخورد روی تمرین‌های منتخب</li><li>گواهی پایان دوره</li><li>دسترسی از موبایل و دسکتاپ</li></ul>
            <small>۷ روز ضمانت بازگشت وجه</small>
          </aside>
        </div>
      </section>

      <section className="instructor-section">
        <div className="container instructor-grid"><div className="instructor-image"><img src="/media/hero.jpg" alt="سپهر سرلک در آشپزخانه آکادمی" /></div><div><span className="eyebrow eyebrow-light">مدرس دوره</span><h2>سپهر سرلک</h2><blockquote>«در این دوره تلاش کرده‌ام چیزهایی را آموزش بدهم که ای کاش در شروع مسیر حرفه‌ای کسی روشن و منظم به من می‌گفت.»</blockquote><p>شف، مدرس و مشاور صنعت غذا با بیش از پانزده سال تجربه در آشپزخانه‌های حرفه‌ای و توسعه تیم‌های آشپزی.</p><div className="instructor-metrics"><span><strong>۱۵+</strong> سال تجربه</span><span><strong>۳٬۴۰۰+</strong> هنرجو</span></div></div></div>
      </section>

      <section className="student-voice section"><div className="container"><SectionHeading eyebrow="تجربه هنرجویان" title="یادگیری‌ای که اعتماد می‌سازد" /><div className="voice-card"><span className="voice-stars">★★★★★</span><blockquote>«قبل از دوره، برای هر غذا دنبال دستور بودم. حالا وقتی ماده‌ای عوض می‌شود یا نتیجه درست نیست، می‌فهمم چه اتفاقی افتاده و چطور باید اصلاحش کنم.»</blockquote><div><strong>سارا امیری</strong><span>هنرجوی دوره مبانی · دوره چهارم</span></div></div></div></section>

      <section className="more-courses section"><div className="container"><div className="heading-row"><SectionHeading eyebrow="ادامه مسیر" title="بعد از مبانی، تخصص خود را بسازید" /><Link className="arrow-link large" href="/courses">همه دوره‌ها <span>←</span></Link></div><div className="course-grid">{courses.slice(1, 4).map((item) => <CourseCard key={item.slug} course={item} />)}</div></div></section>

      <section className="detail-final" id="enroll"><div className="container"><span className="eyebrow eyebrow-light">آماده شروع هستید؟</span><h2>پایه حرفه‌ای شما<br />از همین‌جا ساخته می‌شود.</h2><div><div className="enroll-price light"><strong>{course.price}</strong><span>تومان</span></div><Link className="button button-light" href="/courses">ثبت‌نام در دوره</Link></div></div></section>
    </>
  );
}
