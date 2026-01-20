import { createServerFn } from "@tanstack/react-start";
import { createPublicClient, createWalletClient, http, type Hex, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { relayRequestSchema } from "~/lib/validators/relayer";
import { serverEnv } from "~/config/env";
import { smartAccountAbi, smartAccountFactoryAbi } from "~/lib/contracts";
import { flowEvmTestnet } from "~/lib/chains";
import type { RelayResponse } from "~/lib/types";

// Config from validated env
const RPC_URL = serverEnv.RPC_URL || "https://testnet.evm.nodes.onflow.org";
const RELAYER_PK = serverEnv.RELAYER_PRIVATE_KEY as Hex;
const FACTORY_ADDRESS = process.env.VITE_FACTORY_ADDRESS as Address;

export const relayTransaction = createServerFn({ method: "POST" })
  .inputValidator(relayRequestSchema)
  .handler(async ({ data: { target, value, data: callData, signature, owner } }): Promise<RelayResponse> => {
    if (!RELAYER_PK) throw new Error("RELAYER_PRIVATE_KEY not configured");
    if (!FACTORY_ADDRESS) throw new Error("FACTORY_ADDRESS not configured");

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

    // Predict / Check Smart Account
    const smartAccountAddress = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: smartAccountFactoryAbi,
      functionName: "getAccountAddress",
      args: [owner as Address]
    }) as Address;

    const code = await client.getBytecode({ address: smartAccountAddress });
    const isDeployed = code && code !== "0x";

    // Deploy if not exists
    if (!isDeployed) {
      console.log(`[Relayer] Deploying new Smart Account for ${owner}...`);
      const deployTx = await wallet.writeContract({
        address: FACTORY_ADDRESS,
        abi: smartAccountFactoryAbi,
        functionName: "deployAccount",
        args: [owner as Address],
      });
      await client.waitForTransactionReceipt({ hash: deployTx });
      console.log(`[Relayer] Deployed at ${smartAccountAddress}`);
    }

    // Execute the User's Intent
    console.log(`[Relayer] Executing meta-transaction for ${smartAccountAddress}...`);
    try {
      const txHash = await wallet.writeContract({
        address: smartAccountAddress,
        abi: smartAccountAbi,
        functionName: "execute",
        args: [
          target as Address,
          BigInt(value),
          callData as Hex,
          signature as Hex
        ]
      });

      console.log(`[Relayer] Transaction submitted: ${txHash}`);
      return { success: true, txHash, smartAccountAddress };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[Relayer] Execution failed:", message);
      return { success: false, error: message };
    }
  });
