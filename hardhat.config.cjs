require("@nomicfoundation/hardhat-toolbox-viem");
require("@nomicfoundation/hardhat-ignition-viem");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.FLOW_WALLET_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20", // Match contract pragma
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // Ethereum Networks
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
    
    // Flow EVM Networks
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [PRIVATE_KEY],
      chainId: 545,
    },
    flowMainnet: {
      url: "https://mainnet.evm.nodes.onflow.org",
      accounts: [PRIVATE_KEY],
      chainId: 747,
    },
    
    // Chiliz Networks
    chilizSpicy: {
      url: "https://spicy-rpc.chiliz.com",
      accounts: [PRIVATE_KEY],
      chainId: 88882,
    },
    chilizMainnet: {
      url: "https://rpc.ankr.com/chiliz",
      accounts: [PRIVATE_KEY],
      chainId: 88888,
    },
    
    // Local Development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    },
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 40000, // 40 seconds for tests
  },
};
