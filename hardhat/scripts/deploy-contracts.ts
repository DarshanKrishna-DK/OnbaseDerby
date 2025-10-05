/**
 * Deployment script for Onbase Derby contracts
 * 
 * This script deploys the RaceFactory contract to Base Sepolia
 * and outputs the deployment information
 * 
 * Usage:
 * npx ts-node scripts/deploy-contracts.ts
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting Onbase Derby Contract Deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Get oracle address from environment or use deployer as default
  const oracleAddress = process.env.ORACLE_ADDRESS || deployer.address;
  console.log("🔮 Oracle address:", oracleAddress, "\n");

  // Deploy RaceFactory
  console.log("📦 Deploying RaceFactory...");
  const RaceFactory = await ethers.getContractFactory("RaceFactory");
  const raceFactory = await RaceFactory.deploy(oracleAddress);
  await raceFactory.waitForDeployment();

  const factoryAddress = await raceFactory.getAddress();
  console.log("✅ RaceFactory deployed to:", factoryAddress);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    raceFactory: factoryAddress,
    oracle: oracleAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `deployment-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", filepath);

  console.log("\n" + "=".repeat(60));
  console.log("✨ Deployment Summary");
  console.log("=".repeat(60));
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("RaceFactory:", factoryAddress);
  console.log("Oracle:", oracleAddress);
  console.log("=".repeat(60));

  console.log("\n📋 Next steps:");
  console.log("1. Verify the contract on Basescan:");
  console.log(`   npx hardhat verify --network baseSepolia ${factoryAddress} ${oracleAddress}`);
  console.log("\n2. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_RACE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("\n3. Test the contract:");
  console.log("   - Create a race");
  console.log("   - Join with another wallet");
  console.log("   - Start the race");
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

