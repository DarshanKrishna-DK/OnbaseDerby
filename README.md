# 🏁 Onbase Derby - Tap-to-Win Racing Game

A multiplayer racing game on Base where players tap to move their team's coin around a circular track. First team to complete 3 laps wins and shares the prize pool proportionally!

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (see SETUP.md)
cp env.example .env.local

# 3. Run in demo mode (no blockchain)
npm run dev

# 4. For production mode, see SETUP.md for deployment
```

## 📖 Documentation

**[→ SETUP.md](./SETUP.md)** - Complete setup guide with:
- Environment configuration
- Contract deployment
- Multi-player testing
- Troubleshooting

## 🎮 Features

- **Circular Race Track** - Coins race around a circuit (not linear bars!)
- **3 Laps to Win** - 3,000 taps total, 1,000 per lap
- **Real-time Multiplayer** - Cross-browser/device synchronization
- **Smart Contracts** - Decentralized race management on Base
- **Proportional Winnings** - Fair distribution based on contribution
- **Mobile Responsive** - Works on all devices

## 🚀 Game Modes

### Demo Mode (Default)
- No blockchain required
- Instant testing
- Single-player only

### Production Mode
- Real blockchain transactions
- Multi-player support
- Requires Base Sepolia ETH

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Blockchain:** Hardhat, Solidity, Wagmi, Viem
- **Network:** Base Sepolia (Testnet)

## 📦 Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── lib/              # Utilities and state management
├── hardhat/              # Smart contracts
│   ├── contracts/        # Solidity contracts
│   └── ignition/         # Deployment scripts
├── env.example           # Environment template
└── SETUP.md             # Complete setup guide
```

## 🎯 How to Play

1. **Connect wallet** (Base Sepolia network)
2. **Create or join a race** (pay entry fee)
3. **Wait for host to start**
4. **Tap rapidly!** Move your team around the track
5. **First to 3 laps wins**
6. **Claim your winnings** (proportional to your taps)

## 🔧 Development

```bash
# Install dependencies
npm install
cd hardhat && npm install && cd ..

# Run development server
npm run dev

# Deploy contracts (see SETUP.md first)
cd hardhat
npm run deploy:baseSepolia

# Build for production
npm run build
npm start
```

## 📝 Environment Variables

See `env.example` for template. Key variables:

- `NEXT_PUBLIC_RACE_FACTORY_ADDRESS` - Deployed contract address
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` - RPC endpoint
- `DEPLOYER_PRIVATE_KEY` - For contract deployment (hardhat/.env)

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md#troubleshooting) for common issues and solutions.

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! This is a hackathon/demo project.

---

**🎮 Ready to race? See [SETUP.md](./SETUP.md) for complete instructions!** 🏁
