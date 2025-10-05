/**
 * Contract ABIs for Onbase Derby
 * Exported from compiled contracts
 */

export const RACE_FACTORY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_oracle", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "entryFee", "type": "uint256"}],
    "name": "createRace",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "raceId", "type": "uint256"}],
    "name": "joinRace",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "raceId", "type": "uint256"}],
    "name": "startRace",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveRaces",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "raceId", "type": "uint256"}],
    "name": "getRaceDetails",
    "outputs": [
      {"internalType": "address", "name": "raceAddress", "type": "address"},
      {"internalType": "address", "name": "host", "type": "address"},
      {"internalType": "uint256", "name": "entryFee", "type": "uint256"},
      {"internalType": "uint8", "name": "currentState", "type": "uint8"},
      {"internalType": "uint256", "name": "totalPlayers", "type": "uint256"},
      {"internalType": "uint256", "name": "prizePool", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raceId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "host", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "raceInstance", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "entryFee", "type": "uint256"}
    ],
    "name": "RaceCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raceId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint8", "name": "team", "type": "uint8"}
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raceId", "type": "uint256"}
    ],
    "name": "RaceStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "raceId", "type": "uint256"},
      {"indexed": false, "internalType": "uint8", "name": "winningTeam", "type": "uint8"}
    ],
    "name": "RaceEnded",
    "type": "event"
  }
] as const;

export const RACE_INSTANCE_ABI = [
  {
    "inputs": [],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "prizePool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "winningTeam",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "playerTeam",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "playerTaps",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTeam1Players",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTeam2Players",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getClaimableAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasClaimed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint8", "name": "winningTeam", "type": "uint8"},
      {"indexed": false, "internalType": "uint256", "name": "team1Taps", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "team2Taps", "type": "uint256"}
    ],
    "name": "RaceEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "WinningsClaimed",
    "type": "event"
  }
] as const;
