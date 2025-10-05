# Onbase Derby - Setup Guide

Complete guide to deploying and running the Onbase Derby racing game.

## 📁 Project Structure

```
base-template-mini-app/
├── hardhat/                    # Smart contracts folder
│   ├── contracts/             # Solidity contracts
│   ├── test/                  # Contract tests
│   ├── ignition/              # Deployment modules
│   ├── scripts/               # Deploy & verify scripts
│   ├── package.json           # Hardhat dependencies
│   └── hardhat.config.cts     # Hardhat configuration
│
├── src/                       # Frontend application
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   │   └── derby/            # Derby game components
│   └── lib/                   # Utilities & hooks
│       └── contracts/        # Contract ABIs & hooks
│
├── package.json              # Frontend dependencies
└── .env.local                # Environment variables (create this!)
```

## 🚀 Quick Start

### Step 1: Install Dependencies

**Install frontend dependencies:**
```bash
npm install
```

**Install contract dependencies:**
```bash
cd hardhat
npm install
cd ..
```

### Step 2: Set Up Environment Variables

**Create `.env.local` in the root directory:**

```bash
# Farcaster Mini App
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME=Onbase Derby
NEXT_PUBLIC_FRAME_DESCRIPTION=Tap-to-win racing game on Base
NEXT_PUBLIC_USE_WALLET=true

# Smart Contract (Add after deployment)
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=

# Optional: Neynar API
NEYNAR_API_KEY=your_key_here
NEYNAR_CLIENT_ID=your_id_here
```

**Create `hardhat/.env`:**

```bash
# Get Base Sepolia testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
ORACLE_ADDRESS=your_oracle_address_here
BASESCAN_API_KEY=your_api_key_here
```

### Step 3: Get Testnet ETH

Get Base Sepolia testnet ETH for your deployer wallet:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://faucet.quicknode.com/base/sepolia

### Step 4: Deploy Smart Contracts

```bash
cd hardhat

# Compile contracts
npm run compile

# Run tests (optional)
npm test

# Deploy to Base Sepolia
npm run deploy:baseSepolia

# Copy the deployed RaceFactory address!
```

### Step 5: Update Frontend Config

Add the deployed contract address to `.env.local`:

```bash
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

### Step 6: Start the Frontend

```bash
# From the root directory
npm run dev
```

Open http://localhost:3000 in your browser!

## 🎮 How to Play

### For Testing (Multiple Wallets Needed)

1. **Create a Race** (Wallet 1):
   - Connect your wallet
   - Click "Create New Race"
   - Select entry fee (0.001, 0.01, or 0.1 ETH)
   - Confirm transaction
   - You're automatically assigned to Team Ethereum

2. **Join the Race** (Wallet 2):
   - Connect a different wallet
   - Find the race in "Active Races"
   - Click "Join Race"
   - Pay the entry fee
   - You're assigned to Team Bitcoin

3. **Start the Race** (Host/Wallet 1):
   - In the lobby, click "Start Race"
   - Both players navigate to the race screen

4. **Race!**:
   - Tap the "TAP!" button as fast as you can
   - Watch your team's coin move forward
   - First team to complete 5 laps wins!

5. **Claim Winnings** (Winners):
   - After the race, winners see their share
   - Click "Claim Winnings"
   - Receive ETH proportional to your tap contribution

## 📝 Important Notes

### Team Assignment
- Players alternate between teams automatically
- 1st player: Team Ethereum
- 2nd player: Team Bitcoin
- 3rd player: Team Ethereum
- And so on...

### Winning & Payouts
- Winners split the prize pool proportionally
- If you contributed 40% of your team's taps, you get 40% of the pool
- Example: 4 ETH pool, you did 40% of winning team's taps = 1.6 ETH

### Race Requirements
- Minimum 1 player on each team to start
- Host must manually start the race
- No refunds once race starts

## 🛠️ Development Commands

### Frontend

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Contracts (in hardhat/)

```bash
npm run compile      # Compile contracts
npm test             # Run tests
npm run deploy       # Deploy with custom script
npm run verify       # Verify on Basescan
```

## 🧪 Testing on Warpcast

1. Start your dev server: `npm run dev`
2. Use localtunnel or ngrok to expose localhost
3. Go to https://warpcast.com/~/developers
4. Use the "Preview Mini App" tool
5. Enter your public URL

## 🔧 Troubleshooting

### "No active races" showing
- Make sure contracts are deployed
- Check `NEXT_PUBLIC_RACE_FACTORY_ADDRESS` is set
- Verify you're on Base Sepolia network

### Can't create race
- Ensure you have testnet ETH
- Check wallet is connected
- Verify you're on Base Sepolia (chain ID: 84532)

### Transaction fails
- Insufficient gas/ETH balance
- Wrong network selected
- Entry fee doesn't match race requirements

## 📚 Additional Resources

- [Smart Contract Documentation](./hardhat/README.md)
- [Phase 1 Completion Summary](./PHASE1_COMPLETE.md)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## 🔐 Security

- Never commit `.env` or `.env.local` files
- Keep private keys secure
- Use testnet for development
- Audit contracts before mainnet deployment

## 📞 Support

If you encounter issues:
1. Check this guide
2. Review contract README in `hardhat/`
3. Check console for errors
4. Verify environment variables are set

---

**Status**: Ready for testing on Base Sepolia testnet! 🚀

