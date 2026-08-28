import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "../lib/env";
import * as schema from "./schema";

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

const globalForDatabase = globalThis as typeof globalThis & {
  database?: DatabaseClient;
};

function createDatabaseClient() {
  const env = getServerEnv();
  const client = postgres(env.DATABASE_URL, {
    max: env.DB_POOL_MAX,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle(client, { schema });
}

export function getDb() {
  globalForDatabase.database ??= createDatabaseClient();
  return globalForDatabase.database;
}
