import * as z from "zod";

export const relayRequestSchema = z.object({
  target: z.string().startsWith("0x").length(42),
  value: z.string().default("0"),
  data: z.string().startsWith("0x"),
  signature: z.string().startsWith("0x"),
  owner: z.string().startsWith("0x").length(42),
});

export type RelayRequest = z.infer<typeof relayRequestSchema>;
