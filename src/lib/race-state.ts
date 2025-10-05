/**
 * Race State Management
 * In-memory storage for race states during gameplay
 */

import { Team, RaceState } from "./contracts/types";

export interface PlayerState {
  address: string;
  team: Team;
  taps: number;
}

export interface RaceGameState {
  raceId: number;
  state: RaceState;
  team1Taps: number;
  team2Taps: number;
  players: Record<string, PlayerState>;
  winningTeam: Team;
  startedAt?: number;
  endedAt?: number;
}

// In-memory store (in production, use Redis or database)
// Use global variable to persist across ALL imports
declare global {
  var __raceStates: Map<number, RaceGameState> | undefined;
}

// Initialize or reuse existing Map from global scope
if (!global.__raceStates) {
  console.log("🆕 Initializing NEW global raceStates Map");
  global.__raceStates = new Map<number, RaceGameState>();
} else {
  console.log(`♻️  Reusing EXISTING global raceStates Map with ${global.__raceStates.size} races`);
}

const raceStates = global.__raceStates;

export class RaceStateManager {
  /**
   * Initialize a new race state
   */
  static initRace(raceId: number): RaceGameState {
    console.log(`💾 RaceStateManager.initRace(${raceId})`);
    
    // Check if race already exists
    const existing = raceStates.get(raceId);
    if (existing) {
      console.log(`⚠️  Race ${raceId} already exists in memory, returning existing`);
      return existing;
    }
    
    const state: RaceGameState = {
      raceId,
      state: RaceState.Created,
      team1Taps: 0,
      team2Taps: 0,
      players: {},
      winningTeam: Team.None,
    };
    raceStates.set(raceId, state);
    console.log(`✅ Race ${raceId} created. Total races in memory: ${raceStates.size}`);
    return state;
  }

  /**
   * Get race state
   */
  static getRace(raceId: number): RaceGameState | undefined {
    const race = raceStates.get(raceId);
    if (!race) {
      console.log(`❌ Race ${raceId} not found. Available races: [${Array.from(raceStates.keys()).join(", ")}]`);
    }
    return race;
  }

  /**
   * Add player to race
   */
  static addPlayer(raceId: number, address: string, team: Team): void {
    console.log(`👤 Adding player ${address} to race ${raceId} (team: ${team})`);
    const race = raceStates.get(raceId);
    if (!race) {
      console.error(`❌ Cannot add player - race ${raceId} not found!`);
      return;
    }

    // Normalize address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();
    race.players[normalizedAddress] = {
      address: normalizedAddress,
      team,
      taps: 0,
    };
    console.log(`✅ Player added. Total players in race ${raceId}: ${Object.keys(race.players).length}`);
  }

  /**
   * Start race
   */
  static startRace(raceId: number): void {
    console.log(`🏁 RaceStateManager.startRace(${raceId})`);
    const race = raceStates.get(raceId);
    if (!race) {
      console.error(`❌ Cannot start race ${raceId} - not found in memory!`);
      return;
    }

    race.state = RaceState.Started;
    race.startedAt = Date.now();
    console.log(`✅ Race ${raceId} started successfully`);
  }

  /**
   * Record a tap
   */
  static recordTap(raceId: number, playerAddress: string): RaceGameState | null {
    const race = raceStates.get(raceId);
    
    if (!race) {
      console.error(`❌ recordTap: Race ${raceId} not found!`);
      return null;
    }
    
    if (race.state !== RaceState.Started) {
      console.error(`❌ recordTap: Race ${raceId} not started (state: ${race.state})`);
      return null;
    }

    const player = race.players[playerAddress.toLowerCase()];
    if (!player) {
      console.error(`❌ recordTap: Player ${playerAddress} not in race ${raceId}`);
      console.log(`Available players:`, Object.keys(race.players));
      return null;
    }

    // Increment player taps
    player.taps++;

    // Increment team taps
    if (player.team === Team.Ethereum) {
      race.team1Taps++;
    } else if (player.team === Team.Bitcoin) {
      race.team2Taps++;
    }

    // Check win condition (3 laps = 3000 taps, making it slower with more taps needed)
    const TARGET_TAPS = 3000; // 3 laps, 1000 taps per lap
    if (race.team1Taps >= TARGET_TAPS) {
      race.state = RaceState.Ended;
      race.winningTeam = Team.Ethereum;
      race.endedAt = Date.now();
      console.log(`🏆 Race ${raceId} ended! Team Ethereum wins!`);
    } else if (race.team2Taps >= TARGET_TAPS) {
      race.state = RaceState.Ended;
      race.winningTeam = Team.Bitcoin;
      race.endedAt = Date.now();
      console.log(`🏆 Race ${raceId} ended! Team Bitcoin wins!`);
    }

    return race;
  }

  /**
   * Get all active races
   */
  static getActiveRaces(): number[] {
    const activeRaces: number[] = [];
    raceStates.forEach((race, raceId) => {
      if (race.state !== RaceState.Ended) {
        activeRaces.push(raceId);
      }
    });
    return activeRaces;
  }

  /**
   * Get winner shares
   */
  static getWinnerShares(raceId: number): Record<string, number> {
    const race = raceStates.get(raceId);
    if (!race || race.state !== RaceState.Ended || race.winningTeam === Team.None) {
      return {};
    }

    const shares: Record<string, number> = {};
    const totalTeamTaps = race.winningTeam === Team.Ethereum ? race.team1Taps : race.team2Taps;

    Object.values(race.players).forEach((player) => {
      if (player.team === race.winningTeam && player.taps > 0) {
        shares[player.address] = player.taps / totalTeamTaps;
      }
    });

    return shares;
  }

  /**
   * Clear race (cleanup after finished)
   */
  static clearRace(raceId: number): void {
    raceStates.delete(raceId);
  }

  /**
   * Get all races (for debugging)
   */
  static getAllRaces(): RaceGameState[] {
    return Array.from(raceStates.values());
  }
}

