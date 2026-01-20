import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { db } from "~/db/client";
import { market } from "~/db/schema";
import { auth } from "~/lib/auth";
import { serverEnv } from "~/config/env";
import { wagemoreAbi } from "~/lib/contracts";
import { flowEvmTestnet } from "~/lib/chains";

// Config
const RPC_URL = serverEnv.RPC_URL || "https://testnet.evm.nodes.onflow.org";
const RELAYER_PK = serverEnv.RELAYER_PRIVATE_KEY as Hex;
const WAGEMORE_ADDRESS = process.env.VITE_WAGEMORE_ADDRESS as Address;

// Contract Constants (from Wagemore.sol)
export const CREATION_FEE = "0.001"; // 0.001 FLOW
export const PLATFORM_FEE_BPS = 1000; // 10%

// Input type matching frontend form
export interface CreateMarketInput {
  title: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  endTime: string; // ISO string from frontend
  marketType: "BINARY" | "MULTIPLE";
  options: { name: string }[];
  creatorAddress: string;
}

export interface CreateMarketResponse {
  success: boolean;
  tempId?: string;
  chainId?: number;
  txHash?: string;
  error?: string;
}

/**
 * Creates a market on-chain and saves to DB
 * Uses relayer to pay gas (gasless for user)
 */
export const createMarketFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreateMarketInput) => data)
  .handler(async ({ data }): Promise<CreateMarketResponse> => {
    const requestHeaders = getRequest().headers;
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (!RELAYER_PK || !WAGEMORE_ADDRESS) {
      return { success: false, error: "Server not configured for market creation" };
    }

    try {
      // 1. Create market in DB first (optimistic)
      const [dbMarket] = await db
        .insert(market)
        .values({
          creatorAddress: data.creatorAddress,
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          tags: data.tags,
          // DB Fix: Force MULTIPLE if options > 2 (even if frontend sent BINARY)
          marketType: data.options.length > 2 ? "MULTIPLE" : data.marketType,
          endTime: new Date(data.endTime),
          options: data.options.map((opt, idx) => ({
            id: idx,
            name: opt.name,
          })),
          status: "PENDING_CREATION",
        })
        .returning();

      if (!dbMarket) {
        return { success: false, error: "Failed to create market in database" };
      }

      // 2. Create on-chain via relayer
      const account = privateKeyToAccount(RELAYER_PK);
      const client = createPublicClient({
        chain: flowEvmTestnet,
        transport: http(RPC_URL),
      });
      const wallet = createWalletClient({
        account,
        chain: flowEvmTestnet,
        transport: http(RPC_URL),
      });

      // Prepare option labels for contract
      const optionLabels = data.options.map((opt) => opt.name);

      // Call createMarket on contract
      // Note: Relayer pays the creation fee (0.001 FLOW)
      const txHash = await wallet.writeContract({
        address: WAGEMORE_ADDRESS,
        abi: wagemoreAbi,
        functionName: "createMarket",
        args: [
          data.title,
          data.imageUrl || "",
          optionLabels,
          BigInt(Math.floor(new Date(data.endTime).getTime() / 1000)), // Unix timestamp
          // Force MULTIPLE if options > 2, otherwise respect input
          data.options.length > 2 ? 1 : (data.marketType === "BINARY" ? 0 : 1),
        ],
        value: parseEther(CREATION_FEE), // Creation fee
      });

      console.log(`[Market] Created tx: ${txHash}`);

      // 3. Wait for receipt to get marketId from event
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });

      // Parse MarketCreated event to get chain ID
      let chainMarketId: number | undefined;
      for (const log of receipt.logs) {
        try {
          // Look for MarketCreated event (first topic is event signature)
          // MarketCreated(uint64 marketId, address creator, ...)
          if (log.topics[1]) {
            // First indexed param is marketId
            chainMarketId = Number(BigInt(log.topics[1]));
            break;
          }
        } catch {
          // Skip non-matching logs
        }
      }

      // 4. Update DB with chain ID and status
      await db
        .update(market)
        .set({
          id: chainMarketId,
          status: "ACTIVE",
        })
        .where(eq(market.tempId, dbMarket.tempId));

      return {
        success: true,
        tempId: dbMarket.tempId,
        chainId: chainMarketId,
        txHash,
      };
    } catch (error) {
      console.error("[Market] Creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

/**
 * Get creation fee from contract (for UI display)
 */
export const getMarketCreationFee = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      creationFee: CREATION_FEE,
      platformFeeBps: PLATFORM_FEE_BPS,
      platformFeePercent: PLATFORM_FEE_BPS / 100,
    };
  }
);

/**
 * Validates and formats market data for the frontend
 */
export const getMarketsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const markets = await db.query.market.findMany({
      where: eq(market.status, "ACTIVE"),
      orderBy: (markets, { desc }) => [desc(markets.createdAt)],
    });

    return markets.map((m) => {
      // Robust Check: If options > 2, treat as MULTIPLE regardless of DB flag
      // This handles cases where Binary was selected but >2 options were added
      const isMultiple = m.options.length > 2 || m.marketType === "MULTIPLE";
      const isBinary = !isMultiple; // Only true if options <= 2 AND type is BINARY

      const volume = m.totalPool
        ? `${formatEther(BigInt(m.totalPool))} FLOW`
        : "0 FLOW";

      // BINARY DATA: Only if exactly 2 options
      const binaryData = isBinary && m.options.length >= 2
        ? {
            yes: { label: m.options[0]?.name || "Yes", value: 50, change: 0 },
            no: { label: m.options[1]?.name || "No", value: 50, change: 0 },
          }
        : undefined;

      // MULTI DATA: Used for Multiple markets OR if data is malformed
      const multiData = isMultiple
        ? m.options.map((opt) => ({
            label: opt.name,
            yes: 50, // placeholder until betting implemented
            no: 50,  // placeholder
          }))
        : undefined;

      return {
        id: m.id || m.tempId, 
        title: m.title,
        imageSrc: m.imageUrl || "/placeholder-market.jpg",
        type: isMultiple ? "multiple" : "binary",
        volume,
        comments: 0, 
        // New if created within last 24 hours
        isNew: Date.now() - m.createdAt.getTime() < 24 * 60 * 60 * 1000,
        binaryData,
        multiData,
        tags: m.tags,
      };
    });
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    return [];
  }
});
