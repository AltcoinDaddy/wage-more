import { defineChain } from "viem";

// Flow EVM Testnet Chain Definition
export const flowEvmTestnet = defineChain({
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: {
    name: "FLOW",
    symbol: "FLOW",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.nodes.onflow.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Flow EVM Testnet Explorer",
      url: "https://evm-testnet.flowscan.io",
    },
  },
  testnet: true,
});

// Flow EVM Mainnet Chain Definition
export const flowEvmMainnet = defineChain({
  id: 747,
  name: "Flow EVM Mainnet",
  nativeCurrency: {
    name: "FLOW",
    symbol: "FLOW",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.evm.nodes.onflow.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Flow EVM Explorer",
      url: "https://evm.flowscan.io",
    },
  },
  testnet: false,
});
