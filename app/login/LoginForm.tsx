"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";

type Mode = "login" | "signup" | "forgot";
type VerificationStep = "signup-code" | "reset-code" | null;

function latinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function LoginForm({ returnTo, fakePreviewEnabled }: { returnTo: string; fakePreviewEnabled: boolean }) {
  const [mode, setMode] = useState<Mode>("login");
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [fakeCode, setFakeCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function resetForm(nextMode: Mode) {
    setMode(nextMode);
    setVerificationStep(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setFakeCode(null);
    setCooldown(0);
    setMessage(null);
  }

  async function readFakeCode(identifier: string) {
    if (!fakePreviewEnabled) return;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const preview = await fetch("/api/auth/fake-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (preview.ok) {
        const data = (await preview.json()) as { code?: string };
        if (data.code) {
          setFakeCode(data.code);
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
  }

  function validatePassword() {
    if (password.length < 10) throw new Error("گذرواژه باید حداقل ۱۰ نویسه باشد.");
    if (password !== confirmPassword) throw new Error("تکرار گذرواژه یکسان نیست.");
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const loginEmail = normalizedEmail(email);
      if (!validEmail(loginEmail)) throw new Error("ایمیل معتبر وارد کنید.");
      const result = await authClient.signIn.email({ email: loginEmail, password, rememberMe: true });
      if (result.error) throw new Error("ایمیل یا گذرواژه صحیح نیست.");
      window.location.assign(returnTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function submitSignup(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setFakeCode(null);
    try {
      const signupEmail = normalizedEmail(email);
      if (!name.trim()) throw new Error("نام و نام خانوادگی را وارد کنید.");
      if (!validEmail(signupEmail)) throw new Error("ایمیل معتبر وارد کنید.");
      validatePassword();
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: signupEmail,
        password,
        callbackURL: returnTo,
      });
      if (result.error) throw new Error(result.error.message || "ثبت‌نام انجام نشد.");
      setEmail(signupEmail);
      setPassword("");
      setConfirmPassword("");
      setVerificationStep("signup-code");
      setCooldown(60);
      setMessage("کد تأیید به ایمیل شما ارسال شد و پنج دقیقه اعتبار دارد.");
      await readFakeCode(signupEmail);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت‌نام انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function verifySignup(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const otp = latinDigits(code).replace(/\D/g, "");
      if (otp.length !== 6) throw new Error("کد شش‌رقمی را کامل وارد کنید.");
      const result = await authClient.emailOtp.verifyEmail({ email, otp });
      if (result.error) throw new Error("کد واردشده معتبر نیست یا منقضی شده است.");
      window.location.assign(returnTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تأیید ایمیل انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function requestPasswordReset(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setFakeCode(null);
    try {
      const resetEmail = normalizedEmail(email);
      if (!validEmail(resetEmail)) throw new Error("ایمیل معتبر وارد کنید.");
      const result = await authClient.emailOtp.requestPasswordReset({ email: resetEmail });
      if (result.error) throw new Error(result.error.message || "ارسال کد انجام نشد.");
      setEmail(resetEmail);
      setVerificationStep("reset-code");
      setCooldown(60);
      setMessage("اگر حسابی با این ایمیل وجود داشته باشد، کد بازیابی ارسال شده است.");
      await readFakeCode(resetEmail);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال کد انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const otp = latinDigits(code).replace(/\D/g, "");
      if (otp.length !== 6) throw new Error("کد شش‌رقمی را کامل وارد کنید.");
      validatePassword();
      const result = await authClient.emailOtp.resetPassword({ email, otp, password });
      if (result.error) throw new Error("کد واردشده معتبر نیست یا منقضی شده است.");
      setMode("login");
      setVerificationStep(null);
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setFakeCode(null);
      setMessage("گذرواژه تغییر کرد. اکنون وارد شوید.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تغییر گذرواژه انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0 || pending) return;
    setPending(true);
    setMessage(null);
    setFakeCode(null);
    try {
      if (verificationStep === "signup-code") {
        const response = await fetch("/api/auth/resend-signup-otp/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("ارسال دوباره انجام نشد.");
      } else {
        const result = await authClient.emailOtp.requestPasswordReset({ email });
        if (result.error) throw new Error(result.error.message || "ارسال دوباره انجام نشد.");
      }
      setCooldown(60);
      setMessage("کد جدید ارسال شد.");
      await readFakeCode(email);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال دوباره انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  const title = verificationStep === "signup-code"
    ? "تأیید ایمیل"
    : verificationStep === "reset-code"
      ? "انتخاب گذرواژه جدید"
      : mode === "signup"
        ? "ساخت حساب هنرجویی"
        : mode === "forgot"
          ? "بازیابی گذرواژه"
          : "ورود به حساب";

  return (
    <div className="login-card">
      <span className="login-card-index">حساب هنرجویی</span>
      <div className="login-account-mark" aria-hidden="true">◇</div>
      <h2>{title}</h2>

      {!verificationStep && mode !== "forgot" ? (
        <div className="login-methods" role="tablist" aria-label="ورود یا ثبت‌نام">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => resetForm("login")}>ورود</button>
          <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => resetForm("signup")}>ثبت‌نام</button>
        </div>
      ) : null}

      {!verificationStep && mode === "login" ? (
        <form className="login-form" onSubmit={submitLogin}>
          <label htmlFor="login-email">آدرس ایمیل</label>
          <input id="login-email" dir="ltr" type="email" autoComplete="email" placeholder="student@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} required />
          <label htmlFor="login-password">گذرواژه</label>
          <input id="login-password" dir="ltr" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} required />
          <button className="login-back" type="button" onClick={() => resetForm("forgot")} disabled={pending}>گذرواژه را فراموش کرده‌اید؟</button>
          <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال ورود…" : "ورود به فضای هنرجویی"}</button>
        </form>
      ) : null}

      {!verificationStep && mode === "signup" ? (
        <form className="login-form" onSubmit={submitSignup}>
          <label htmlFor="signup-name">نام و نام خانوادگی</label>
          <input id="signup-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} disabled={pending} required />
          <label htmlFor="signup-email">آدرس ایمیل</label>
          <input id="signup-email" dir="ltr" type="email" autoComplete="email" placeholder="student@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} required />
          <label htmlFor="signup-password">گذرواژه <small>(حداقل ۱۰ نویسه)</small></label>
          <input id="signup-password" dir="ltr" type="password" minLength={10} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} required />
          <label htmlFor="signup-password-confirm">تکرار گذرواژه</label>
          <input id="signup-password-confirm" dir="ltr" type="password" minLength={10} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={pending} required />
          <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال ثبت‌نام…" : "ثبت‌نام و دریافت کد تأیید"}</button>
        </form>
      ) : null}

      {!verificationStep && mode === "forgot" ? (
        <form className="login-form" onSubmit={requestPasswordReset}>
          <p className="login-help">ایمیل حساب خود را وارد کنید تا کد بازیابی دریافت کنید.</p>
          <label htmlFor="reset-email">آدرس ایمیل</label>
          <input id="reset-email" dir="ltr" type="email" autoComplete="email" placeholder="student@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} required />
          <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال ارسال…" : "دریافت کد بازیابی"}</button>
          <button className="login-back" type="button" onClick={() => resetForm("login")} disabled={pending}>بازگشت به ورود</button>
        </form>
      ) : null}

      {verificationStep ? (
        <form className="login-form" onSubmit={verificationStep === "signup-code" ? verifySignup : resetPassword}>
          <p className="login-destination" dir="ltr">{email}</p>
          {fakeCode ? <div className="fake-otp-notice"><span>کد آزمایشی</span><strong dir="ltr">{fakeCode}</strong></div> : null}
          <label htmlFor="verification-code">کد شش‌رقمی</label>
          <input id="verification-code" className="otp-input" dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} disabled={pending} required autoFocus />
          {verificationStep === "reset-code" ? (
            <>
              <label htmlFor="new-password">گذرواژه جدید <small>(حداقل ۱۰ نویسه)</small></label>
              <input id="new-password" dir="ltr" type="password" minLength={10} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} required />
              <label htmlFor="new-password-confirm">تکرار گذرواژه جدید</label>
              <input id="new-password-confirm" dir="ltr" type="password" minLength={10} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={pending} required />
            </>
          ) : null}
          <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال بررسی…" : verificationStep === "signup-code" ? "تأیید و ورود" : "تغییر گذرواژه"}</button>
          <button className="login-back" type="button" onClick={resendCode} disabled={pending || cooldown > 0}>{cooldown > 0 ? `ارسال دوباره تا ${cooldown} ثانیه` : "ارسال دوباره کد"}</button>
          <button className="login-back" type="button" onClick={() => resetForm(verificationStep === "signup-code" ? "signup" : "forgot")} disabled={pending}>تغییر ایمیل</button>
        </form>
      ) : null}

      {message ? <p className="login-message" role="status">{message}</p> : null}
      <div className="login-trust"><span aria-hidden="true">◇</span><p><strong>حساب تأییدشده</strong><small>کد یک‌بار مصرف فقط هنگام ثبت‌نام و بازیابی گذرواژه استفاده می‌شود.</small></p></div>
    </div>
  );
}
