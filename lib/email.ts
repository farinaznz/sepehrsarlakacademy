import nodemailer from "nodemailer";
import { getServerEnv } from "./env";
import { rememberFakeOtp } from "./fake-otp";

const env = getServerEnv();
const otpExpiresInSeconds = 5 * 60;

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

export async function deliverEmailOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (env.AUTH_FAKE_OTP_ENABLED) {
    rememberFakeOtp(normalizedEmail, otp, otpExpiresInSeconds);
    console.info(`[fake-otp] Email code generated for ${normalizedEmail}`);
    return;
  }

  await transporter!.sendMail({
    from: env.SMTP_FROM,
    to: normalizedEmail,
    subject: "کد ورود به آکادمی سپهر سرلک",
    text: `کد ورود شما: ${otp}\n\nاین کد تا پنج دقیقه معتبر است. اگر شما درخواست ورود نداده‌اید، این پیام را نادیده بگیرید.`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#18231f"><h2>ورود به آکادمی سپهر سرلک</h2><p>کد یک‌بار مصرف شما:</p><p dir="ltr" style="font-size:30px;font-weight:700;letter-spacing:8px">${otp}</p><p>این کد تا پنج دقیقه معتبر است. اگر شما درخواست ورود نداده‌اید، این پیام را نادیده بگیرید.</p></div>`,
  });
}
