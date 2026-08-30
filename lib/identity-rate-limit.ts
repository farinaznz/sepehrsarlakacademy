import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { rateLimit } from "../db/schema";

export class IdentityRateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super("Too many requests");
  }
}

function protectedKey(namespace: string, identifier: string) {
  const digest = createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex");
  return `identity:${namespace}:${digest}`;
}

export async function consumeIdentityRateLimit(input: {
  namespace: string;
  identifier: string;
  window: number;
  max: number;
}) {
  const key = protectedKey(input.namespace, input.identifier);
  const now = Date.now();
  const windowMilliseconds = input.window * 1000;

  await getDb().transaction(async (tx) => {
    await tx.insert(rateLimit).values({
      id: randomUUID(),
      key,
      count: 0,
      lastRequest: now,
    }).onConflictDoNothing();

    const [entry] = await tx.select().from(rateLimit).where(eq(rateLimit.key, key)).for("update").limit(1);
    const expired = !entry || now - entry.lastRequest >= windowMilliseconds;
    if (expired) {
      await tx.update(rateLimit).set({ count: 1, lastRequest: now }).where(eq(rateLimit.key, key));
      return;
    }

    if (entry.count >= input.max) {
      const retryAfter = Math.max(1, Math.ceil((entry.lastRequest + windowMilliseconds - now) / 1000));
      throw new IdentityRateLimitError(retryAfter);
    }

    await tx.update(rateLimit).set({ count: entry.count + 1 }).where(eq(rateLimit.key, key));
  });
}
