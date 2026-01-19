# Multi-Chain Deployment Strategy for WageMore

## Network-Specific Configurations

### **Ethereum Sepolia (Primary Testnet)** ⭐

**Use:** Full UMA Oracle

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia
```

- **Oracle:** UMA Optimistic Oracle V3 ✅
- **Challenge Period:** 2 hours
- **Cost:** Free (testnet)
- **Best for:** Testing full decentralized flow

---

### **Flow EVM Testnet** 🌊

**Use:** Direct Resolution (No Oracle)

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowTestnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

- **Oracle:** None (address(0))
- **Resolution:** Creator-based, instant
- **Cost:** Very low gas (~$0.01-0.05)
- **Best for:** Fast resolution, trusted creators

#### **Why No Oracle on Flow:**

- UMA not deployed on Flow EVM
- Alternative: Build reputation system in UI
- Owner can override malicious creators
- Future: Deploy custom simple oracle

---

### **Chiliz Spicy Testnet** 🌶️

**Use:** Direct Resolution (No Oracle)

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizSpicy \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

- **Oracle:** None (address(0))
- **Resolution:** Creator-based, instant
- **Cost:** Very low gas (~$0.005-0.02)
- **Best for:** Sports betting, fan tokens

#### **Why No Oracle on Chiliz:**

- UMA not deployed on Chiliz
- Sports results are publicly verifiable
- Build reputation for sports creators
- Future: Integrate with sports data APIs

---

### **Ethereum Mainnet** (Production)

**Use:** Full UMA Oracle

```bash
# Get correct mainnet UMA address from docs.uma.xyz
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network mainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x...MAINNET_UMA..."}}'
```

- **Oracle:** UMA Optimistic Oracle V3 ✅
- **Challenge Period:** 2 hours
- **Cost:** ~$100-300 deploy, $5-15 per resolution
- **Best for:** High-value markets, full decentralization

---

## Deployment Matrix

| Network          | Oracle | Resolution Type | Deploy Cost | Per-Market Cost | Best For            |
| ---------------- | ------ | --------------- | ----------- | --------------- | ------------------- |
| **Sepolia**      | UMA V3 | Decentralized   | Free        | Free            | Testing             |
| **Mainnet**      | UMA V3 | Decentralized   | ~$200       | ~$10            | High-value markets  |
| **Flow Testnet** | None   | Creator-based   | ~$0.50      | ~$0.05          | Fast sports betting |
| **Flow Mainnet** | None   | Creator-based   | ~$5         | ~$0.10          | Production sports   |
| **Chiliz Spicy** | None   | Creator-based   | ~$0.10      | ~$0.01          | Testing fan tokens  |
| **Chiliz Main**  | None   | Creator-based   | ~$1         | ~$0.02          | Sports predictions  |

---

## Recommended Multi-Chain Strategy

### **Phase 1: Test Everything** (Week 1-2)

```bash
# Deploy to Sepolia (with oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia

# Deploy to Flow Testnet (without oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowTestnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'

# Deploy to Chiliz Spicy (without oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizSpicy \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

**Test:**

- Create markets on all 3 networks
- Test resolution flows (oracle vs direct)
- Measure gas costs
- Identify any issues

---

### **Phase 2: Soft Launch** (Week 3-4)

```bash
# Deploy to Flow Mainnet (cheap, fast)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowMainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

**Focus:**

- Sports markets (publicly verifiable results)
- Trusted creators only (whitelist in UI)
- Small bet limits ($100 max pool)
- Build reputation system

---

### **Phase 3: Full Production** (Month 2+)

```bash
# Deploy to Ethereum Mainnet (high-value, decentralized)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network mainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x..."}}'

# Deploy to Chiliz Mainnet (sports-specific)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizMainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

**Strategy:**

- **Ethereum:** High-value markets (>$10k pools), full UMA oracle
- **Flow:** General predictions, moderate values, creator-based
- **Chiliz:** Sports-only, fan engagement, creator-based

---

## How to Handle Non-Oracle Chains

