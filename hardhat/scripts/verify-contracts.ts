/**
 * Contract verification script for Basescan
 * 
 * Usage:
 * npx ts-node scripts/verify-contracts.ts <FACTORY_ADDRESS> <ORACLE_ADDRESS>
 */

import { run } from "hardhat";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("❌ Error: Missing arguments");
    console.log("Usage: npx ts-node scripts/verify-contracts.ts <FACTORY_ADDRESS> <ORACLE_ADDRESS>");
    process.exit(1);
  }

  const factoryAddress = args[0];
  const oracleAddress = args[1];

  console.log("🔍 Verifying RaceFactory on Basescan...");
  console.log("Factory Address:", factoryAddress);
  console.log("Oracle Address:", oracleAddress);

  try {
    await run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [oracleAddress],
    });

    console.log("✅ Contract verified successfully!");
    console.log(`View on Basescan: https://sepolia.basescan.org/address/${factoryAddress}`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

