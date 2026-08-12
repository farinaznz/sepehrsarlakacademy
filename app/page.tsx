import Link from "next/link";
import { CourseCard, SectionHeading } from "./components";
import { courses } from "./data";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-visual">
          <img src="/media/hero.jpg" alt="سپهر سرلک در حال آموزش در آشپزخانه آکادمی" />
          <div className="hero-caption"><span>01</span><p>تکنیک، تمرین، تکرار<br />زیر نظر یک شف حرفه‌ای</p></div>
        </div>
        <div className="hero-content">
          <div>
            <span className="eyebrow">آکادمی حرفه‌ای آشپزی</span>
            <h1>آشپزی، فقط<br />دستور پخت نیست.</h1>
            <p className="hero-lead">اینجا یاد می‌گیرید مثل یک آشپز حرفه‌ای فکر کنید؛ مواد را بشناسید، تکنیک را بفهمید و امضای خودتان را بسازید.</p>
            <div className="hero-actions">
              <Link className="button" href="/courses">دیدن دوره‌ها</Link>
              <Link className="button button-ghost" href="#consultation">مشاوره انتخاب مسیر</Link>
            </div>
          </div>
          <div className="hero-note"><span></span><p>حضوری در تهران<br />آنلاین در سراسر ایران</p></div>
        </div>
      </section>

      <section className="path-section section" id="method">
        <div className="container">
          <SectionHeading eyebrow="مسیر یادگیری" title="از هرجا هستید، جدی یاد بگیرید." copy="دو شیوه آموزش با یک استاندارد؛ تمرین واقعی، بازخورد دقیق و همراهی تا رسیدن به مهارت." />
          <div className="path-grid">
            <Link href="/courses" className="path-card path-card-dark">
              <span className="path-number">01</span>
              <div><small>تجربه در آشپزخانه</small><h3>دوره‌های حضوری</h3><p>کلاس‌های کم‌جمعیت، تجهیزات حرفه‌ای و بازخورد مستقیم استاد.</p></div>
              <span className="path-arrow">←</span>
            </Link>
            <Link href="/courses" className="path-card path-card-image">
              <img src="/media/course-foundations.jpg" alt="بشقاب حرفه‌ای آماده‌شده در آکادمی" />
              <span className="path-number">02</span>
              <div><small>یادگیری منعطف</small><h3>دوره‌های آنلاین</h3><p>درس‌های مرحله‌به‌مرحله، تمرین عملی و پشتیبانی آموزشی.</p></div>
              <span className="path-arrow">←</span>
            </Link>
            <Link href="/courses" className="path-card path-card-accent">
              <span className="path-number">03</span>
              <div><small>برای آینده شغلی</small><h3>مسیر حرفه‌ای</h3><p>برنامه‌ای منسجم برای ورود جدی به صنعت غذا و مهمان‌نوازی.</p></div>
              <span className="path-arrow">←</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-section section">
        <div className="container">
          <div className="heading-row">
            <SectionHeading eyebrow="دوره‌های منتخب" title="برای ساختن یک پایه محکم" />
            <Link className="arrow-link large" href="/courses">مشاهده همه دوره‌ها <span>←</span></Link>
          </div>
          <div className="course-grid course-grid-featured">
            {courses.slice(0, 3).map((course, index) => <CourseCard key={course.slug} course={course} priority={index === 0} />)}
          </div>
        </div>
      </section>

      <section className="manifesto section">
        <div className="container manifesto-grid">
          <div className="manifesto-index"><span>روش ما</span><strong>03</strong></div>
          <div className="manifesto-copy">
            <p className="quote-mark">“</p>
            <h2>دستور پخت را می‌توان پیدا کرد؛ چیزی که باید آموخت، <em>درکِ پشت آن</em> است.</h2>
            <p>آموزش در آکادمی بر حفظ کردن متکی نیست. هر درس از شناخت ماده اولیه شروع می‌شود، با فهم تکنیک ادامه پیدا می‌کند و به توانایی تصمیم‌گیری در آشپزخانه می‌رسد.</p>
            <div className="principles">
              <div><span>01</span><h3>درک عمیق</h3><p>چرایی هر تکنیک را می‌آموزید، نه فقط ترتیب مراحل را.</p></div>
              <div><span>02</span><h3>تمرین هدفمند</h3><p>هر تمرین برای ساختن یک مهارت مشخص طراحی شده است.</p></div>
              <div><span>03</span><h3>بازخورد واقعی</h3><p>اشتباه‌ها دیده می‌شوند و مسیر اصلاح روشن می‌ماند.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="chef-section" id="chef">
        <div className="chef-image"><img src="/media/story.jpg" alt="نمونه‌ای از تجربه و استاندارد ارائه غذا در آکادمی" /></div>
        <div className="chef-copy">
          <span className="eyebrow eyebrow-light">شف و بنیان‌گذار آکادمی</span>
          <h2>سپهر سرلک</h2>
          <blockquote>«هدف من تربیت آشپزی نیست که فقط دستور اجرا کند؛ می‌خواهم هنرجو بتواند فکر کند، انتخاب کند و خلق کند.»</blockquote>
          <p>تجربه سال‌ها کار در آشپزخانه حرفه‌ای، توسعه منو و آموزش، در یک مسیر روشن و قابل تمرین جمع شده است.</p>
          <Link className="arrow-link light" href="/courses">آشنایی بیشتر با رویکرد آکادمی <span>←</span></Link>
          <div className="chef-stats"><div><strong>۱۵+</strong><span>سال تجربه حرفه‌ای</span></div><div><strong>۳٬۴۰۰+</strong><span>هنرجوی آکادمی</span></div></div>
        </div>
      </section>

      <section className="results-section section">
        <div className="container">
          <SectionHeading eyebrow="نتیجه آموزش" title="مهارتی که در کار دیده می‌شود" />
          <div className="results-grid">
            <div><strong>۴٫۹</strong><span>از ۵</span><p>میانگین رضایت هنرجویان</p></div>
            <div><strong>۸۷٪</strong><p>تکمیل دوره‌های ساختاریافته</p></div>
            <div><strong>۴۸</strong><span>ساعت</span><p>تمرین در مسیر پایه</p></div>
            <div className="testimonial"><p>«برای اولین‌بار فهمیدم چرا یک تکنیک جواب می‌دهد. حالا در آشپزخانه، وابسته به دستور نیستم.»</p><span>— هنرجوی دوره مبانی</span></div>
          </div>
        </div>
      </section>

      <section className="journal-section section" id="journal">
        <div className="container">
          <div className="heading-row"><SectionHeading eyebrow="مجله آکادمی" title="خواندنی برای آشپزهای کنجکاو" /><Link className="arrow-link large" href="/courses">همه مطالب <span>←</span></Link></div>
          <div className="journal-grid">
            <article className="journal-main"><img src="/media/course-bread.jpg" alt="بافت داخلی نان خمیرترش" /><div><small>دانش مواد اولیه · ۸ دقیقه</small><h3>خمیرترش؛ گفت‌وگوی زمان، دما و باکتری</h3><Link className="arrow-link" href="/courses">ادامه مطلب <span>←</span></Link></div></article>
            <div className="journal-list">
              <article><span>تکنیک</span><h3>چطور چاقوی آشپزخانه را انتخاب و نگهداری کنیم؟</h3><small>۶ دقیقه مطالعه</small></article>
              <article><span>مسیر حرفه‌ای</span><h3>اولین روز در یک آشپزخانه حرفه‌ای</h3><small>۹ دقیقه مطالعه</small></article>
              <article><span>نگاه شف</span><h3>چرا سادگی در بشقاب، دشوارترین انتخاب است؟</h3><small>۵ دقیقه مطالعه</small></article>
            </div>
          </div>
        </div>
      </section>

      <section className="consultation" id="consultation">
        <div className="container consultation-inner">
          <span className="eyebrow eyebrow-light">شروع مسیر</span>
          <h2>نمی‌دانید کدام دوره<br />برای شما مناسب است؟</h2>
          <p>در یک گفت‌وگوی کوتاه، هدف و سطح فعلی شما را می‌سنجیم و مسیر مناسب را پیشنهاد می‌دهیم.</p>
          <Link className="button button-light" href="/courses">درخواست مشاوره رایگان</Link>
        </div>
      </section>
    </>
  );
}
