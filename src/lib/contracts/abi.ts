/**
 * Contract ABIs
 * Auto-extracted from compiled Hardhat artifacts
 */

// SmartAccount ABI
export const smartAccountAbi = [
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EXECUTE_TYPEHASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NAME",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "target", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "target", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "executeDirect",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;

// SmartAccountFactory ABI
export const smartAccountFactoryAbi = [
  {
    inputs: [{ internalType: "address", name: "_implementation", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "account", type: "address" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
    ],
    name: "AccountCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "deployAccount",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getAccountAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Wagemore ABI (Core Functions)
export const wagemoreAbi = [
  {
    inputs: [{ internalType: "address", name: "_optimisticOracle", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // View Functions
  {
    inputs: [],
    name: "ASSERTION_LIVENESS",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_IDENTIFIER",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "assertionBond",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextMarketId",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeeBps",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isOracleEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint64", name: "marketId", type: "uint64" }],
    name: "getMarketState",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint64", name: "endTime", type: "uint64" },
      { internalType: "uint64", name: "totalPool", type: "uint64" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "uint8", name: "winningOption", type: "uint8" },
      { internalType: "uint8", name: "optionCount", type: "uint8" },
      { internalType: "enum Wagemore.MarketType", name: "marketType", type: "uint8" },
      { internalType: "bytes32", name: "assertionId", type: "bytes32" },
      { internalType: "bool", name: "oracleResolved", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "marketId", type: "uint64" },
      { internalType: "uint8", name: "optionIndex", type: "uint8" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserBet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write Functions
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
      { internalType: "string[]", name: "optionLabels", type: "string[]" },
      { internalType: "uint64", name: "endTime", type: "uint64" },
      { internalType: "enum Wagemore.MarketType", name: "_marketType", type: "uint8" },
    ],
    name: "createMarket",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "marketId", type: "uint64" },
      { internalType: "uint8", name: "optionIndex", type: "uint8" },
    ],
    name: "purchaseShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint64", name: "marketId", type: "uint64" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "marketId", type: "uint64" },
      { internalType: "uint8", name: "winningOption", type: "uint8" },
      { internalType: "string", name: "evidence", type: "string" },
    ],
    name: "proposeResolution",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint64", name: "marketId", type: "uint64" }],
    name: "finalizeResolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint64", name: "marketId", type: "uint64" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "string", name: "imageUrl", type: "string" },
      { indexed: false, internalType: "string[]", name: "options", type: "string[]" },
      { indexed: false, internalType: "uint8", name: "optionCount", type: "uint8" },
      { indexed: false, internalType: "enum Wagemore.MarketType", name: "marketType", type: "uint8" },
      { indexed: false, internalType: "uint64", name: "endTime", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint64", name: "marketId", type: "uint64" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint8", name: "optionIndex", type: "uint8" },
      { indexed: false, internalType: "uint64", name: "amount", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    name: "SharesPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint64", name: "marketId", type: "uint64" },
      { indexed: false, internalType: "uint8", name: "winningOption", type: "uint8" },
      { indexed: false, internalType: "bytes32", name: "assertionId", type: "bytes32" },
      { indexed: false, internalType: "bool", name: "viaOracle", type: "bool" },
      { indexed: false, internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint64", name: "marketId", type: "uint64" },
      { indexed: true, internalType: "address", name: "claimer", type: "address" },
      { indexed: false, internalType: "uint64", name: "amount", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    name: "WinningsClaimed",
    type: "event",
  },
] as const;
