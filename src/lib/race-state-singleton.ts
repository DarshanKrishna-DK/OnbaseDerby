/**
 * Race State Management - Singleton Pattern
 * Guarantees single Map instance across all imports
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

// Singleton class ensures single instance
class RaceStateStore {
  private static instance: RaceStateStore;
  private races: Map<number, RaceGameState>;

  private constructor() {
    console.log("🏗️  RaceStateStore: Creating SINGLETON instance");
    this.races = new Map<number, RaceGameState>();
  }

  public static getInstance(): RaceStateStore {
    if (!RaceStateStore.instance) {
      RaceStateStore.instance = new RaceStateStore();
    } else {
      console.log(`♻️  RaceStateStore: Reusing singleton (${RaceStateStore.instance.races.size} races)`);
    }
    return RaceStateStore.instance;
  }

  public initRace(raceId: number): RaceGameState {
    console.log(`💾 initRace(${raceId})`);
    
    const existing = this.races.get(raceId);
    if (existing) {
      console.log(`⚠️  Race ${raceId} already exists`);
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
    
    this.races.set(raceId, state);
    console.log(`✅ Race ${raceId} created. Total: ${this.races.size}`);
    console.log(`📍 Available races: [${Array.from(this.races.keys()).join(", ")}]`);
    return state;
  }

  public getRace(raceId: number): RaceGameState | undefined {
    const race = this.races.get(raceId);
    if (!race) {
      console.log(`❌ Race ${raceId} not found. Available: [${Array.from(this.races.keys()).join(", ")}]`);
    }
    return race;
  }

  public addPlayer(raceId: number, address: string, team: Team): void {
    console.log(`👤 addPlayer: ${address} → race ${raceId} (team: ${team})`);
    const race = this.races.get(raceId);
    if (!race) {
      console.error(`❌ Cannot add player - race ${raceId} not found!`);
      return;
    }

    const normalized = address.toLowerCase();
    race.players[normalized] = {
      address: normalized,
      team,
      taps: 0,
    };
    console.log(`✅ Player added. Total players in race ${raceId}: ${Object.keys(race.players).length}`);
  }

  public startRace(raceId: number): void {
    console.log(`🏁 startRace(${raceId})`);
    const race = this.races.get(raceId);
    if (!race) {
      console.error(`❌ Race ${raceId} not found!`);
      return;
    }

    race.state = RaceState.Started;
    race.startedAt = Date.now();
    console.log(`✅ Race ${raceId} started`);
  }

  public recordTap(raceId: number, playerAddress: string): RaceGameState | null {
    const race = this.races.get(raceId);
    
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

    player.taps++;

    if (player.team === Team.Ethereum) {
      race.team1Taps++;
    } else if (player.team === Team.Bitcoin) {
      race.team2Taps++;
    }

    const TARGET_TAPS = 3000;
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

  public getActiveRaces(): number[] {
    return Array.from(this.races.values())
      .filter(race => race.state !== RaceState.Ended)
      .map(race => race.raceId);
  }

  public getAllRaces(): RaceGameState[] {
    return Array.from(this.races.values());
  }
}

// Export singleton manager
export class RaceStateManager {
  private static get store() {
    return RaceStateStore.getInstance();
  }

  static initRace(raceId: number): RaceGameState {
    return this.store.initRace(raceId);
  }

  static getRace(raceId: number): RaceGameState | undefined {
    return this.store.getRace(raceId);
  }

  static addPlayer(raceId: number, address: string, team: Team): void {
    this.store.addPlayer(raceId, address, team);
  }

  static startRace(raceId: number): void {
    this.store.startRace(raceId);
  }

  static recordTap(raceId: number, playerAddress: string): RaceGameState | null {
    return this.store.recordTap(raceId, playerAddress);
  }

  static getActiveRaces(): number[] {
    return this.store.getActiveRaces();
  }

  static getAllRaces(): RaceGameState[] {
    return this.store.getAllRaces();
  }
}

