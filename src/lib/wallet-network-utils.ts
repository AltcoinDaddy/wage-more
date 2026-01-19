/// <reference lib="dom" />
import { toast } from "sonner";
import type { Chain } from "viem";

// Extend Window type for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/**
 * Parameters for wallet_addEthereumChain RPC method
 */
interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Convert a Viem chain to the format needed for wallet_addEthereumChain
 */
function chainToAddEthereumChainParameter(
  chain: Chain,
): AddEthereumChainParameter {
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [...chain.rpcUrls.default.http], // Convert readonly array to mutable
    blockExplorerUrls: chain.blockExplorers?.default
      ? [chain.blockExplorers.default.url]
      : undefined,
  };
}

/**
 * Add a network to the user's wallet (e.g., MetaMask)
 * Uses the wallet_addEthereumChain RPC method (EIP-3085)
 */
export async function addNetworkToWallet(chain: Chain): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    toast.error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    return false;
  }

  try {
    const params = chainToAddEthereumChainParameter(chain);
    
    await (window as any).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [params],
    });

    toast.success(`${chain.name} network added successfully!`);
    return true;
  } catch (error: any) {
    // User rejected the request
    if (error.code === 4001) {
      toast.error("Network addition cancelled");
      return false;
    }

    // Chain already added
    if (error.code === -32002) {
      toast.info(`${chain.name} network is already pending approval`);
      return false;
    }

    console.error("Error adding network:", error);
    toast.error(`Failed to add ${chain.name} network`);
    return false;
  }
}

/**
 * Switch to a specific network
 * If the network is not added, it will prompt the user to add it first
 */
export async function switchToNetwork(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    toast.error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    return false;
  }

  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    return true;
  } catch (error: any) {
    // Network not added yet (error code 4902)
    if (error.code === 4902) {
      return false; // Caller should handle by adding the network
    }

    // User rejected
    if (error.code === 4001) {
      toast.error("Network switch cancelled");
      return false;
    }

    console.error("Error switching network:", error);
    toast.error("Failed to switch network");
    return false;
  }
}

/**
 * Switch to a network, adding it first if necessary
 */
export async function switchOrAddNetwork(chain: Chain): Promise<boolean> {
  const switched = await switchToNetwork(chain.id);
  
  if (!switched) {
    // Try to add the network
    const added = await addNetworkToWallet(chain);
    
    if (added) {
      // After adding, switch to it
      return await switchToNetwork(chain.id);
    }
    
    return false;
  }
  
  return true;
}
