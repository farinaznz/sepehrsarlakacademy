import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "must be a PostgreSQL connection URL",
    ),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  AUTH_FAKE_OTP_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AUTH_FAKE_OTP_PREVIEW_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default(""),
  AUTH_ADMIN_EMAILS: z.string().default(""),
  AUTH_ADMIN_PHONES: z.string().default(""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
}).superRefine((env, context) => {
  if (env.AUTH_FAKE_OTP_PREVIEW_ENABLED && !env.AUTH_FAKE_OTP_ENABLED) {
    context.addIssue({
      code: "custom",
      path: ["AUTH_FAKE_OTP_PREVIEW_ENABLED"],
      message: "requires AUTH_FAKE_OTP_ENABLED=true",
    });
  }
  if (env.AUTH_FAKE_OTP_ENABLED) return;
  for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"] as const) {
    if (!env[key]) {
      context.addIssue({ code: "custom", path: [key], message: "is required when fake OTP delivery is disabled" });
    }
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let validatedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (validatedEnv) return validatedEnv;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment: ${details}`);
  }

  validatedEnv = result.data;
  return validatedEnv;
}
