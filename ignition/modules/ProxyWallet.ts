import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProxyWalletModule = buildModule("ProxyWalletModule", (m) => {
  // 1. Deploy the Implementation Contract
  const smartAccountImpl = m.contract("SmartAccount");

  // 2. Deploy the Factory, passing the Implementation address
  const smartAccountFactory = m.contract("SmartAccountFactory", [smartAccountImpl]);

  return { smartAccountImpl, smartAccountFactory };
});

export default ProxyWalletModule;
