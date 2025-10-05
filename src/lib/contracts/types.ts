/**
 * TypeScript types for Onbase Derby contracts
 */

export enum RaceState {
  Created = 0,
  Started = 1,
  Ended = 2,
}

export enum Team {
  None = 0,
  Ethereum = 1,
  Bitcoin = 2,
}

export interface RaceDetails {
  raceId: number;
  raceAddress: `0x${string}`;
  host: `0x${string}`;
  entryFee: bigint;
  state: RaceState;
  totalPlayers: number;
  prizePool: bigint;
}

export interface RaceInstance {
  raceId: number;
  address: `0x${string}`;
  entryFee: bigint;
  host: `0x${string}`;
  state: RaceState;
  prizePool: bigint;
  team1Players: `0x${string}`[];
  team2Players: `0x${string}`[];
  winningTeam: Team;
  team1TotalTaps: number;
  team2TotalTaps: number;
}

export interface PlayerInfo {
  address: `0x${string}`;
  team: Team;
  taps: number;
  claimableAmount: bigint;
  hasClaimed: boolean;
}

export interface RaceGameState {
  raceId: number;
  state: RaceState;
  team1Taps: number;
  team2Taps: number;
  players: Record<string, { address: `0x${string}`; team: Team; taps: number }>;
  winningTeam: Team;
}

