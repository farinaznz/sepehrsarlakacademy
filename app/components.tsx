import Link from "next/link";
import type { Course } from "./data";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="آکادمی سپهر سرلک، صفحه نخست">
      <span
        className="brand-symbol"
        aria-hidden="true"
        style={{
          display: "block",
          width: 72,
          height: 52,
          flex: "0 0 72px",
          backgroundImage: "url('/favicon.svg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="راهبری اصلی">
          <Link href="/courses">دوره‌ها</Link>
          <Link href="/journal">مجله</Link>
          <Link href="/about">درباره آکادمی</Link>
        </nav>
        <div className="header-actions">
          <Link className="text-link desktop-only" href="/login">ورود هنرجویان</Link>
          <Link className="button button-small" href="/courses">انتخاب دوره</Link>
          <details className="mobile-menu">
            <summary aria-label="باز کردن منو"><span></span><span></span></summary>
            <nav aria-label="راهبری موبایل">
              <Link href="/courses">دوره‌ها</Link>
              <Link href="/journal">مجله</Link>
              <Link href="/about">درباره آکادمی</Link>
              <Link href="/login">ورود هنرجویان</Link>
              <Link href="/courses">انتخاب دوره</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-intro">
          <Brand />
          <p>آموزش حرفه‌ای آشپزی برای ساختن مسیر، مهارت و نگاه شخصی شما.</p>
        </div>
        <div>
          <h3>آکادمی</h3>
          <Link href="/courses">همه دوره‌ها</Link>
          <Link href="/#method">روش آموزش</Link>
          <Link href="/about">درباره ما</Link>
        </div>
        <div>
          <h3>همراهی</h3>
          <Link href="/journal">مجله آکادمی</Link>
          <Link href="/contact">مشاوره انتخاب دوره</Link>
          <Link href="/courses">پرسش‌های متداول</Link>
          <Link href="/courses">قوانین آکادمی</Link>
        </div>
        <div>
          <h3><Link href="/contact">تماس با ما</Link></h3>
          <p>تهران، میدان تجریش</p>
          <a href="tel:+989362233949" dir="ltr">+98 936 223 3949</a>
          <a href="mailto:sepehrsarlakacademy@gmail.com">sepehrsarlakacademy@gmail.com</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© ۱۴۰۵ آکادمی سپهر سرلک</span>
        <span>ساخته‌شده برای یادگیری عمیق</span>
      </div>
    </footer>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function CourseCard({ course, priority = false }: { course: Course; priority?: boolean }) {
  const href = course.href;
  return (
    <article className="course-card">
      <Link className="course-image" href={href} aria-label={`مشاهده دوره ${course.title}`}>
        <img src={course.image} alt="" loading={priority ? "eager" : "lazy"} />
        <span>{course.format}</span>
      </Link>
      <div className="course-card-body">
        <div className="course-kicker"><span>{course.category}</span><span>{course.availability}</span></div>
        <h3><Link href={href}>{course.title}</Link></h3>
        <p>{course.subtitle}</p>
        <div className="course-meta"><span>{course.duration}</span><span>{course.lessons}</span></div>
        <div className="course-card-footer">
          <strong>{course.price}</strong>
          <Link className="arrow-link" href={href}>جزئیات دوره <span>←</span></Link>
        </div>
      </div>
    </article>
  );
}
