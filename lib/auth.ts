import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { getServerEnv } from "./env";
import { rememberFakeOtp } from "./fake-otp";
import { normalizeIranianPhone } from "./phone";
import { ensureUserFoundation, writeAuditRecord } from "./auth-foundation";

const env = getServerEnv();
const otpExpiresIn = 5 * 60;

function phonePlaceholderEmail(phone: string) {
  const digest = createHash("sha256").update(phone).digest("hex").slice(0, 24);
  return `${digest}@phone.academy.invalid`;
}

function deliverFakeOtp(identifier: string, code: string) {
  if (!env.AUTH_FAKE_OTP_ENABLED) {
    throw new Error("OTP delivery provider is not configured");
  }
  rememberFakeOtp(identifier, code, otpExpiresIn);
  console.info(`[fake-otp] Code generated for ${identifier}`);
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: { enabled: false },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await ensureUserFoundation(createdUser);
        },
      },
    },
    session: {
      create: {
        after: async (createdSession) => {
          await writeAuditRecord({
            actorUserId: createdSession.userId,
            action: "auth.session.created",
            entityType: "session",
            entityId: createdSession.id,
          });
        },
      },
    },
  },
  plugins: [
    emailOTP({
      expiresIn: otpExpiresIn,
      allowedAttempts: 3,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp }) {
        deliverFakeOtp(email.toLowerCase(), otp);
      },
    }),
    phoneNumber({
      expiresIn: otpExpiresIn,
      allowedAttempts: 3,
      phoneNumberValidator: (phone) => normalizeIranianPhone(phone) === phone,
      signUpOnVerification: {
        getTempEmail: phonePlaceholderEmail,
        getTempName: () => "هنرجوی آکادمی",
      },
      callbackOnVerification: async ({ user: verifiedUser }) => {
        await ensureUserFoundation(verifiedUser);
      },
      async sendOTP({ phoneNumber: phone, code }) {
        deliverFakeOtp(phone, code);
      },
    }),
  ],
});
