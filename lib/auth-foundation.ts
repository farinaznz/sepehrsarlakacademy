import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { auditRecord, profile, role, userRole } from "../db/schema";
import { getServerEnv } from "./env";
import { normalizeIranianPhone } from "./phone";

type AuthUser = { id: string; name: string; email: string; phoneNumber?: string | null };

function commaList(value: string) {
  return new Set(value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
}

export async function ensureUserFoundation(user: AuthUser) {
  const env = getServerEnv();
  const adminEmails = commaList(env.AUTH_ADMIN_EMAILS);
  const adminPhones = new Set(
    [...commaList(env.AUTH_ADMIN_PHONES)].map(normalizeIranianPhone).filter((phone): phone is string => Boolean(phone)),
  );
  const isAdmin = adminEmails.has(user.email.toLowerCase()) || Boolean(user.phoneNumber && adminPhones.has(user.phoneNumber));

  await getDb().transaction(async (tx) => {
    await tx.insert(profile).values({ userId: user.id, displayName: user.name || "هنرجوی آکادمی" }).onConflictDoNothing();
    await tx.insert(role).values([
      { id: "student", label: "هنرجو" },
      { id: "instructor", label: "مدرس" },
      { id: "admin", label: "مدیر" },
    ]).onConflictDoNothing();
    await tx.insert(userRole).values({ userId: user.id, roleId: "student" }).onConflictDoNothing();
    if (isAdmin) await tx.insert(userRole).values({ userId: user.id, roleId: "admin" }).onConflictDoNothing();
  });
}

export async function userHasRole(userId: string, roleId: string) {
  const [match] = await getDb().select({ userId: userRole.userId }).from(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId))).limit(1);
  return Boolean(match);
}

export async function userHasAnyRole(userId: string, roleIds: string[]) {
  for (const roleId of roleIds) {
    if (await userHasRole(userId, roleId)) return true;
  }
  return false;
}

export async function writeAuditRecord(input: {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb().insert(auditRecord).values({
    id: crypto.randomUUID(),
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}
