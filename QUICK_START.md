# ⚡ Onbase Derby - Quick Start

Get up and running in 5 minutes!

## ✅ Checklist

- [ ] Install frontend dependencies: `npm install`
- [ ] Install contract dependencies: `cd hardhat && npm install && cd ..`
- [ ] Create `.env.local` file in root (see template below)
- [ ] Create `hardhat/.env` file (see template below)
- [ ] Get Base Sepolia testnet ETH
- [ ] Deploy contracts: `cd hardhat && npm run deploy:baseSepolia`
- [ ] Add contract address to `.env.local`
- [ ] Start frontend: `npm run dev`
- [ ] Open http://localhost:3000

## 📝 .env.local Template (Root Directory)

```bash
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME=Onbase Derby
NEXT_PUBLIC_FRAME_DESCRIPTION=Tap-to-win racing game on Base
NEXT_PUBLIC_USE_WALLET=true
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=
```

## 📝 hardhat/.env Template

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0xyour_private_key_here
ORACLE_ADDRESS=0xyour_wallet_address_here
BASESCAN_API_KEY=your_api_key_here
```

## 🎯 Get Testnet ETH

https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🚀 Deploy & Run

```bash
# Deploy contracts
cd hardhat
npm run compile
npm run deploy:baseSepolia

# Copy the factory address and add to .env.local:
# NEXT_PUBLIC_RACE_FACTORY_ADDRESS=0xYourAddress

# Start frontend
cd ..
npm run dev
```

## 🎮 Test the Game

1. Open http://localhost:3000
2. Connect wallet
3. Create a race
4. Join with another wallet
5. Start race (host)
6. TAP to win!

That's it! 🎉

For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

