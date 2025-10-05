/**
 * Contract ABIs for Onbase Derby
 * These are the compiled contract interfaces
 */

export const RACE_FACTORY_ABI = [
  // View functions
  "function races(uint256) view returns (address)",
  "function raceHosts(uint256) view returns (address)",
  "function oracle() view returns (address)",
  "function getActiveRaces() view returns (uint256[])",
  "function getRaceDetails(uint256) view returns (address raceAddress, address host, uint256 entryFee, uint8 currentState, uint256 totalPlayers, uint256 prizePool)",
  
  // State-changing functions
  "function createRace(uint256 entryFee) payable returns (uint256)",
  "function joinRace(uint256 raceId) payable",
  "function startRace(uint256 raceId)",
  
  // Events
  "event RaceCreated(uint256 indexed raceId, address indexed host, address raceInstance, uint256 entryFee)",
  "event PlayerJoined(uint256 indexed raceId, address indexed player, uint8 team)",
  "event RaceStarted(uint256 indexed raceId)",
  "event RaceEnded(uint256 indexed raceId, uint8 winningTeam)",
] as const;

export const RACE_INSTANCE_ABI = [
  // View functions
  "function raceId() view returns (uint256)",
  "function entryFee() view returns (uint256)",
  "function host() view returns (address)",
  "function state() view returns (uint8)",
  "function prizePool() view returns (uint256)",
  "function winningTeam() view returns (uint8)",
  "function playerTeam(address) view returns (uint8)",
  "function playerTaps(address) view returns (uint256)",
  "function team1TotalTaps() view returns (uint256)",
  "function team2TotalTaps() view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
  "function getTotalPlayers() view returns (uint256)",
  "function getTeam1Players() view returns (address[])",
  "function getTeam2Players() view returns (address[])",
  "function getClaimableAmount(address) view returns (uint256)",
  
  // State-changing functions
  "function claimWinnings()",
  
  // Events
  "event PlayerAdded(address indexed player, uint8 team)",
  "event RaceStarted()",
  "event RaceEnded(uint8 winningTeam, uint256 team1Taps, uint256 team2Taps)",
  "event ResultsRecorded(address[] winners, uint256[] tapCounts)",
  "event WinningsClaimed(address indexed player, uint256 amount)",
] as const;

