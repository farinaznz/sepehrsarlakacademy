import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "فضای هنرجویی",
  description: "اطلاع‌رسانی وضعیت فضای هنرجویی آکادمی آشپزی سپهر سرلک.",
};

export default function LoginPage() {
  return (
    <section className="login-page">
      <div className="login-intro">
        <span className="eyebrow eyebrow-light">فضای هنرجویی</span>
        <h1>یادگیری شما،<br />از همین‌جا ادامه پیدا می‌کند.</h1>
        <p>به دوره‌ها، محتوای آموزشی و مسیر یادگیری خود در آکادمی دسترسی داشته باشید.</p>
        <div className="login-benefits">
          <div><span>۰۱</span><p>دسترسی یکجا به دوره‌های شما</p></div>
          <div><span>۰۲</span><p>ادامه یادگیری از آخرین مرحله</p></div>
          <div><span>۰۳</span><p>ارتباط ساده‌تر با تیم آموزش</p></div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <span className="login-card-index">حساب هنرجویی</span>
          <div className="login-account-mark" aria-hidden="true">◇</div>
          <h2>ورود موقتاً<br />غیرفعال است</h2>
          <p>در حال آماده‌سازی نسخه تازه فضای هنرجویی هستیم. تا فعال‌شدن دوباره ورود، می‌توانید دوره‌ها را ببینید یا با پشتیبانی در تماس باشید.</p>
          <div className="login-actions">
            <Link className="button button-wide" href="/courses">مشاهده دوره‌ها</Link>
            <Link className="button button-ghost button-wide" href="/contact">تماس با پشتیبانی</Link>
          </div>
          <div className="login-trust"><span aria-hidden="true">◇</span><p><strong>اطلاعات حساب شما محفوظ است</strong><small>برای فعال‌شدن دوباره ورود، از همین صفحه اطلاع‌رسانی می‌کنیم.</small></p></div>
        </div>
      </div>
    </section>
  );
}
