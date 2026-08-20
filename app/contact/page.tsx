import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های تماس، پشتیبانی و مشاوره با آکادمی آشپزی سپهر سرلک در تهران.",
};

const contactMethods = [
  {
    number: "۰۱",
    label: "پشتیبانی و مشاوره",
    value: "۰۹۳۶۲۲۳۳۹۴۹",
    detail: "برای انتخاب دوره، ثبت‌نام و دریافت پشتیبانی",
    href: "https://wa.me/989362233949",
    action: "گفت‌وگو در واتس‌اپ",
  },
  {
    number: "۰۲",
    label: "ایمیل",
    value: "sepehrsarlakacademy@gmail.com",
    detail: "برای پیام‌های رسمی و درخواست‌های همکاری",
    href: "mailto:sepehrsarlakacademy@gmail.com",
    action: "ارسال ایمیل",
  },
  {
    number: "۰۳",
    label: "اینستاگرام",
    value: "@sepehrsarlakacademy",
    detail: "خبر دوره‌ها، رویدادها و زندگی روزمره آکادمی",
    href: "https://www.instagram.com/sepehrsarlakacademy/",
    action: "مشاهده اینستاگرام",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="catalog-hero contact-hero">
        <div className="container catalog-hero-grid">
          <div><span className="eyebrow eyebrow-light">تماس با آکادمی</span><h1>برای یک گفت‌وگوی<br />واقعی، در دسترسیم.</h1></div>
          <div><p>برای انتخاب دوره، ثبت‌نام، پشتیبانی یا همکاری با تیم آکادمی از راهی که برایتان راحت‌تر است با ما در ارتباط باشید.</p><Link className="arrow-link light" href="#contact-methods">راه‌های ارتباطی <span>↓</span></Link></div>
        </div>
      </section>

      <section className="contact-methods section" id="contact-methods">
        <div className="container">
          <div className="heading-row">
            <div className="section-heading"><span className="eyebrow">راه‌های ارتباطی</span><h2>پیام شما به تیم درست می‌رسد.</h2><p>برای پاسخ سریع‌تر، موضوع خود را در ابتدای پیام بنویسید.</p></div>
          </div>
          <div className="contact-method-grid">
            {contactMethods.map((method) => (
              <article className="contact-method-card" key={method.label}>
                <span className="contact-method-number">{method.number}</span>
                <div><small>{method.label}</small><h2 dir="ltr">{method.value}</h2><p>{method.detail}</p></div>
                <a className="arrow-link" href={method.href} target={method.href.startsWith("https://") ? "_blank" : undefined} rel={method.href.startsWith("https://") ? "noreferrer" : undefined}>{method.action} <span>←</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-location">
        <div className="container contact-location-grid">
          <div>
            <span className="eyebrow eyebrow-light">نشانی آکادمی</span>
            <h2>تهران، تجریش</h2>
            <p>ضلع جنوبی میدان تجریش، خیابان دربندی، بن‌بست گلبر، پلاک ۲، طبقه اول</p>
            <a className="button button-light" href="https://maps.app.goo.gl/CMCV8DpiAqdwz5oT7" target="_blank" rel="noreferrer">مشاهده روی نقشه</a>
          </div>
          <div className="contact-location-mark" aria-hidden="true"><span>۲</span><small>پلاک</small><strong>تجریش</strong></div>
        </div>
      </section>

      <section className="contact-consultation">
        <div className="container contact-consultation-inner">
          <div><span className="eyebrow">مشاوره انتخاب دوره</span><h2>هنوز نمی‌دانید کدام مسیر برای شما مناسب است؟</h2></div>
          <div><p>سطح فعلی، هدف و زمانی که در اختیار دارید را برای ما بنویسید تا مسیر مناسب‌تری پیشنهاد کنیم.</p><a className="button" href="https://wa.me/989362233949" target="_blank" rel="noreferrer">شروع مشاوره در واتس‌اپ</a></div>
        </div>
      </section>
    </>
  );
}
