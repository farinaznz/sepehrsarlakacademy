import { desc, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { verification } from "../../../../db/schema";
import { getServerEnv } from "../../../../lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = getServerEnv();
  if (!env.AUTH_FAKE_OTP_ENABLED || !env.AUTH_FAKE_OTP_PREVIEW_ENABLED) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { identifier?: unknown } | null;
  if (typeof body?.identifier !== "string" || body.identifier.length > 254) {
    return Response.json({ error: "Invalid identifier" }, { status: 400 });
  }

  const email = body.identifier.trim().toLowerCase();
  const identifiers = [
    `email-verification-otp-${email}`,
    `forget-password-otp-${email}`,
  ];
  const [entry] = await getDb()
    .select({ value: verification.value, expiresAt: verification.expiresAt })
    .from(verification)
    .where(inArray(verification.identifier, identifiers))
    .orderBy(desc(verification.updatedAt))
    .limit(1);
  const separator = entry?.value.lastIndexOf(":") ?? -1;
  const code = entry && entry.expiresAt > new Date() && separator > 0
    ? entry.value.slice(0, separator)
    : null;
  if (!code) return Response.json({ error: "Code unavailable" }, { status: 404 });

  return Response.json(
    { code, fake: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
