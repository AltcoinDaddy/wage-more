import type { Address, Hex } from "viem";

// Smart Account Types
export interface RelayRequest {
  target: Address;
  value: string;
  data: Hex;
  signature: Hex;
  owner: Address;
}

export interface RelayResponse {
  success: boolean;
  txHash?: string;
  smartAccountAddress?: Address;
  error?: string;
}

export interface SmartWalletState {
  smartAccountAddress: Address | undefined;
  isSmartAccountDeployed: boolean;
}
