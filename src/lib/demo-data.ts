/**
 * Demo data for testing without deployed contracts
 */

import { RaceDetails, RaceState, Team } from "./contracts/types";

export const DEMO_MODE = !process.env.NEXT_PUBLIC_RACE_FACTORY_ADDRESS;

export const mockRaces: RaceDetails[] = [
  {
    raceId: 1,
    raceAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    host: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
    entryFee: BigInt("1000000000000000"), // 0.001 ETH
    state: RaceState.Created,
    totalPlayers: 2,
    prizePool: BigInt("2000000000000000"), // 0.002 ETH
  },
  {
    raceId: 2,
    raceAddress: "0x2345678901234567890123456789012345678901" as `0x${string}`,
    host: "0xbcdef1234567890abcdef1234567890abcdef123" as `0x${string}`,
    entryFee: BigInt("10000000000000000"), // 0.01 ETH
    state: RaceState.Started,
    totalPlayers: 4,
    prizePool: BigInt("40000000000000000"), // 0.04 ETH
  },
  {
    raceId: 3,
    raceAddress: "0x3456789012345678901234567890123456789012" as `0x${string}`,
    host: "0xcdef1234567890abcdef1234567890abcdef1234" as `0x${string}`,
    entryFee: BigInt("1000000000000000"), // 0.001 ETH
    state: RaceState.Created,
    totalPlayers: 1,
    prizePool: BigInt("1000000000000000"), // 0.001 ETH
  },
];

export function getMockRaceDetails(raceId: number): RaceDetails | null {
  return mockRaces.find((r) => r.raceId === raceId) || null;
}

export function getMockActiveRaces(): number[] {
  return mockRaces
    .filter((r) => r.state !== RaceState.Ended)
    .map((r) => r.raceId);
}

export const mockPlayers = {
  team1: [
    "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
    "0x1111111111111111111111111111111111111111" as `0x${string}`,
  ],
  team2: [
    "0x2222222222222222222222222222222222222222" as `0x${string}`,
    "0x3333333333333333333333333333333333333333" as `0x${string}`,
  ],
};

export function createMockRace(entryFee: bigint, hostAddress: `0x${string}`): RaceDetails {
  const newId = mockRaces.length + 1;
  const newRace: RaceDetails = {
    raceId: newId,
    raceAddress: `0x${newId.toString().padStart(40, "0")}` as `0x${string}`,
    host: hostAddress,
    entryFee,
    state: RaceState.Created,
    totalPlayers: 1,
    prizePool: entryFee,
  };
  mockRaces.push(newRace);
  return newRace;
}

export function joinMockRace(raceId: number, entryFee: bigint): boolean {
  const race = mockRaces.find((r) => r.raceId === raceId);
  if (!race || race.state !== RaceState.Created) return false;

  race.totalPlayers++;
  race.prizePool += entryFee;
  return true;
}

