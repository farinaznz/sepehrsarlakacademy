import { sql } from "drizzle-orm";
import { getDb } from "../../../../db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();

  try {
    await getDb().execute(sql`select 1 as healthy`);

    return Response.json({
      status: "ok",
      database: "reachable",
      latencyMs: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    console.error("Database health check failed", error);

    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }
}