### **1. Reputation System (UI Layer)**

```typescript
// Track in Supabase
interface CreatorReputation {
  address: string;
  marketsCreated: number;
  correctResolutions: number;
  disputes: number;
  reputationScore: number; // 0-100
  isTrusted: boolean;
  isBlacklisted: boolean;
}

// Show badges in UI
if (creator.reputationScore > 90) {
  badge = "⭐ Trusted Creator";
} else if (creator.reputationScore > 70) {
  badge = "✓ Verified Creator";
} else {
  badge = "⚠️ New Creator - Bet carefully";
}
```

### **2. Dispute Mechanism (Smart Contract)**

```solidity
// Add to Wagemore.sol for non-oracle chains
mapping(uint64 => address[]) public disputedBy;
mapping(uint64 => bool) public underDispute;

function disputeResolution(uint64 marketId) external {
    require(!market.resolved, "Already finalized");
    require(msg.sender != market.creator, "Creator cannot dispute");

    disputedBy[marketId].push(msg.sender);

    if (disputedBy[marketId].length >= 3) {
        underDispute[marketId] = true;
        // Owner must review
    }
}
```

### **3. Time-Lock (Smart Contract)**

```solidity
// Add delay before creator's resolution is final
uint256 public resolutionDelay = 1 hours;

function proposeResolution(...) {
    market.proposedAt = block.timestamp;
    market.proposedWinner = winningOption;
}

function finalizeProposal(uint64 marketId) external {
    require(block.timestamp >= market.proposedAt + resolutionDelay);
    require(!underDispute[marketId]);
    // Now actually resolve
}
```

---

## Alternative Oracle Options for Flow/Chiliz

### **Option 1: Deploy Simple Trusted Oracle**

```solidity
// TrustedOracle.sol
contract TrustedOracle {
    address public oracle;

    mapping(bytes32 => ResolutionData) public resolutions;

    struct ResolutionData {
        bool resolved;
        uint8 winner;
        uint256 timestamp;
    }

    function submitResolution(
        bytes32 assertionId,
        uint8 winner
    ) external {
        require(msg.sender == oracle, "Only oracle");
        resolutions[assertionId] = ResolutionData({
            resolved: true,
            winner: winner,
            timestamp: block.timestamp
        });
    }
}
```

### **Option 2: Multi-Sig Oracle**

```solidity
// MultiSigOracle.sol
contract MultiSigOracle {
    address[] public validators;
    uint256 public requiredApprovals = 3;

    mapping(bytes32 => mapping(address => uint8)) public votes;
    mapping(bytes32 => uint256) public voteCount;

    function submitVote(bytes32 assertionId, uint8 winner) external {
        require(isValidator(msg.sender), "Not validator");
        votes[assertionId][msg.sender] = winner;
        voteCount[assertionId]++;

        if (voteCount[assertionId] >= requiredApprovals) {
            // Check if majority agrees
            finalizeResolution(assertionId);
        }
    }
}
```

### **Option 3: Chainlink (If Available)**

Check if Chainlink Data Feeds are on Flow:

- https://docs.chain.link/data-feeds/price-feeds/addresses
- If yes, use for price-based markets

---

## Production Deployment Commands

### **All Networks with Correct Oracle Config:**

```bash
# Sepolia (with UMA)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network sepolia

# Ethereum Mainnet (with UMA)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network mainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x...MAINNET_UMA_ADDRESS..."}}'

# Flow Testnet (no oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowTestnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'

# Flow Mainnet (no oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowMainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'

# Chiliz Spicy (no oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizSpicy \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'

# Chiliz Mainnet (no oracle)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizMainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

---

## Summary

✅ **Chains WITH Oracle:** Use UMA for decentralized resolution
✅ **Chains WITHOUT Oracle:** Use creator-based + reputation system
✅ **All Chains:** Same contract, different config
✅ **Future:** Can upgrade oracle address if UMA deploys to Flow/Chiliz

Your contract is **already designed** to handle both scenarios perfectly! 🚀
