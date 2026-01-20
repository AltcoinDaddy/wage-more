const { createPublicClient, createWalletClient, http, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require("dotenv").config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey === "" || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000001") {
    console.log("❌ PRIVATE_KEY is not set in .env file!");
    console.log("Please add your Flow EVM testnet private key to .env:");
    console.log('PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"');
    return;
  }

  const account = privateKeyToAccount(privateKey);
  console.log("✅ Wallet Address:", account.address);

  const client = createPublicClient({
    chain: {
      id: 545,
      name: "Flow EVM Testnet",
      nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
      rpcUrls: {
        default: { http: ["https://testnet.evm.nodes.onflow.org"] },
      },
    },
    transport: http("https://testnet.evm.nodes.onflow.org"),
  });

  const balance = await client.getBalance({ address: account.address });
  console.log("💰 Balance:", formatEther(balance), "FLOW");
  
  if (balance < BigInt("100000000000000000")) { // 0.1 FLOW
    console.log("\n⚠️  Insufficient balance for deployment!");
    console.log("Get testnet FLOW from: https://testnet-faucet.onflow.org/");
    console.log("Enter address:", account.address);
  } else {
    console.log("\n✅ Ready to deploy! Run:");
    console.log("npx hardhat ignition deploy ignition/modules/ProxyWallet.ts --network flowTestnet");
  }
}

main().catch(console.error);
