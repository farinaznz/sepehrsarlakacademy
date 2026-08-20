import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "../site-path";

export const metadata: Metadata = {
  title: "درباره آکادمی",
  description: "درباره آکادمی آشپزی سپهر سرلک، بنیان‌گذار و تیم مدرسان آکادمی.",
};

const instructors = [
  {
    name: "علی نادری اصل",
    image: "/media/about/ali-naderi.jpg",
    alt: "علی نادری اصل، مدرس آکادمی سپهر سرلک",
    specialty: "آشپزی حرفه‌ای · آموزش عملی",
    bio: "علی نادری‌اصل با شش سال تجربه حرفه‌ای در صنعت رستوران و سابقه همکاری با آتلیه سپهر سرلک و رستوران دیوینا، آموزش را با صبر، دقت و تجربه واقعی آشپزخانه پیش می‌برد.",
  },
  {
    name: "نیما نعمتی",
    image: "/media/about/nima-nemati.jpg",
    alt: "نیما نعمتی، مدرس آکادمی سپهر سرلک",
    specialty: "آشپزی علمی · صبحانه",
    bio: "نیما نعمتی بیش از هشت سال سابقه آشپزی حرفه‌ای دارد. تمرکز او بر پیوند دادن اجرای عملی با دانش علمی آشپزی است تا هنرجو چرایی هر تکنیک را هم درک کند.",
  },
  {
    name: "بردیا مهاجر",
    image: "/media/about/bardia-mohajer.jpg",
    alt: "بردیا مهاجر، مدرس آکادمی سپهر سرلک",
    specialty: "آشپزی · نان و شیرینی",
    bio: "بردیا مهاجر با هشت سال تجربه در صنعت رستوران، در آشپزی، نان و شیرینی مهارت دارد. کلاس‌های او بر جزئیات، اجرای دقیق و تسلط کاربردی بر فرایندهای حرفه‌ای متمرکز است.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="catalog-hero about-hero-compact">
        <div className="container catalog-hero-grid">
          <div><span className="eyebrow eyebrow-light">درباره آکادمی</span><h1>یادگیری برای<br />ساختن یک مسیر واقعی.</h1></div>
          <div><p>آکادمی سپهر سرلک با هدف رشد آموزش حرفه‌ای در آشپزی، شیرینی‌پزی، نوشیدنی، مدیریت رستوران و میزبانی شکل گرفته است؛ جایی برای یاد گرفتن، تجربه کردن و پیش رفتن.</p><Link className="arrow-link light" href="#story">داستان آکادمی <span>↓</span></Link></div>
        </div>
      </section>

      <section className="about-story section" id="story">
        <div className="container about-story-grid">
          <div>
            <span className="eyebrow">چرا اینجا هستیم</span>
            <h2>استاندارد جهانی،<br />برای آشپزخانه امروز ایران.</h2>
          </div>
          <div className="about-story-copy">
            <p>ما از شیوه آموزش مدارس معتبر آشپزی جهان الهام می‌گیریم و آن را با نیازهای واقعی صنعت غذا و رستوران در ایران پیوند می‌دهیم. آکادمی برای کسانی است که تازه قدم در این مسیر می‌گذارند و همین‌طور حرفه‌ای‌هایی که هنوز مشتاق یادگیری‌اند.</p>
            <p>آموزش در اینجا به حفظ کردن دستورها محدود نمی‌شود. هنرجو ماده اولیه را می‌شناسد، منطق تکنیک را می‌فهمد، تمرین می‌کند و برای تصمیم‌گیری مستقل در یک آشپزخانه واقعی آماده می‌شود.</p>
          </div>
        </div>
        <div className="container about-values">
          <article><span>۰۱</span><h3>فهم عمیق</h3><p>چرایی هر فرایند را کنار روش اجرای آن یاد می‌گیریم.</p></article>
          <article><span>۰۲</span><h3>تمرین واقعی</h3><p>مهارت با تکرار هدفمند و بازخورد دقیق ساخته می‌شود.</p></article>
          <article><span>۰۳</span><h3>رشد مداوم</h3><p>تجربه پایان یادگیری نیست؛ نقطه شروع پرسش‌های بهتر است.</p></article>
        </div>
      </section>

      <section className="about-founder">
        <div className="about-founder-image"><img src={withBasePath("/media/about/sepehr-sarlak.jpg")} alt="سپهر سرلک، بنیان‌گذار آکادمی" /></div>
        <div className="about-founder-copy">
          <span className="eyebrow eyebrow-light">بنیان‌گذار آکادمی</span>
          <h2>سپهر سرلک</h2>
          <p className="about-founder-lead">سرآشپز، مدرس و بنیان‌گذار مجله تَنور؛ با نگاهی که سنت، تحقیق و آشپزی معاصر را کنار هم می‌نشاند.</p>
          <p>سپهر سرلک، متولد ۱۳۶۶ در اصفهان، پس از تحصیل در مهندسی شیمی و کار در سکوهای نفتی مسیر حرفه‌ای خود را به سوی آشپزی تغییر داد. او برای کسب دانش تخصصی به فرانسه رفت و در مدرسه لو کوردون بلو تحصیل کرد.</p>
          <p>هدف او در آکادمی، پرورش نسل تازه‌ای از آشپزان و متخصصان صنعت رستوران است. او همچنین با انتشار مجله تَنور به مستندسازی، تحقیق و معرفی جایگاه آشپزی ایرانی در جهان امروز می‌پردازد.</p>
          <blockquote>«هنرجو باید بتواند فکر کند، انتخاب کند و چیزی از خودش به آشپزی اضافه کند.»</blockquote>
        </div>
      </section>

      <section className="about-team section">
        <div className="container">
          <div className="heading-row">
            <div className="section-heading"><span className="eyebrow">تیم آموزش</span><h2>مدرسانی از دل آشپزخانه حرفه‌ای</h2><p>تجربه اجرایی، دانش فنی و توجه فردی به مسیر یادگیری هر هنرجو.</p></div>
          </div>
          <div className="about-team-grid">
            {instructors.map((instructor, index) => (
              <article className="about-team-card" key={instructor.name}>
                <div className="about-team-image"><img src={withBasePath(instructor.image)} alt={instructor.alt} loading={index === 0 ? "eager" : "lazy"} /></div>
                <div><span>{instructor.specialty}</span><h3>{instructor.name}</h3><p>{instructor.bio}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta-inner">
          <div><span className="eyebrow eyebrow-light">شروع مسیر</span><h2>آشپزی حرفه‌ای،<br />از یک انتخاب جدی شروع می‌شود.</h2></div>
          <div><p>دوره‌ای متناسب با تجربه، هدف و زمانی که در اختیار دارید پیدا کنید.</p><Link className="button button-light" href="/courses">مشاهده دوره‌ها</Link></div>
        </div>
      </section>
    </>
  );
}
