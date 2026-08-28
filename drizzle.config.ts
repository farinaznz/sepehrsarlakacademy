import { defineConfig } from "drizzle-kit";
import { getServerEnv } from "./lib/env";

const env = getServerEnv();

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
