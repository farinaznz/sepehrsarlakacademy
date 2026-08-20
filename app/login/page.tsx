import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";

export const metadata: Metadata = {
  title: "ورود هنرجویان",
  description: "ورود امن هنرجویان به حساب کاربری آکادمی آشپزی سپهر سرلک.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getChatGPTUser();

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
          {user ? (
            <>
              <span className="login-card-index">حساب هنرجویی</span>
              <div className="login-account-mark" aria-hidden="true">✓</div>
              <h2>خوش آمدید،<br />{user.displayName}</h2>
              <p>شما با این نشانی وارد شده‌اید:</p>
              <strong className="login-email" dir="ltr">{user.email}</strong>
              <div className="login-actions">
                <Link className="button button-wide" href="/courses">مشاهده دوره‌ها</Link>
                <a className="button button-ghost button-wide" href={chatGPTSignOutPath("/login")}>خروج از حساب</a>
              </div>
            </>
          ) : (
            <>
              <span className="login-card-index">ورود امن</span>
              <h2>ورود هنرجویان</h2>
              <p>برای ورود یا ساخت حساب، از حساب ChatGPT خود استفاده کنید. پس از تأیید، دوباره به همین صفحه بازمی‌گردید.</p>
              <a className="button button-wide login-primary-action" href={chatGPTSignInPath("/login")}>ورود با ChatGPT <span>←</span></a>
              <div className="login-trust"><span aria-hidden="true">◇</span><p><strong>ورود بدون رمز عبور جداگانه</strong><small>اطلاعات ورود شما در آکادمی ذخیره نمی‌شود.</small></p></div>
              <p className="login-help">برای مشکل در ورود یا دسترسی به دوره، <Link href="/contact">با پشتیبانی تماس بگیرید.</Link></p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
