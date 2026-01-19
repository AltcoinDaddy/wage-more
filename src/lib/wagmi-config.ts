import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { defineChain } from "viem";

// Flow EVM Testnet Configuration
export const flowTestnet = defineChain({
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: {
    name: "Flow",
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
      name: "Flow Testnet Explorer",
      url: "https://evm-testnet.flowscan.io",
    },
  },
  testnet: true,
});

// Flow EVM Mainnet Configuration
export const flowMainnet = defineChain({
  id: 747,
  name: "Flow EVM Mainnet",
  nativeCurrency: {
    name: "Flow",
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
      name: "Flow Explorer",
      url: "https://evm.flowscan.io",
    },
  },
  testnet: false,
});

// Chiliz Spicy Testnet Configuration
export const chilizSpicy = defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: {
    name: "Chiliz",
    symbol: "CHZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://spicy-rpc.chiliz.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Chiliz Spicy Explorer",
      url: "https://spicy-explorer.chiliz.com",
    },
  },
  testnet: true,
});

// Chiliz Mainnet Configuration
export const chilizMainnet = defineChain({
  id: 88888,
  name: "Chiliz Chain",
  nativeCurrency: {
    name: "Chiliz",
    symbol: "CHZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/chiliz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Chiliz Explorer",
      url: "https://explorer.chiliz.com",
    },
  },
  testnet: false,
});

export const config = createConfig({
  chains: [mainnet, sepolia, flowTestnet, flowMainnet, chilizSpicy, chilizMainnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [flowTestnet.id]: http("https://testnet.evm.nodes.onflow.org"),
    [flowMainnet.id]: http("https://mainnet.evm.nodes.onflow.org"),
    [chilizSpicy.id]: http("https://spicy-rpc.chiliz.com"),
    [chilizMainnet.id]: http("https://rpc.ankr.com/chiliz"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
