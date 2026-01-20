import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { verifyMessage, createPublicClient, createWalletClient, http, type Hex, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { db } from "~/db/client";
import { user } from "~/db/schema";
import { auth } from "~/lib/auth";
import { serverEnv } from "~/config/env";
import { smartAccountFactoryAbi } from "~/lib/contracts";
import { flowEvmTestnet } from "~/lib/chains";
import type { OnboardingData, OnboardingResponse } from "~/lib/types";

// Config from validated env
const RPC_URL = serverEnv.RPC_URL || "https://testnet.evm.nodes.onflow.org";
const RELAYER_PK = serverEnv.RELAYER_PRIVATE_KEY as Hex;
const FACTORY_ADDRESS = process.env.VITE_FACTORY_ADDRESS as Address;

/**
 * Deploys a Smart Account for a given wallet address.
 * Returns the deployed smart account address.
 */
async function deploySmartAccountForUser(walletAddress: Address): Promise<Address> {
  if (!RELAYER_PK || !FACTORY_ADDRESS) {
    throw new Error("Relayer not configured");
  }

  const account = privateKeyToAccount(RELAYER_PK);
  const client = createPublicClient({
    chain: flowEvmTestnet,
    transport: http(RPC_URL)
  });
  const wallet = createWalletClient({
    account,
    chain: flowEvmTestnet,
    transport: http(RPC_URL)
  });

  // Get predicted address
  const smartAccountAddress = await client.readContract({
    address: FACTORY_ADDRESS,
    abi: smartAccountFactoryAbi,
    functionName: "getAccountAddress",
    args: [walletAddress]
  }) as Address;

  // Check if already deployed
  const code = await client.getBytecode({ address: smartAccountAddress });
  if (code && code !== "0x") {
    console.log(`[Onboarding] Smart Account already exists for ${walletAddress}: ${smartAccountAddress}`);
    return smartAccountAddress;
  }

  // Deploy
  console.log(`[Onboarding] Deploying Smart Account for ${walletAddress}...`);
  const deployTx = await wallet.writeContract({
    address: FACTORY_ADDRESS,
    abi: smartAccountFactoryAbi,
    functionName: "deployAccount",
    args: [walletAddress],
  });
  await client.waitForTransactionReceipt({ hash: deployTx });
  console.log(`[Onboarding] Deployed at ${smartAccountAddress}`);

  return smartAccountAddress;
}

export const completeOnboardingFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: OnboardingData) => data)
  .handler(async ({ data }): Promise<OnboardingResponse> => {
    const requestHeaders = getRequest().headers;

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session) throw new Error("Unauthorized");

    // 1. Verify wallet signature
    const isValid = await verifyMessage({
      address: data.walletAddress as `0x${string}`,
      message: `Link wallet ${data.walletAddress} to account ${session.user.id}`,
      signature: data.signature as `0x${string}`,
    });

    if (!isValid) throw new Error("Invalid wallet signature");

    // 2. Check if wallet is already taken by another user
    const existingWallet = await db.query.user.findFirst({
      where: eq(user.walletAddress, data.walletAddress),
    });

    if (existingWallet && existingWallet.id !== session.user.id) {
      throw new Error("Wallet already linked to another account");
    }

    // 3. Deploy Smart Account for user (GASLESS FOR THEM!)
    let smartAccountAddress: Address | null = null;
    try {
      smartAccountAddress = await deploySmartAccountForUser(data.walletAddress as Address);
    } catch (err) {
      console.error("[Onboarding] Failed to deploy Smart Account:", err);
      // Continue without smart account - can be deployed later
    }

    // 4. Update User Profile
    await db
      .update(user)
      .set({
        name: data.username,
        interests: data.interests,
        walletAddress: data.walletAddress,
        smartAccountAddress: smartAccountAddress,
        onboardingCompleted: true,
      })
      .where(eq(user.id, session.user.id));

    return {
      success: true,
      smartAccountAddress
    };
  });
