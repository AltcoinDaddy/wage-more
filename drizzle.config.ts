import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "~/config/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/*",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
