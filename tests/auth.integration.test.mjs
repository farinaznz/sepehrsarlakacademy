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

test("email and phone OTP create sessions with protected learning access", { skip: !databaseUrl }, async (t) => {
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [".next/standalone/server.js"], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "integration-test-secret-with-at-least-32-characters",
      BETTER_AUTH_URL: origin,
      AUTH_FAKE_OTP_ENABLED: "true",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGTERM"));
  await waitForServer(child, origin);

  const email = `integration-${Date.now()}@example.com`;
  const send = await fetch(`${origin}/api/auth/email-otp/send-verification-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  assert.equal(send.status, 200, await send.text());

  const preview = await fetch(`${origin}/api/auth/fake-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email }),
  });
  assert.equal(preview.status, 200);
  const { code } = await preview.json();
  assert.match(code, /^\d{6}$/);

  const signIn = await fetch(`${origin}/api/auth/sign-in/email-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp: code, name: "Integration Student" }),
  });
  assert.equal(signIn.status, 200, await signIn.text());
  const signedIn = await signIn.json();
  assert.ok(signedIn.user.id);
  const cookie = signIn.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "session cookie was not set");

  const dashboard = await fetch(`${origin}/dashboard/`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);

  const sql = postgres(databaseUrl, { max: 1 });
  t.after(() => sql.end());
  const [seededCourse] = await sql`select id, slug from course order by created_at limit 1`;
  const [seededLesson] = await sql`select id, slug from lesson where course_id = ${seededCourse.id} order by position limit 1`;
  await sql`
    insert into enrollment (id, user_id, course_id, status)
    values (${crypto.randomUUID()}, ${signedIn.user.id}, ${seededCourse.id}, 'active')
    on conflict (user_id, course_id) do update set status = 'active'
  `;

  const protectedLesson = await fetch(`${origin}/learn/${seededCourse.slug}/${seededLesson.slug}/`, {
    headers: { cookie },
  });
  assert.equal(protectedLesson.status, 200);
  assert.match(await protectedLesson.text(), /Integration Student|شروع مسیر یادگیری|فضای هنرجویی/);

  const phoneNumber = `+98912${String(Date.now()).slice(-7)}`;
  const sendPhone = await fetch(`${origin}/api/auth/phone-number/send-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  assert.equal(sendPhone.status, 200, await sendPhone.text());

  const phonePreview = await fetch(`${origin}/api/auth/fake-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: phoneNumber }),
  });
  assert.equal(phonePreview.status, 200);
  const { code: phoneCode } = await phonePreview.json();
  assert.match(phoneCode, /^\d{6}$/);

  const verifyPhone = await fetch(`${origin}/api/auth/phone-number/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, code: phoneCode }),
  });
  assert.equal(verifyPhone.status, 200, await verifyPhone.text());
  const phoneCookie = verifyPhone.headers.get("set-cookie")?.split(";")[0];
  assert.ok(phoneCookie, "phone session cookie was not set");

  const phoneDashboard = await fetch(`${origin}/dashboard/`, {
    headers: { cookie: phoneCookie },
  });
  assert.equal(phoneDashboard.status, 200);
});
