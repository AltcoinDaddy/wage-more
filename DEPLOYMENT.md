# Wagemore Deployment Guide

## Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables in .env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc
MAINNET_RPC_URL=your_mainnet_rpc (optional)
ETHERSCAN_API_KEY=your_etherscan_key (for verification)
```

## Quick Start - Deploy to Sepolia Testnet

### Option 1: Using Hardhat Ignition (Recommended)

```bash
# Deploy to Sepolia with default UMA oracle
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia

# Deploy with custom oracle address
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network sepolia \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x..."}}'

# Deploy WITHOUT oracle (testing only - for local development)
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network localhost \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

### Option 2: Using Hardhat Scripts

```bash
# Create a deployment script
npx hardhat run scripts/deploy-wagemore.js --network sepolia
```

## Network-Specific Deployments

### 1. **Sepolia Testnet** (Recommended for Testing)

```bash
# UMA Oracle: 0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia

# Get free Sepolia ETH from:
# - https://sepoliafaucet.com/
# - https://www.alchemy.com/faucets/ethereum-sepolia
```

### 2. **Ethereum Mainnet** (Production)

```bash
# IMPORTANT: Get correct UMA Oracle V3 address from docs.uma.xyz
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network mainnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x...MAINNET_ORACLE..."}}'

# Verify on Etherscan
npx hardhat verify --network mainnet DEPLOYED_ADDRESS "ORACLE_ADDRESS"
```

### 3. **Flow EVM Testnet**

```bash
# Add to hardhat.config.cjs:
# flowTestnet: {
#   url: "https://testnet.evm.nodes.onflow.org",
#   accounts: [process.env.PRIVATE_KEY],
#   chainId: 545
# }

npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network flowTestnet \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
# Note: UMA may not be on Flow, use address(0) or deploy custom oracle
```

### 4. **Chiliz Spicy Testnet**

```bash
# Add to hardhat.config.cjs:
# chilizSpicy: {
#   url: "https://spicy-rpc.chiliz.com",
#   accounts: [process.env.PRIVATE_KEY],
#   chainId: 88882
# }

npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network chilizSpicy \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

### 5. **Local Hardhat Network** (Development)

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat ignition deploy ignition/modules/Wagemore.ts \
  --network localhost \
  --parameters '{"WagemoreModule":{"oracleAddress":"0x0000000000000000000000000000000000000000"}}'
```

## Post-Deployment Steps

### 1. Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "ORACLE_ADDRESS"
```

### 2. Test the Deployment

```bash
# Run integration tests against deployed contract
DEPLOYED_ADDRESS=0x... npx hardhat test --network sepolia
```

### 3. Configure Initial Settings (if needed)

```javascript
// Using ethers.js
const wagemore = await ethers.getContractAt("Wagemore", DEPLOYED_ADDRESS);

// Update platform fee (optional)
await wagemore.setPlatformFee(500); // 5%

// Update creation fee (optional)
await wagemore.setCreationFee(ethers.parseEther("0.002"));

// Update assertion bond (optional)
await wagemore.setAssertionBond(ethers.parseEther("0.02"));
```

## UMA Oracle Addresses

### Testnets

- **Sepolia**: `0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB`
- **Goerli** (deprecated): Check docs.uma.xyz

### Mainnets

- **Ethereum**: Check [docs.uma.xyz/dev-ref/addresses](https://docs.uma.xyz/dev-ref/addresses)
- **Polygon**: Check UMA docs
- **Arbitrum**: Check UMA docs
- **Optimism**: Check UMA docs

### Not Supported (Use address(0))

- **Flow EVM**: UMA not deployed
- **Chiliz**: UMA not deployed
- **Local Development**: Use address(0) for testing

## Deployment Costs (Estimates)

| Network      | Gas Price   | Deployment Cost | Notes             |
| ------------ | ----------- | --------------- | ----------------- |
| **Sepolia**  | ~1 gwei     | $0 (testnet)    | Free test ETH     |
| **Mainnet**  | 20-50 gwei  | $100-300        | ~2.5M gas         |
| **Polygon**  | 50-200 gwei | $5-20           | Cheap alternative |
| **Arbitrum** | Low         | $10-30          | L2 savings        |
| **Flow**     | Low         | $5-15           | EVM compatible    |
| **Chiliz**   | Very low    | $1-5            | Sports-focused    |

## Deployment Checklist

Before deploying to mainnet:

- [ ] Contract audited (recommended for production)
- [ ] Tests pass locally (`npx hardhat test`)
- [ ] Deployed and tested on Sepolia
- [ ] UMA oracle address verified
- [ ] Environment variables set correctly
- [ ] Sufficient ETH for deployment (~0.1 ETH recommended)
- [ ] Backup of deployment keys secure
- [ ] Multi-sig wallet ready for ownership transfer (optional)

## Troubleshooting

### Error: "Insufficient bond"

- Increase the value sent with `proposeResolution()`
- Check `assertionBond` value: `await wagemore.assertionBond()`

### Error: "Oracle not configured"

- Contract was deployed with address(0)
- Update oracle: `await wagemore.setOracle(UMA_ADDRESS)`

### Error: "Assertion not settled"

- Wait for challenge period (2 hours default)
- Check assertion status on UMA dashboard

### Gas Price Too High

- Use networks like Polygon, Arbitrum, or Chiliz for lower costs
- Deploy during off-peak hours (weekends)

## Next Steps After Deployment

1. **Save Contract Address**

   ```bash
   echo "WAGEMORE_ADDRESS=0x..." >> .env
   ```

2. **Update Frontend Config**

   ```typescript
   // src/config/contracts.ts
   export const WAGEMORE_ADDRESS = "0x...";
   ```

3. **Index Events with Envio**
   - Update `envio.config.yaml` with contract address
   - Start indexer: `envio start`

4. **Test Create Market**

   ```bash
   npx hardhat run scripts/create-test-market.js --network sepolia
   ```

5. **Monitor on Block Explorer**
   - Sepolia: https://sepolia.etherscan.io/address/YOUR_ADDRESS
   - Mainnet: https://etherscan.io/address/YOUR_ADDRESS

## Support Resources

- **UMA Docs**: https://docs.uma.xyz/
- **Hardhat Ignition**: https://hardhat.org/ignition/docs/getting-started
- **Etherscan Verification**: https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify

## Example: Full Deployment Flow

```bash
# 1. Install and setup
npm install
cp .env.example .env
# Edit .env with your keys

# 2. Compile contracts
npx hardhat compile

# 3. Run tests
npx hardhat test

# 4. Deploy to Sepolia
npx hardhat ignition deploy ignition/modules/Wagemore.ts --network sepolia

# 5. Verify on Etherscan
# (Ignition does this automatically, but you can also do manually)
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB"

# 6. Test deployment
npx hardhat run scripts/test-deployment.js --network sepolia

# 7. Create first market
npx hardhat run scripts/create-market.js --network sepolia
```

Done! Your contract is now live and ready to use. 🚀
