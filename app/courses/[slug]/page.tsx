import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCard } from "../../components";
import { courses } from "../../data";
import { courseContents } from "../content";
import { CourseCoverSlideshow } from "../CourseCoverSlideshow";
import { CourseBody } from "../CourseBody";
import { withBasePath } from "../../site-path";

type CoursePageProps = { params: Promise<{ slug: string }> };

function getCourse(slug: string) {
  const course = courses.find((item) => item.slug === slug);
  const content = courseContents.find((item) => item.slug === slug);
  return course && content ? { course, content } : null;
}

export function generateStaticParams() {
  return courseContents.map((course) => ({ slug: course.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const result = getCourse((await params).slug);
  if (!result) return {};
  return {
    title: result.course.title,
    description: result.course.subtitle,
    openGraph: { images: [{ url: withBasePath(result.content.cover || result.course.image), alt: result.content.coverAlt }] },
  };
}

export default async function MigratedCoursePage({ params }: CoursePageProps) {
  const result = getCourse((await params).slug);
  if (!result) notFound();
  const { course, content } = result;
  const gallery = content.gallery?.length
    ? content.gallery
    : [{ src: content.cover || course.image, alt: content.coverAlt || course.title }];
  const related = courses.filter((item) => item.slug !== course.slug).slice(0, 3);

  return (
    <>
      <section className="detail-hero migrated-course-hero">
        <div className="detail-hero-copy">
          <div className="breadcrumbs"><Link href="/">خانه</Link><span>/</span><Link href="/courses">دوره‌ها</Link><span>/</span><span>{course.level}</span></div>
          <span className="eyebrow eyebrow-light">{course.category} · {course.format}</span>
          <h1>{course.title}</h1>
          <p>{course.subtitle}</p>
          <div className="detail-rating"><span>★★★★★</span><small>{course.availability}</small></div>
        </div>
        <div className="detail-hero-image"><CourseCoverSlideshow slides={gallery} /><span>{course.format} · {course.level}</span></div>
      </section>

      <section className="course-facts">
        <div className="container facts-grid">
          <div><small>شیوه برگزاری</small><strong>{course.format}</strong></div>
          <div><small>زمان‌بندی</small><strong>{course.duration}</strong></div>
          <div><small>جزئیات</small><strong>{course.lessons}</strong></div>
          <div><small>سطح دوره</small><strong>{course.level}</strong></div>
        </div>
      </section>

      <section className="detail-main section">
        <div className="container detail-layout">
          <div className="detail-content">
            <div className="detail-intro">
              <span className="eyebrow">درباره دوره</span>
              <h2>آموزش ساختاریافته،<br />تمرین در مسیر حرفه‌ای</h2>
              <p>{content.summary || course.subtitle}</p>
            </div>
            <CourseBody blocks={content.body} />
          </div>
          <aside className="enroll-card">
            <span className="enroll-label">شهریه دوره</span>
            <div className="enroll-price"><strong>{course.price}</strong></div>
            <p>{course.availability}</p>
            <Link className="button" href="https://wa.me/989362233949">درخواست ثبت‌نام</Link>
            <Link className="button button-ghost" href="/courses">بازگشت به دوره‌ها</Link>
            <ul><li>{course.format}</li><li>{course.duration}</li><li>{course.lessons}</li><li>{course.level}</li></ul>
            <small>برای زمان‌بندی و شرایط ثبت‌نام با آکادمی در ارتباط باشید.</small>
          </aside>
        </div>
      </section>

      <section className="more-courses section">
        <div className="container">
          <div className="heading-row"><div><span className="eyebrow">ادامه مسیر</span><h2 className="more-courses-title">دیگر دوره‌ها و کارگاه‌ها</h2></div><Link className="arrow-link large" href="/courses">همه دوره‌ها <span>←</span></Link></div>
          <div className="course-grid">{related.map((item) => <CourseCard key={item.slug} course={item} />)}</div>
        </div>
      </section>
    </>
  );
}
