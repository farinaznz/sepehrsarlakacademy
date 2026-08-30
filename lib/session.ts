import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { userHasRole } from "./auth-foundation";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(returnTo = "/dashboard") {
  const current = await getCurrentSession();
  if (!current) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return current;
}

export async function requireAdmin(returnTo = "/admin/enrollments") {
  const current = await requireSession(returnTo);
  if (!(await userHasRole(current.user.id, "admin"))) redirect("/dashboard");
  return current;
}
