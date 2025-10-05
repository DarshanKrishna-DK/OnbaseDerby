# Onbase Derby Smart Contracts

This directory contains the Solidity smart contracts for the Onbase Derby racing game.

## 📁 Structure

```
hardhat/
├── contracts/          # Solidity smart contracts
│   ├── RaceFactory.sol
│   └── RaceInstance.sol
├── test/              # Contract tests
│   ├── RaceFactory.test.ts
│   └── RaceInstance.test.ts
├── ignition/          # Hardhat Ignition deployment modules
│   └── modules/
│       └── RaceFactory.ts
├── scripts/           # Deployment and utility scripts
│   ├── deploy-contracts.ts
│   └── verify-contracts.ts
└── hardhat.config.cts # Hardhat configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd hardhat
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `BASE_SEPOLIA_RPC_URL` - RPC endpoint (default: https://sepolia.base.org)
- `DEPLOYER_PRIVATE_KEY` - Your deployer wallet private key
- `ORACLE_ADDRESS` - Backend oracle address for recording results
- `BASESCAN_API_KEY` - For contract verification (optional)

### 3. Get Testnet ETH

Get Base Sepolia testnet ETH from faucets:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://faucet.quicknode.com/base/sepolia

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Run Tests

```bash
npm test
```

### 6. Deploy to Base Sepolia

Using Hardhat Ignition (recommended):
```bash
npm run deploy:baseSepolia
```

Or using the deploy script:
```bash
npm run deploy
```

### 7. Verify on Basescan

```bash
npm run verify <FACTORY_ADDRESS> <ORACLE_ADDRESS>
```

### 8. Update Frontend Config

Copy the deployed RaceFactory address to the main project's `.env.local`:

```bash
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=0x...
```

## 📝 Contracts Overview

### RaceFactory.sol
Factory contract that creates and manages race instances.

**Key Functions:**
- `createRace(uint256 entryFee)` - Create new race and pay entry fee
- `joinRace(uint256 raceId)` - Join existing race with entry fee
- `startRace(uint256 raceId)` - Start race (host only)
- `getActiveRaces()` - Get all active race IDs
- `getRaceDetails(uint256 raceId)` - Get race information

### RaceInstance.sol
Individual race contract handling escrow and payouts.

**Key Functions:**
- `startRace()` - Start the race (via factory)
- `recordResults(address[] winners, uint256[] tapCounts)` - Record results (oracle only)
- `claimWinnings()` - Claim proportional winnings
- `getClaimableAmount(address)` - Check claimable amount

## 🔧 Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run coverage
npm run coverage

# Start local Hardhat node
npm run node

# Deploy to local node
npm run deploy:baseSepolia --network localhost
```

## 🛡️ Security Features

- **ReentrancyGuard**: Protects against reentrancy attacks
- **Access Control**: Host and oracle-only functions
- **State Machine**: Enforces proper race state transitions
- **Checks-Effects-Interactions**: Follows best practices
- **OpenZeppelin**: Uses audited library contracts

## 📊 Gas Estimates

- Create Race: ~200k-300k gas
- Join Race: ~100k-150k gas
- Start Race: ~50k-80k gas
- Record Results: ~100k-200k gas
- Claim Winnings: ~50k-100k gas

## 🔗 Useful Links

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## 📄 License

MIT
