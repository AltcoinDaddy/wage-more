import * as z from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string(),
  VITE_APP_URL: z.string(),
  // Smart Wallet / Contracts - optional until contracts are deployed
  VITE_FACTORY_ADDRESS: z.string().startsWith("0x").optional().or(z.literal("")),
  VITE_WAGEMORE_ADDRESS: z.string().startsWith("0x").optional().or(z.literal("")),
  VITE_RPC_URL: z.string().optional().or(z.literal("")),
});

export const clientEnv = envSchema.parse(import.meta.env);
