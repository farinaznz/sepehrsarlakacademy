import { spawnSync } from "node:child_process";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  console.error("TEST_DATABASE_URL must point to a disposable PostgreSQL database.");
  process.exit(1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "integration-test-secret-with-at-least-32-characters",
  BETTER_AUTH_URL: "http://127.0.0.1:3456",
  AUTH_FAKE_OTP_ENABLED: "true",
};

for (const args of [
  ["run", "db:migrate"],
  ["run", "db:seed"],
  ["run", "build:standalone"],
]) {
  const result = spawnSync(npm, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const result = spawnSync(
  process.execPath,
  ["--test", "--test-concurrency=1", "tests/db-health.integration.test.mjs", "tests/auth.integration.test.mjs"],
  { env, stdio: "inherit" },
);
process.exit(result.status ?? 1);
