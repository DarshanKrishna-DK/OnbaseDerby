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
const raceStates = new Map<number, RaceGameState>();

export class RaceStateManager {
  /**
   * Initialize a new race state
   */
  static initRace(raceId: number): RaceGameState {
    const state: RaceGameState = {
      raceId,
      state: RaceState.Created,
      team1Taps: 0,
      team2Taps: 0,
      players: {},
      winningTeam: Team.None,
    };
    raceStates.set(raceId, state);
    return state;
  }

  /**
   * Get race state
   */
  static getRace(raceId: number): RaceGameState | undefined {
    return raceStates.get(raceId);
  }

  /**
   * Add player to race
   */
  static addPlayer(raceId: number, address: string, team: Team): void {
    const race = raceStates.get(raceId);
    if (!race) return;

    race.players[address] = {
      address,
      team,
      taps: 0,
    };
  }

  /**
   * Start race
   */
  static startRace(raceId: number): void {
    const race = raceStates.get(raceId);
    if (!race) return;

    race.state = RaceState.Started;
    race.startedAt = Date.now();
  }

  /**
   * Record a tap
   */
  static recordTap(raceId: number, playerAddress: string): RaceGameState | null {
    const race = raceStates.get(raceId);
    if (!race || race.state !== RaceState.Started) return null;

    const player = race.players[playerAddress];
    if (!player) return null;

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
    } else if (race.team2Taps >= TARGET_TAPS) {
      race.state = RaceState.Ended;
      race.winningTeam = Team.Bitcoin;
      race.endedAt = Date.now();
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

