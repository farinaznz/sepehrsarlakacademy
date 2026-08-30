import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import test from "node:test";
import postgres from "postgres";

const databaseUrl = process.env.TEST_DATABASE_URL;

async function availablePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(child, origin) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Standalone server exited with code ${child.exitCode}`);
    try {
      const response = await fetch(`${origin}/api/health/db/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Standalone server did not become ready");
}

async function waitForFakeOtp(origin, email, headers, previousCode) {
  const deadline = Date.now() + 2_000;
  let lastResponse = "no response";
  while (Date.now() < deadline) {
    const preview = await fetch(`${origin}/api/auth/fake-otp/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ identifier: email }),
    });
    if (preview.ok) {
      const { code } = await preview.json();
      if (code && code !== previousCode) return code;
      lastResponse = `200 ${code ?? "missing code"}`;
    } else {
      lastResponse = `${preview.status} ${await preview.text()}`;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Fake OTP was not delivered for ${email}: ${lastResponse}`);
}

test("verified email signup, password login, and password recovery protect learning access", { skip: !databaseUrl }, async (t) => {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const jsonHeaders = { "Content-Type": "application/json", Origin: origin };
  const child = spawn(process.execPath, [".next/standalone/server.js"], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "integration-test-secret-with-at-least-32-characters",
      BETTER_AUTH_URL: origin,
      AUTH_FAKE_OTP_ENABLED: "true",
      AUTH_FAKE_OTP_PREVIEW_ENABLED: "true",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "test",
      PORT: String(port),
    },
    stdio: ["ignore", "inherit", "inherit"],
  });
  t.after(() => child.kill("SIGTERM"));
  await waitForServer(child, origin);
  const sql = postgres(databaseUrl, { max: 1 });
  t.after(() => sql.end());

  const email = `integration-${Date.now()}@example.com`;
  const initialPassword = "initial-password-123";
  const signup = await fetch(`${origin}/api/auth/sign-up/email/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password: initialPassword, name: "Integration Student" }),
  });
  assert.equal(signup.status, 200, await signup.text());
  assert.equal(signup.headers.get("set-cookie"), null, "unverified signup must not create a session");

  const code = await waitForFakeOtp(origin, email, jsonHeaders);
  assert.match(code, /^\d{6}$/);

  await sql`update rate_limit set last_request = 0 where key like 'identity:signup-cooldown:%'`;
  const resendSignup = await fetch(`${origin}/api/auth/resend-signup-otp/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
  assert.equal(resendSignup.status, 200, await resendSignup.text());
  const resentCode = await waitForFakeOtp(origin, email, jsonHeaders, code);
  assert.match(resentCode, /^\d{6}$/);

  const verify = await fetch(`${origin}/api/auth/email-otp/verify-email/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, otp: resentCode }),
  });
  assert.equal(verify.status, 200, await verify.clone().text());
  const verified = await verify.json();
  assert.ok(verified.user.id);
  assert.equal(verified.user.emailVerified, true);

  const signIn = await fetch(`${origin}/api/auth/sign-in/email/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password: initialPassword }),
  });
  assert.equal(signIn.status, 200, await signIn.text());
  const cookie = signIn.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "password login session cookie was not set");

  const dashboard = await fetch(`${origin}/dashboard/`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);

  const [seededCourse] = await sql`select id, slug from course order by created_at limit 1`;
  const [seededLesson] = await sql`select id, slug from lesson where course_id = ${seededCourse.id} order by position limit 1`;
  await sql`
    insert into enrollment (id, user_id, course_id, status)
    values (${crypto.randomUUID()}, ${verified.user.id}, ${seededCourse.id}, 'active')
    on conflict (user_id, course_id) do update set status = 'active'
  `;

  const protectedLesson = await fetch(`${origin}/learn/${seededCourse.slug}/${seededLesson.slug}/`, {
    headers: { cookie },
  });
  assert.equal(protectedLesson.status, 200);
  assert.match(await protectedLesson.text(), /Integration Student|شروع مسیر یادگیری|فضای هنرجویی/);

  const disabledOtpSignIn = await fetch(`${origin}/api/auth/sign-in/email-otp/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, otp: resentCode }),
  });
  assert.equal(disabledOtpSignIn.status, 404);

  const requestReset = await fetch(`${origin}/api/auth/email-otp/request-password-reset/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
  assert.equal(requestReset.status, 200, await requestReset.text());

  const resetCode = await waitForFakeOtp(origin, email, jsonHeaders, resentCode);
  assert.match(resetCode, /^\d{6}$/);

  const newPassword = "replacement-password-456";
  const reset = await fetch(`${origin}/api/auth/email-otp/reset-password/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, otp: resetCode, password: newPassword }),
  });
  assert.equal(reset.status, 200, await reset.text());

  const oldPasswordLogin = await fetch(`${origin}/api/auth/sign-in/email/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password: initialPassword }),
  });
  assert.notEqual(oldPasswordLogin.status, 200);

  const newPasswordLogin = await fetch(`${origin}/api/auth/sign-in/email/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password: newPassword }),
  });
  assert.equal(newPasswordLogin.status, 200, await newPasswordLogin.text());
  assert.ok(newPasswordLogin.headers.get("set-cookie"), "new password did not create a session");
});
