import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { getServerEnv } from "./env";
import { ensureUserFoundation, writeAuditRecord } from "./auth-foundation";
import { deliverEmailOtp } from "./email";
import { consumeIdentityRateLimit, IdentityRateLimitError } from "./identity-rate-limit";

const env = getServerEnv();
const otpExpiresIn = 5 * 60;

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    async onPasswordReset({ user: resetUser }) {
      await writeAuditRecord({
        actorUserId: resetUser.id,
        action: "auth.password.reset",
        entityType: "user",
        entityId: resetUser.id,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: otpExpiresIn,
    async afterEmailVerification(verifiedUser) {
      await writeAuditRecord({
        actorUserId: verifiedUser.id,
        action: "auth.email.verified",
        entityType: "user",
        entityId: verifiedUser.id,
      });
    },
  },
  disabledPaths: ["/sign-in/email-otp", "/email-otp/send-verification-otp"],
  hooks: {
    before: createAuthMiddleware(async (context) => {
      const email = typeof context.body?.email === "string" ? context.body.email.trim().toLowerCase() : "";
      if (!email) return;

      const policies = context.path === "/sign-up/email"
        ? [
            { namespace: "signup-cooldown", window: 60, max: 1 },
            { namespace: "signup-window", window: 15 * 60, max: 5 },
          ]
        : context.path === "/email-otp/request-password-reset"
          ? [
              { namespace: "password-reset-cooldown", window: 60, max: 1 },
              { namespace: "password-reset-window", window: 60 * 60, max: 3 },
            ]
          : context.path === "/sign-in/email"
            ? [{ namespace: "password-login-window", window: 15 * 60, max: 10 }]
            : [];

      try {
        for (const policy of policies) {
          await consumeIdentityRateLimit({ ...policy, identifier: email });
        }
      } catch (error) {
        if (error instanceof IdentityRateLimitError) {
          throw APIError.from("TOO_MANY_REQUESTS", {
            code: "IDENTITY_RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          });
        }
        throw error;
      }
    }),
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": { window: 15 * 60, max: 5 },
      "/sign-in/email": { window: 15 * 60, max: 10 },
      "/email-otp/send-verification-otp": { window: 15 * 60, max: 5 },
      "/email-otp/verify-email": { window: 15 * 60, max: 5 },
      "/email-otp/request-password-reset": { window: 60 * 60, max: 3 },
      "/email-otp/reset-password": { window: 15 * 60, max: 5 },
    },
  },
  advanced: {
    skipTrailingSlashes: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await ensureUserFoundation(createdUser);
          await writeAuditRecord({
            actorUserId: createdUser.id,
            action: "auth.user.created",
            entityType: "user",
            entityId: createdUser.id,
          });
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
      allowedAttempts: 5,
      storeOTP: env.AUTH_FAKE_OTP_ENABLED ? "plain" : "hashed",
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await deliverEmailOtp(email, otp, type);
      },
    }),
  ],
});
