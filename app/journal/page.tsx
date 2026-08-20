import type { Metadata } from "next";
import Link from "next/link";
import { articlePreview, articles } from "./data";
import { JournalClient } from "./JournalClient";

export const metadata: Metadata = {
  title: "مجله آکادمی",
  description: "مقاله‌ها، تکنیک‌ها، دستورها و روایت‌های دنیای آشپزی در مجله آکادمی سپهر سرلک.",
};

export default function JournalPage() {
  const articlePreviews = articles.map(articlePreview);
  return (
    <>
      <section className="journal-hero">
        <div className="container journal-hero-grid">
          <div>
            <span className="eyebrow eyebrow-light">مجله آکادمی</span>
            <h1>دانش آشپزی،<br />فراتر از دستور پخت.</h1>
          </div>
          <div>
            <p>از علم پشت تکنیک‌ها تا مسیر حرفه‌ای سرآشپزها؛ مجموعه‌ای از {articles.length.toLocaleString("fa-IR")} مطلب برای نگاه دقیق‌تر به آشپزی.</p>
            <Link className="arrow-link light" href="#articles">مشاهده همه مطالب <span>↓</span></Link>
          </div>
        </div>
      </section>
      <section className="journal-catalog section" id="articles">
        <div className="container"><JournalClient articles={articlePreviews} /></div>
      </section>
      <section className="journal-cta">
        <div className="container journal-cta-inner">
          <div><span className="eyebrow">از خواندن تا تمرین</span><h2>دانش را در آشپزخانه به مهارت تبدیل کنید.</h2></div>
          <p>دوره‌های آکادمی برای تمرین هدفمند، بازخورد واقعی و ساختن درک عمیق طراحی شده‌اند.</p>
          <Link className="button" href="/courses">مشاهده دوره‌ها</Link>
        </div>
      </section>
    </>
  );
}
