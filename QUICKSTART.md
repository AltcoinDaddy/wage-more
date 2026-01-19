# ✅ Wagemore Oracle-Based Contract - Ready to Deploy!

## 🎉 What's Been Set Up

### 1. **Main Contract: `contracts/Wagemore.sol`**

✅ **UMA Optimistic Oracle V3 Integration**

- Free oracle (only refundable bonds)
- 2-hour challenge period
- Community dispute resolution
- Decentralized & trustless

✅ **Key Features:**

- Market creators can propose resolutions
- Anyone can challenge incorrect outcomes
- Automatic settlement after challenge period
- Emergency override for broken oracles
- Works on any EVM chain

### 2. **Deployment Module: `ignition/modules/Wagemore.ts`**

✅ Hardhat Ignition ready
✅ Configurable oracle address per network
✅ Simple one-command deployment

### 3. **Network Configuration: `hardhat.config.cjs`**

✅ **Supported Networks:**

- Ethereum Mainnet & Sepolia
- Flow EVM Mainnet & Testnet
- Chiliz Mainnet & Spicy Testnet
- Local Hardhat/Localhost

✅ Compiler optimization enabled
✅ Etherscan verification ready

### 4. **Documentation: `DEPLOYMENT.md`**

✅ Complete deployment guide
✅ Network-specific instructions
✅ Troubleshooting section
✅ Post-deployment checklist

---

## 🚀 Quick Start - Deploy Now!

### **Test Deployment (Sepolia - Recommended First Step)**

```bash
# 1. Make sure you have test ETH from Sepolia faucet
# Get free ETH: https://sepoliafaucet.com/

# 2. Set your private key in .env
echo "PRIVATE_KEY=your_private_key_here" >> .env

# 3. Deploy to Sepolia (UMA oracle already configured)
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia

# That's it! 🎉
```

### **Expected Output:**

```
✔ Confirm deploy to network sepolia (11155111)? … yes
Hardhat Ignition 🚀

Deploying [ WagemoreModule ]

Batch #1
  Executed WagemoreModule#Wagemore

[ WagemoreModule ] successfully deployed 🚀

Deployed Addresses

WagemoreModule#Wagemore - 0x...YourContractAddress...
```

---

## 📋 Deployment Checklist

### Before Deploying:

- [x] Contract compiled successfully ✅
- [ ] Set `PRIVATE_KEY` in `.env`
- [ ] Have test ETH in wallet (for Sepolia)
- [ ] Verified UMA oracle address for your network

### After Deploying:

- [ ] Save contract address
- [ ] Verify contract on Etherscan
- [ ] Update frontend config
- [ ] Create test market
- [ ] Test propose → finalize flow

---

## 🔧 How It Works

### **For Market Creators:**

```solidity
// 1. Create market (free for owner, 0.001 ETH for others)
createMarket(
    "Will Bitcoin hit $100k by Dec 31?",
    "https://...",
    ["Yes", "No"],
    endTime,
    MarketType.Binary
)

// 2. After market ends, propose result
proposeResolution(
    marketId,
    winningOption, // 0 or 1
    "ipfs://evidence..." // Link to proof
    { value: 0.01 ether } // Refundable bond
)

// 3. Wait 2 hours (challenge period)

// 4. Anyone can finalize
finalizeResolution(marketId)
```

### **For Bettors:**

```solidity
// Buy shares
purchaseShares(marketId, optionIndex, { value: betAmount })

// After resolution, claim winnings
claimWinnings(marketId)
```

---

## 🌐 Network-Specific Deploy Commands

### **Sepolia (Test with UMA Oracle)**

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia
# Oracle: 0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB (auto-configured)
```

### **Flow Testnet (Without Oracle)**

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowTestnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

### **Chiliz Spicy (Without Oracle)**

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizSpicy \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

### **Local Development**

```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network localhost \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

---

## 💰 Costs

| Action              | Gas Cost  | USD (@ 50 gwei) |
| ------------------- | --------- | --------------- |
| **Deploy Contract** | ~2.5M gas | ~$125           |
| Create Market       | ~200k gas | ~$10            |
| Purchase Shares     | ~80k gas  | ~$4             |
| Propose Resolution  | ~150k gas | ~$7.50          |
| Finalize Resolution | ~100k gas | ~$5             |
| Claim Winnings      | ~50k gas  | ~$2.50          |

**Oracle Cost:** $0 (bonds are refunded if correct!)

---

## 🔑 Key Contract Functions

### **Admin Functions:**

```javascript
// Update fees
await wagemore.setPlatformFee(500); // 5%
await wagemore.setCreationFee(ethers.parseEther("0.002"));
await wagemore.setAssertionBond(ethers.parseEther("0.02"));

// Update oracle (if needed)
await wagemore.setOracle(newOracleAddress);

// Emergency pause
await wagemore.pause();
await wagemore.unpause();

// Withdraw accumulated fees
await wagemore.withdrawFees();
```

### **View Functions:**

```javascript
// Get market details
const market = await wagemore.getMarketState(marketId);
// Returns: creator, endTime, totalPool, resolved, winningOption, etc.

// Check user's bet
const userBet = await wagemore.getUserBet(marketId, optionIndex, userAddress);

// Check if oracle is enabled
const oracleEnabled = await wagemore.isOracleEnabled();
```

---

## 🎯 Next Steps

### 1. **Deploy to Sepolia**

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia
```

### 2. **Verify on Etherscan**

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB"
```

### 3. **Update Frontend**

```typescript
// src/config/contracts.ts
export const WAGEMORE_ADDRESS = "0x...";
export const WAGEMORE_CHAIN_ID = 11155111; // Sepolia
```

### 4. **Create Test Market**

Use Remix, Hardhat console, or your frontend to create a test market.

### 5. **Test Full Flow**

- Create market
- Place bets
- Wait for end time
- Propose resolution (with evidence)
- Wait 2 hours
- Finalize resolution
- Claim winnings

---

## 📚 Additional Resources

- **Full Deployment Guide:** `DEPLOYMENT.md`
- **UMA Documentation:** https://docs.uma.xyz/
- **Hardhat Ignition:** https://hardhat.org/ignition
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts
- **Sepolia Faucet:** https://sepoliafaucet.com/

---

## ⚠️ Important Notes

1. **Oracle is Optional:** Contract works with `address(0)` for chains without UMA (Flow, Chiliz)
2. **Bonds are Refundable:** 0.01 ETH bond is returned if not challenged
3. **2-Hour Wait:** Challenge period before resolution finalizes
4. **Emergency Override:** Owner can resolve after 7 days if oracle breaks
5. **Testnet First:** Always test on Sepolia before mainnet!

---

## 🆘 Troubleshooting

**Q: "Insufficient bond" error?**

- Send at least 0.01 ETH with `proposeResolution()`

**Q: "Oracle not configured"?**

- Deployed with `address(0)`, use `emergencyResolve()` instead

**Q: "Assertion not settled"?**

- Wait full 2 hours after proposing
- No one challenged, so it auto-approves

**Q: Deployment fails?**

- Check you have enough ETH for gas
- Verify private key is set correctly
- Try increasing gas limit

---

## ✅ You're All Set!

Your oracle-based Wagemore contract is:

- ✅ Compiled and ready
- ✅ Configured for multiple networks
- ✅ Integrated with FREE UMA oracle
- ✅ One command away from deployment

**Run this now to deploy:**

```bash
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia
```

Good luck! 🚀
