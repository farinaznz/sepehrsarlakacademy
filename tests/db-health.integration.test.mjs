import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import test from "node:test";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

async function availablePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

test("GET /api/health/db/ reports a live PostgreSQL connection", { skip: !databaseUrl }, async (t) => {
  const port = await availablePort();
  const child = spawn(process.execPath, [".next/standalone/server.js"], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "integration-test-secret-with-at-least-32-characters",
      BETTER_AUTH_URL: `http://127.0.0.1:${port}`,
      AUTH_FAKE_OTP_ENABLED: "true",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGTERM"));

  let response;
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Standalone server exited with code ${child.exitCode}`);
    }
    try {
      response = await fetch(`http://127.0.0.1:${port}/api/health/db/`, {
        redirect: "manual",
      });
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  assert.ok(response, "standalone server did not become ready");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.database, "reachable");
  assert.equal(typeof body.latencyMs, "number");
});
