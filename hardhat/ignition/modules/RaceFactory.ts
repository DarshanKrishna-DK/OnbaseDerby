import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for RaceFactory contract
 * 
 * Usage:
 * npx hardhat ignition deploy ignition/modules/RaceFactory.ts --network baseSepolia
 * 
 * Make sure to set DEPLOYER_PRIVATE_KEY and ORACLE_ADDRESS in your .env file
 */
const RaceFactoryModule = buildModule("RaceFactoryModule", (m) => {
  // Oracle address - should be set in environment or passed as parameter
  const oracleAddress = m.getParameter(
    "oracleAddress",
    process.env.ORACLE_ADDRESS || "0x0000000000000000000000000000000000000000"
  );

  // Deploy RaceFactory with oracle address
  const raceFactory = m.contract("RaceFactory", [oracleAddress]);

  return { raceFactory };
});

export default RaceFactoryModule;

