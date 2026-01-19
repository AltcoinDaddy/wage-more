// Deployment module for Wagemore prediction market with UMA Oracle
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * UMA Optimistic Oracle V3 Addresses
 * 
 * Mainnet: 0x... (check docs.uma.xyz for latest)
 * Sepolia: 0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB
 * Goerli: 0x... (deprecated)
 * 
 * For testing without oracle: use address(0)
 */

const WagemoreModule = buildModule("WagemoreModule", (m) => {
  // UMA Oracle address - configurable per network
  const oracleAddress = m.getParameter(
    "oracleAddress",
    "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB" // Sepolia default
  );

  // Deploy Wagemore contract
  const wagemore = m.contract("Wagemore", [oracleAddress]);

  return { wagemore };
});

export default WagemoreModule;
