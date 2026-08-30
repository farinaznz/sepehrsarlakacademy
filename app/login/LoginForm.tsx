"use client";

import { FormEvent, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { normalizeIranianPhone } from "../../lib/phone";

type Method = "phone" | "email";

function latinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [method, setMethod] = useState<Method>("phone");
  const [identifier, setIdentifier] = useState("");
  const [normalizedIdentifier, setNormalizedIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [fakeCode, setFakeCode] = useState<string | null>(null);
  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function switchMethod(next: Method) {
    setMethod(next);
    setIdentifier("");
    setCode("");
    setFakeCode(null);
    setMessage(null);
    setStep("identifier");
  }

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setFakeCode(null);

    try {
      const normalized = method === "phone"
        ? normalizeIranianPhone(latinDigits(identifier))
        : identifier.trim().toLowerCase();
      if (!normalized || (method === "email" && !/^\S+@\S+\.\S+$/.test(normalized))) {
        throw new Error(method === "phone" ? "شماره همراه معتبر وارد کنید." : "ایمیل معتبر وارد کنید.");
      }

      const result = method === "phone"
        ? await authClient.phoneNumber.sendOtp({ phoneNumber: normalized })
        : await authClient.emailOtp.sendVerificationOtp({ email: normalized, type: "sign-in" });
      if (result.error) throw new Error(result.error.message || "ارسال کد انجام نشد.");

      setNormalizedIdentifier(normalized);
      setStep("code");
      setMessage("کد تا پنج دقیقه معتبر است و حداکثر سه بار می‌توانید آن را امتحان کنید.");

      const preview = await fetch("/api/auth/fake-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: normalized }),
      });
      if (preview.ok) {
        const data = (await preview.json()) as { code?: string };
        if (data.code) setFakeCode(data.code);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال کد انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const otp = latinDigits(code).replace(/\D/g, "");
      if (otp.length !== 6) throw new Error("کد شش‌رقمی را کامل وارد کنید.");
      const result = method === "phone"
        ? await authClient.phoneNumber.verify({ phoneNumber: normalizedIdentifier, code: otp })
        : await authClient.signIn.emailOtp({
            email: normalizedIdentifier,
            otp,
            name: "هنرجوی آکادمی",
          });
      if (result.error) throw new Error(result.error.message || "کد واردشده معتبر نیست.");
      window.location.assign(returnTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-card">
      <span className="login-card-index">ورود امن هنرجویان</span>
      <div className="login-account-mark" aria-hidden="true">◇</div>
      <h2>{step === "identifier" ? "ورود با کد یک‌بار مصرف" : "کد را وارد کنید"}</h2>
      {step === "identifier" ? (
        <>
          <div className="login-methods" role="tablist" aria-label="روش ورود">
            <button className={method === "phone" ? "active" : ""} type="button" onClick={() => switchMethod("phone")}>شماره همراه</button>
            <button className={method === "email" ? "active" : ""} type="button" onClick={() => switchMethod("email")}>ایمیل</button>
          </div>
          <form className="login-form" onSubmit={requestCode}>
            <label htmlFor="login-identifier">{method === "phone" ? "شماره همراه" : "آدرس ایمیل"}</label>
            <input
              id="login-identifier"
              dir="ltr"
              inputMode={method === "phone" ? "tel" : "email"}
              autoComplete={method === "phone" ? "tel" : "email"}
              placeholder={method === "phone" ? "09121234567" : "student@example.com"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              disabled={pending}
              required
            />
            <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال ارسال…" : "دریافت کد ورود"}</button>
          </form>
        </>
      ) : (
        <form className="login-form" onSubmit={verifyCode}>
          <p className="login-destination" dir="ltr">{normalizedIdentifier}</p>
          {fakeCode ? <div className="fake-otp-notice"><span>کد آزمایشی</span><strong dir="ltr">{fakeCode}</strong></div> : null}
          <label htmlFor="login-code">کد شش‌رقمی</label>
          <input
            id="login-code"
            className="otp-input"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={pending}
            required
            autoFocus
          />
          <button className="button button-wide" disabled={pending} type="submit">{pending ? "در حال بررسی…" : "ورود به فضای هنرجویی"}</button>
          <button className="login-back" type="button" onClick={() => setStep("identifier")} disabled={pending}>تغییر شماره یا ایمیل</button>
        </form>
      )}
      {message ? <p className="login-message" role="status">{message}</p> : null}
      <div className="login-trust"><span aria-hidden="true">◇</span><p><strong>ورود بدون گذرواژه</strong><small>کدها یک‌بار مصرف و زمان‌دار هستند.</small></p></div>
    </div>
  );
}
