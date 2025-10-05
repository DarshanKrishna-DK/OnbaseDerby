/**
 * Race State Management for Vercel (using KV/Redis)
 * Production-ready persistent storage
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

// Check if running on Vercel with KV
const IS_VERCEL = process.env.VERCEL === "1";
const HAS_KV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Use Redis/KV in production, in-memory in development
let kv: any = null;

if (IS_VERCEL && HAS_KV) {
  try {
    // Dynamically import Vercel KV only in production
    kv = require("@vercel/kv").kv;
    console.log("✅ Using Vercel KV for race state");
  } catch (error) {
    console.warn("⚠️  Vercel KV not available, falling back to in-memory");
  }
}

// Fallback: In-memory store for development
const globalForRaceState = globalThis as unknown as {
  raceStates: Map<number, RaceGameState> | undefined;
};

const raceStates = globalForRaceState.raceStates ?? new Map<number, RaceGameState>();

if (process.env.NODE_ENV !== "production") {
  globalForRaceState.raceStates = raceStates;
}

export class RaceStateManager {
  /**
   * Initialize a new race state
   */
  static async initRace(raceId: number): Promise<RaceGameState> {
    console.log(`💾 RaceStateManager.initRace(${raceId})`);
    
    // Check if race already exists
    const existing = await this.getRace(raceId);
    if (existing) {
      console.log(`⚠️  Race ${raceId} already exists, returning existing`);
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

    if (kv) {
      // Store in Redis/KV
      await kv.set(`race:${raceId}`, JSON.stringify(state));
    } else {
      // Store in memory
      raceStates.set(raceId, state);
    }

    console.log(`✅ Race ${raceId} created. Using ${kv ? "KV" : "in-memory"}`);
    return state;
  }

  /**
   * Get race state
   */
  static async getRace(raceId: number): Promise<RaceGameState | undefined> {
    if (kv) {
      const data = await kv.get(`race:${raceId}`);
      if (!data) {
        console.log(`❌ Race ${raceId} not found in KV`);
        return undefined;
      }
      return typeof data === "string" ? JSON.parse(data) : data;
    } else {
      const race = raceStates.get(raceId);
      if (!race) {
        console.log(`❌ Race ${raceId} not found. Available races: [${Array.from(raceStates.keys()).join(", ")}]`);
      }
      return race;
    }
  }

  /**
   * Add player to race
   */
  static async addPlayer(raceId: number, address: string, team: Team): Promise<void> {
    console.log(`👤 Adding player ${address} to race ${raceId} (team: ${team})`);
    const race = await this.getRace(raceId);
    if (!race) {
      console.error(`❌ Cannot add player - race ${raceId} not found!`);
      return;
    }

    const normalizedAddress = address.toLowerCase();
    race.players[normalizedAddress] = {
      address: normalizedAddress,
      team,
      taps: 0,
    };

    if (kv) {
      await kv.set(`race:${raceId}`, JSON.stringify(race));
    } else {
      raceStates.set(raceId, race);
    }

    console.log(`✅ Player added. Total players in race ${raceId}: ${Object.keys(race.players).length}`);
  }

  /**
   * Start race
   */
  static async startRace(raceId: number): Promise<void> {
    console.log(`🏁 RaceStateManager.startRace(${raceId})`);
    const race = await this.getRace(raceId);
    if (!race) {
      console.error(`❌ Cannot start race ${raceId} - not found!`);
      return;
    }

    race.state = RaceState.Started;
    race.startedAt = Date.now();

    if (kv) {
      await kv.set(`race:${raceId}`, JSON.stringify(race));
    } else {
      raceStates.set(raceId, race);
    }

    console.log(`✅ Race ${raceId} started successfully`);
  }

  /**
   * Record a tap
   */
  static async recordTap(raceId: number, playerAddress: string): Promise<RaceGameState | null> {
    const race = await this.getRace(raceId);
    
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

    if (kv) {
      await kv.set(`race:${raceId}`, JSON.stringify(race));
    } else {
      raceStates.set(raceId, race);
    }

    return race;
  }

  /**
   * Get all active races
   */
  static async getActiveRaces(): Promise<number[]> {
    if (kv) {
      // In KV, we need to maintain a separate list of race IDs
      const keys = await kv.keys("race:*");
      const races: RaceGameState[] = [];
      
      for (const key of keys) {
        const data = await kv.get(key);
        if (data) {
          const race = typeof data === "string" ? JSON.parse(data) : data;
          if (race.state !== RaceState.Ended) {
            races.push(race);
          }
        }
      }
      
      return races.map(r => r.raceId);
    } else {
      return Array.from(raceStates.values())
        .filter(race => race.state !== RaceState.Ended)
        .map(race => race.raceId);
    }
  }
}

