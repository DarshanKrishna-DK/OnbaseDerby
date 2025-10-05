# 🏁 Onbase Derby - Setup Guide

## Overview
Onbase Derby is a tap-to-win racing game built on Base Sepolia testnet. Players stake ETH, join teams, and tap to race. Winners split the prize pool proportionally based on their tap contributions.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Hardhat dependencies
cd hardhat
npm install
cd ..
```

### 2. Environment Setup

#### Frontend Environment (`.env.local`)
```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
# REQUIRED: Deployed RaceFactory contract address
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=

# Required for wallet connection
NEXT_PUBLIC_USE_WALLET=true
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

#### Hardhat Environment (`hardhat/.env`)
```bash
cd hardhat
cp env.example .env
```

Edit `hardhat/.env`:
```env
# Get from: https://dashboard.alchemy.com or https://infura.io
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Your wallet private key (NEVER commit this!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional: for contract verification
BASESCAN_API_KEY=your_basescan_api_key
ORACLE_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## 🎮 Running the App

### Production Mode (Blockchain Required)

#### Step 1: Deploy Contracts
```bash
cd hardhat
npm run deploy:baseSepolia
```

Save the deployed `RaceFactory` address!

#### Step 2: Update Environment
Edit `.env.local`:
```env
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=0xYourDeployedAddress
```

#### Step 3: Run App
```bash
npm run dev
```

---

## 🧪 Multi-Player Testing

### Testing with Multiple Users

**Option 1: Different Browsers**
1. Open Chrome: User 1
2. Open Firefox/Edge: User 2
3. Each connects with different wallet

**Option 2: Incognito Windows**
1. Chrome normal window: User 1
2. Chrome incognito: User 2

**Option 3: Multiple Devices**
Test on your phone and computer simultaneously!

---

## 🎯 How to Play

### As Host (Create Race)
1. Connect wallet
2. Click "Create a Race"
3. Select entry fee (0.001, 0.01, or 0.1 ETH)
4. Click "Create" → Sign transaction
5. Wait for players to join
6. Click "Start Race" when ready

### As Player (Join Race)
1. Connect wallet
2. Browse "Active Races"
3. Click "Join Race" on any race
4. Sign transaction to pay entry fee
5. Wait for host to start
6. TAP TAP TAP! 🚀

### During Race
- Tap as fast as you can!
- Each tap moves your team's coin
- First team to complete 3 laps wins!
- Winners split prize pool by tap %

---

## 🔧 Troubleshooting

### "Failed to create race" Error
**Problem:** ABI mismatch or contract not deployed

**Solution:**
1. Ensure contracts are compiled: `cd hardhat && npm run compile`
2. Check `NEXT_PUBLIC_RACE_FACTORY_ADDRESS` is set correctly
3. Verify you're on Base Sepolia network

### 404 API Errors
**Problem:** Race doesn't exist in backend state

**Solution:**
- Wait for host to initialize race
- Refresh the page
- The polling will auto-load the race

### Wallet Not Connecting
**Problem:** Metamask/wallet not installed

**Solution:**
1. Install Metamask browser extension
2. Switch to Base Sepolia network
3. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Transactions Not Going Through
**Problem:** Insufficient gas or wrong network

**Solution:**
1. Ensure you have Base Sepolia ETH
2. Check you're on Base Sepolia (chainId: 84532)
3. Try increasing gas limit in wallet

### Race ID 0 Errors
**Problem:** Getting 404 errors for `/api/race/0/state` or `/api/race/0/tap`

**Solution:**
- Race ID 0 is **VALID**! Smart contracts start counting from 0
- The race just needs to be initialized first
- Click "Enter Lobby" after creating the race
- Check browser console for detailed logs with emojis 🏁

---

## 📝 Development Commands

### Root Project
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run linter
```

### Hardhat (Smart Contracts)
```bash
cd hardhat

npm run compile              # Compile contracts
npm run test                 # Run tests
npm run deploy:baseSepolia   # Deploy to Base Sepolia
npm run verify               # Verify on Basescan
```

---

## 🌐 Networks

### Base Sepolia Testnet
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

---

## 📂 Project Structure

```
base-template-mini-app/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # Backend API routes
│   │   └── page.tsx        # Main entry point
│   ├── components/         # React components
│   │   ├── pages/          # Page components
│   │   ├── ui/             # UI components
│   │   └── CircularTrack.tsx
│   └── lib/                # Utility libraries
│       ├── contracts/      # Smart contract integration
│       └── race-state.ts   # In-memory race state
├── hardhat/                # Smart contract project
│   ├── contracts/          # Solidity contracts
│   ├── ignition/           # Deployment modules
│   └── test/               # Contract tests
└── public/                 # Static assets
```

---

## 🎨 Features

- ✅ Wallet connection (Metamask, Coinbase Wallet)
- ✅ Create races with custom entry fees (0.001, 0.01, 0.1 ETH)
- ✅ Join existing races with blockchain transactions
- ✅ Real-time tap racing with live updates
- ✅ Circular race track visualization
- ✅ 3-lap race system (3000 taps = 3 laps)
- ✅ Proportional prize distribution to winners
- ✅ Mobile-first responsive design
- ✅ Production-ready for Farcaster deployment

---

## 🔐 Security Notes

- **NEVER** commit your `.env` or `.env.local` files
- **NEVER** share your `DEPLOYER_PRIVATE_KEY`
- Use testnet funds only for testing
- Smart contracts handle escrow and payouts securely

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review console logs for errors
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

---

## 🎯 Next Steps

1. ✅ Deploy contracts
2. ✅ Test in demo mode
3. ✅ Test with real wallets on Base Sepolia
4. 🚀 Ready for production on Base Mainnet!

---

**Happy Racing! 🏁**

