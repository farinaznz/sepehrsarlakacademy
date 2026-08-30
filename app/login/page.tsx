import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { LoginForm } from "./LoginForm";
import { getServerEnv } from "../../lib/env";

export const metadata: Metadata = {
  title: "ورود هنرجویان",
  description: "ورود و ثبت‌نام امن هنرجویان با ایمیل.",
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
  const env = getServerEnv();
  const fakePreviewEnabled = env.AUTH_FAKE_OTP_ENABLED && env.AUTH_FAKE_OTP_PREVIEW_ENABLED;

  return (
    <section className="login-page">
      <div className="login-intro">
        <span className="eyebrow eyebrow-light">فضای هنرجویی</span>
        <h1>یادگیری شما،<br />از همین‌جا ادامه پیدا می‌کند.</h1>
        <p>با ایمیل و گذرواژه وارد شوید. هنگام ثبت‌نام، ایمیل شما با یک کد یک‌بار مصرف تأیید می‌شود.</p>
        <div className="login-benefits">
          <div><span>۰۱</span><p>دسترسی یکجا به دوره‌های شما</p></div>
          <div><span>۰۲</span><p>ادامه یادگیری از آخرین مرحله</p></div>
          <div><span>۰۳</span><p>بازیابی امن گذرواژه با ایمیل</p></div>
        </div>
      </div>
      <div className="login-panel">
        <LoginForm returnTo={returnTo} fakePreviewEnabled={fakePreviewEnabled} />
      </div>
    </section>
  );
}
