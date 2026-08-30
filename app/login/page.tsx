import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "ورود هنرجویان",
  description: "ورود امن هنرجویان با کد یک‌بار مصرف ایمیل یا تلفن همراه.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  const requestedReturnTo = (await searchParams).returnTo;
  const returnTo = requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/dashboard";

  return (
    <section className="login-page">
      <div className="login-intro">
        <span className="eyebrow eyebrow-light">فضای هنرجویی</span>
        <h1>یادگیری شما،<br />از همین‌جا ادامه پیدا می‌کند.</h1>
        <p>با شماره همراه یا ایمیل وارد شوید. برای هر ورود یک کد یک‌بار مصرف دریافت می‌کنید.</p>
        <div className="login-benefits">
          <div><span>۰۱</span><p>دسترسی یکجا به دوره‌های شما</p></div>
          <div><span>۰۲</span><p>ادامه یادگیری از آخرین مرحله</p></div>
          <div><span>۰۳</span><p>ورود بدون نیاز به گذرواژه</p></div>
        </div>
      </div>
      <div className="login-panel">
        <LoginForm returnTo={returnTo} />
      </div>
    </section>
  );
}
