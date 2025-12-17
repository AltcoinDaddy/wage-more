import * as z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const serverEnv = envSchema.parse(process.env);
