import { useAccount, useSignTypedData, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { relayTransaction } from "~/server/relayer";
import { type Hex, type Address } from "viem";
import { getCurrentUser } from "~/server/user";
import { clientEnv } from "~/config/client-env";
import { smartAccountAbi, smartAccountFactoryAbi } from "~/lib/contracts";
import type { SmartWalletState, RelayResponse } from "~/lib/types";

// Configuration (Must match contract)
const DOMAIN_NAME = "Wagemore Smart Account";
const DOMAIN_VERSION = "1.0.0";

// Types for EIP-712
const TYPES = {
  Execute: [
    { name: "target", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export function useSmartWallet(): SmartWalletState & {
  sendGaslessTransaction: (target: Address, value: bigint, callData: Hex) => Promise<RelayResponse>;
  getSmartAccountAddress: () => Promise<Address>;
} {
  const { address: owner } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();

  // Fetch user data to get stored smartAccountAddress
  const { data: userData } = useQuery({
    queryKey: ["current-user-smart-wallet"],
    queryFn: () => getCurrentUser(),
    enabled: !!owner,
  });

  const getSmartAccountAddress = async (): Promise<Address> => {
    // 1. Try to use stored address from DB first (deployed at onboarding)
    if (userData?.smartAccountAddress) {
      return userData.smartAccountAddress as Address;
    }

    // 2. Fallback: Calculate from factory (for users onboarded without smart wallet)
    if (!publicClient || !clientEnv.VITE_FACTORY_ADDRESS || !owner) {
      throw new Error("Cannot determine Smart Account address");
    }

    const predictedAddress = await publicClient.readContract({
      address: clientEnv.VITE_FACTORY_ADDRESS as Address,
      abi: smartAccountFactoryAbi,
      functionName: "getAccountAddress",
      args: [owner],
    }) as Address;

    return predictedAddress;
  };

  const sendGaslessTransaction = async (
    target: Address,
    value: bigint,
    callData: Hex
  ): Promise<RelayResponse> => {
    if (!owner) throw new Error("Wallet not connected");
    if (!publicClient) throw new Error("Public Client not ready");
    if (!clientEnv.VITE_FACTORY_ADDRESS) throw new Error("Factory Address not configured");

    // 1. Get Smart Account Address
    const smartAccountAddress = await getSmartAccountAddress();

    // 2. Get Nonce (check if deployed first)
    let nonce = 0n;
    const code = await publicClient.getBytecode({ address: smartAccountAddress });
    if (code && code !== "0x") {
      nonce = await publicClient.readContract({
        address: smartAccountAddress,
        abi: smartAccountAbi,
        functionName: "nonce",
      }) as bigint;
    }

    // 3. Chain ID
    const chainId = await publicClient.getChainId();

    // 4. Sign Message
    const signature = await signTypedDataAsync({
      domain: {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: chainId,
        verifyingContract: smartAccountAddress,
      },
      types: TYPES,
      primaryType: "Execute",
      message: {
        target,
        value,
        data: callData,
        nonce,
      },
    });

    // 5. Send to Relayer
    const result = await relayTransaction({
      data: {
        target,
        value: value.toString(),
        data: callData,
        signature,
        owner,
      },
    });

    if (!result.success) {
      throw new Error(result.error || "Relayer failed");
    }

    return result;
  };

  return {
    sendGaslessTransaction,
    getSmartAccountAddress,
    smartAccountAddress: userData?.smartAccountAddress as Address | undefined,
    isSmartAccountDeployed: !!userData?.smartAccountAddress,
  };
}
