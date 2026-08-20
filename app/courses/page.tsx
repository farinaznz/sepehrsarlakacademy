import type { Metadata } from "next";
import Link from "next/link";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "دوره‌های آشپزی",
  description: "دوره‌های حضوری و آنلاین آشپزی حرفه‌ای آکادمی سپهر سرلک.",
};

export default function CoursesPage() {
  return (
    <>
      <section className="catalog-hero">
        <div className="container catalog-hero-grid">
          <div><span className="eyebrow eyebrow-light">دوره‌های آکادمی</span><h1>مسیر یادگیری<br />شما از اینجا شروع می‌شود.</h1></div>
          <div><p>از تکنیک‌های پایه تا مهارت‌های تخصصی؛ دوره‌ها را بر اساس هدف، سطح و شیوه یادگیری خودتان انتخاب کنید.</p><Link className="arrow-link light" href="#catalog">راهنمای انتخاب دوره <span>↓</span></Link></div>
        </div>
      </section>
      <section className="catalog-section section" id="catalog">
        <div className="container"><CatalogClient /></div>
      </section>
      <section className="catalog-help">
        <div className="container catalog-help-inner"><div><span className="eyebrow">برای انتخاب مطمئن</span><h2>هنوز نمی‌دانید از کجا شروع کنید؟</h2></div><p>هدف، تجربه و زمانی که در اختیار دارید را با ما در میان بگذارید تا بهترین مسیر را پیشنهاد کنیم.</p><Link className="button" href="/contact">مشاوره انتخاب دوره</Link></div>
      </section>
    </>
  );
}
