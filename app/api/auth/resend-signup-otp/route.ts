import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { user } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { getServerEnv } from "../../../../lib/env";
import { consumeIdentityRateLimit, IdentityRateLimitError } from "../../../../lib/identity-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expectedOrigin = new URL(getServerEnv().BETTER_AUTH_URL).origin;
  if (request.headers.get("origin") !== expectedOrigin) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await consumeIdentityRateLimit({ namespace: "signup-cooldown", identifier: email, window: 60, max: 1 });
    await consumeIdentityRateLimit({ namespace: "signup-window", identifier: email, window: 15 * 60, max: 5 });
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientAddress = forwardedFor || request.headers.get("x-real-ip") || "unknown";
    await consumeIdentityRateLimit({ namespace: "signup-resend-ip", identifier: clientAddress, window: 15 * 60, max: 5 });
  } catch (error) {
    if (error instanceof IdentityRateLimitError) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      );
    }
    throw error;
  }

  const [existing] = await getDb()
    .select({ emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing && !existing.emailVerified) {
    await auth.api.sendVerificationOTP({
      body: { email, type: "email-verification" },
      headers: request.headers,
    });
  }

  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
