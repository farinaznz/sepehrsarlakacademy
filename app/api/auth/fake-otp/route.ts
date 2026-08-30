import { getServerEnv } from "../../../../lib/env";
import { readFakeOtp } from "../../../../lib/fake-otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = getServerEnv();
  if (!env.AUTH_FAKE_OTP_ENABLED) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { identifier?: unknown } | null;
  if (typeof body?.identifier !== "string" || body.identifier.length > 254) {
    return Response.json({ error: "Invalid identifier" }, { status: 400 });
  }

  const code = readFakeOtp(body.identifier);
  if (!code) return Response.json({ error: "Code unavailable" }, { status: 404 });

  return Response.json(
    { code, fake: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
