import nodemailer from "nodemailer";
import { getServerEnv } from "./env";

const env = getServerEnv();
const transporter = env.AUTH_FAKE_OTP_ENABLED
  ? null
  : nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      requireTLS: !env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

type EmailOtpPurpose = "sign-in" | "email-verification" | "forget-password" | "change-email";

const purposeCopy: Record<EmailOtpPurpose, { subject: string; heading: string; description: string }> = {
  "email-verification": {
    subject: "تأیید ثبت‌نام در آکادمی سپهر سرلک",
    heading: "تأیید ثبت‌نام",
    description: "برای تکمیل ثبت‌نام، کد زیر را وارد کنید:",
  },
  "forget-password": {
    subject: "بازیابی گذرواژه آکادمی سپهر سرلک",
    heading: "بازیابی گذرواژه",
    description: "برای انتخاب گذرواژه جدید، کد زیر را وارد کنید:",
  },
  "change-email": {
    subject: "تأیید ایمیل آکادمی سپهر سرلک",
    heading: "تأیید ایمیل",
    description: "برای تأیید ایمیل، کد زیر را وارد کنید:",
  },
  "sign-in": {
    subject: "کد ورود به آکادمی سپهر سرلک",
    heading: "ورود به آکادمی سپهر سرلک",
    description: "کد یک‌بار مصرف شما:",
  },
};

export async function deliverEmailOtp(email: string, otp: string, purpose: EmailOtpPurpose) {
  const normalizedEmail = email.trim().toLowerCase();
  if (env.AUTH_FAKE_OTP_ENABLED) {
    console.info(`[fake-otp] Email code generated for ${normalizedEmail}`);
    return;
  }

  const copy = purposeCopy[purpose];
  await transporter!.sendMail({
    from: env.SMTP_FROM,
    to: normalizedEmail,
    subject: copy.subject,
    text: `${copy.description} ${otp}\n\nاین کد تا پنج دقیقه معتبر است. اگر شما این درخواست را ثبت نکرده‌اید، این پیام را نادیده بگیرید.`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#18231f"><h2>${copy.heading}</h2><p>${copy.description}</p><p dir="ltr" style="font-size:30px;font-weight:700;letter-spacing:8px">${otp}</p><p>این کد تا پنج دقیقه معتبر است. اگر شما این درخواست را ثبت نکرده‌اید، این پیام را نادیده بگیرید.</p></div>`,
  });
}
