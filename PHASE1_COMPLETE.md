# Phase 1 Complete: Smart Contracts & Frontend Setup

## ✅ What's Been Built

### Smart Contracts

1. **RaceFactory.sol** (`contracts/RaceFactory.sol`)
   - Factory pattern for creating race instances
   - `createRace(uint256 entryFee)` - Host creates and joins
   - `joinRace(uint256 raceId)` - Players join with automatic team assignment
   - `startRace(uint256 raceId)` - Host starts the race
   - Alternate team assignment (1st player Team 1, 2nd Team 2, etc.)
   - Event emissions for tracking

2. **RaceInstance.sol** (`contracts/RaceInstance.sol`)
   - Individual race contract with escrow
   - ETH prize pool management
   - Team tracking (Ethereum vs Bitcoin)
   - State machine: Created → Started → Ended
   - `recordResults(address[], uint256[])` - Oracle records tap counts
   - `claimWinnings()` - Proportional payouts based on tap contributions
   - ReentrancyGuard protection

3. **Testing & Deployment**
   - Comprehensive test suites (`test/RaceFactory.test.ts`, `test/RaceInstance.test.ts`)
   - Deployment scripts (`ignition/modules/RaceFactory.ts`, `scripts/deploy-contracts.ts`)
   - Hardhat configuration for Base Sepolia

### Frontend Foundation

1. **Contract Integration** (`src/lib/contracts/`)
   - ABIs for both contracts
   - TypeScript types for races, states, teams
   - Address management for multiple networks
   - Custom Wagmi hooks:
     - `useCreateRace()` - Create new races
     - `useJoinRace()` - Join existing races
     - `useStartRace()` - Start race (host only)
     - `useClaimWinnings()` - Claim winnings
     - `useActiveRaces()` - Get all active races
     - `useRaceDetails()` - Get race information
     - `useRaceInstance()` - Poll race state
     - `usePlayerInfo()` - Get player details

2. **Wagmi Configuration**
   - Base Sepolia testnet added to supported chains
   - Multiple wallet connectors (Coinbase Wallet, MetaMask)
   - Auto-connection for Coinbase Wallet users

3. **HomePage Component** (`src/components/derby/HomePage.tsx`)
   - Connect wallet UI
   - "Create Race" button with entry fee selection modal
   - Active races list with real-time updates
   - Race cards showing:
     - Race ID, entry fee, player count
     - Current state (Waiting/In Progress/Ended)
     - Prize pool
     - Join/Enter buttons

## 📝 Next Steps to Deploy & Test

### 1. Set Up Environment Variables

Create `.env.local` file:

```bash
# Base Sepolia RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Your deployer wallet private key (get testnet ETH from faucet)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Oracle address (backend wallet that will record race results)
ORACLE_ADDRESS=your_oracle_address_here

# Optional: For contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 2. Get Testnet ETH

Get Base Sepolia testnet ETH from:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://faucet.quicknode.com/base/sepolia

### 3. Deploy Contracts

```bash
# Compile contracts
$env:TS_NODE_PROJECT="tsconfig.hardhat.json"; npx hardhat compile

# Deploy to Base Sepolia
$env:TS_NODE_PROJECT="tsconfig.hardhat.json"; npx hardhat ignition deploy ignition/modules/RaceFactory.ts --network baseSepolia

# Or use the deployment script
$env:TS_NODE_PROJECT="tsconfig.hardhat.json"; npx ts-node scripts/deploy-contracts.ts
```

### 4. Verify Contracts (Optional)

```bash
npx hardhat verify --network baseSepolia <FACTORY_ADDRESS> <ORACLE_ADDRESS>
```

### 5. Update Frontend Config

Add the deployed factory address to `.env.local`:

```bash
NEXT_PUBLIC_RACE_FACTORY_ADDRESS=0x...
```

### 6. Test the Application

```bash
npm run dev
```

Visit http://localhost:3000/derby

## 🏗️ What Still Needs to Be Built (Phases 2-3)

### Phase 2: Backend API

**API Routes for Race State Management:**
- `POST /api/race/[raceId]/tap` - Record tap events
- `GET /api/race/[raceId]/state` - Get current race state
- `POST /api/race/[raceId]/end` - Oracle ends race and records results

**Race State Management:**
- In-memory or Redis store for active races
- Track taps per player in real-time
- Calculate team totals
- Determine winner when lap target reached
- Call smart contract oracle function

### Phase 3: Remaining Frontend Components

**RaceLobby Component** (`src/components/derby/RaceLobby.tsx`)
- Two-column layout (Team Ethereum vs Team Bitcoin)
- List players by team with truncated addresses
- Show prize pool growing as players join
- "Start Race" button for host
- "Waiting for host..." message for players
- Real-time updates via polling or events

**RaceGame Component** (`src/components/derby/RaceGame.tsx`)
- Horizontal race track with animated coins
- Giant "TAP!" button (optimized for mobile)
- Live stats:
  - Your taps
  - Your team total
  - Opponent team total
  - Progress bars
- Coin movement animation based on lap progress
- Poll race state every 200-500ms
- Auto-navigate to victory screen when race ends

**VictoryScreen Component** (`src/components/derby/VictoryScreen.tsx`)
- "Team X Wins!" message
- Your earnings display (if winner)
- Tap contribution breakdown
- "Claim Winnings" button with transaction handling
- Loading states for blockchain transactions
- "Back to Home" button

## 🎨 UI/UX Enhancements

- Add coin icons (Ethereum & Bitcoin SVGs)
- Racing theme with checkered flags
- Smooth animations for coin movement
- Haptic feedback on tap (mobile)
- Sound effects (optional)
- Confetti animation on victory
- Toast notifications for events
- Mobile-optimized tap button

## 🔒 Security Notes

- Contracts use OpenZeppelin's ReentrancyGuard
- Access control for oracle and host functions
- State machine prevents invalid transitions
- Checks-Effects-Interactions pattern
- Proportional payouts verified in tests

## 📊 Contract Gas Estimates

Based on optimization settings:
- Create Race: ~200k-300k gas
- Join Race: ~100k-150k gas
- Start Race: ~50k-80k gas
- Record Results: ~100k-200k gas (depends on winner count)
- Claim Winnings: ~50k-100k gas

## 🚀 Deployment Checklist

- [ ] Deploy RaceFactory to Base Sepolia
- [ ] Verify contract on Basescan
- [ ] Update .env.local with factory address
- [ ] Set up oracle backend wallet
- [ ] Build remaining frontend components (Lobby, Game, Victory)
- [ ] Build backend API routes for race management
- [ ] Test end-to-end flow with multiple wallets
- [ ] Deploy frontend to Vercel
- [ ] Test on actual mobile devices in Farcaster

## 📖 Documentation

- Smart contract documentation: `contracts/README.md`
- Test coverage for all major functions
- Deployment instructions included
- Environment variable examples provided

---

**Status**: Smart contracts complete and tested ✅  
**Next**: Deploy to testnet and build remaining UI components

