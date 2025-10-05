/**
 * Custom Wagmi hooks for interacting with Onbase Derby contracts
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { RACE_FACTORY_ABI, RACE_INSTANCE_ABI } from "./abis";
import { getRaceFactoryAddress } from "./addresses";
import { RaceDetails, RaceState } from "./types";
import { useEffect, useState } from "react";

/**
 * Hook to create a new race
 */
export function useCreateRace() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createRace = (entryFee: bigint) => {
    if (!chainId) return;

    writeContract({
      address: getRaceFactoryAddress(chainId),
      abi: RACE_FACTORY_ABI,
      functionName: "createRace",
      args: [entryFee],
      value: entryFee,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createRace,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to join an existing race
 */
export function useJoinRace() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const joinRace = (raceId: number, entryFee: bigint) => {
    if (!chainId) return;

    writeContract({
      address: getRaceFactoryAddress(chainId),
      abi: RACE_FACTORY_ABI,
      functionName: "joinRace",
      args: [BigInt(raceId)],
      value: entryFee,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    joinRace,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to start a race (host only)
 */
export function useStartRace() {
  const { chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const startRace = (raceId: number) => {
    if (!chainId) return;

    writeContract({
      address: getRaceFactoryAddress(chainId),
      abi: RACE_FACTORY_ABI,
      functionName: "startRace",
      args: [BigInt(raceId)],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    startRace,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to claim winnings from a race
 */
export function useClaimWinnings(raceAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const claimWinnings = () => {
    writeContract({
      address: raceAddress,
      abi: RACE_INSTANCE_ABI,
      functionName: "claimWinnings",
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claimWinnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to get active races from the factory
 */
export function useActiveRaces() {
  const { chainId } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: chainId ? getRaceFactoryAddress(chainId) : undefined,
    abi: RACE_FACTORY_ABI,
    functionName: "getActiveRaces",
    query: {
      enabled: !!chainId,
    },
  });

  return {
    raceIds: (data as bigint[])?.map(id => Number(id)) || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get details for a specific race
 */
export function useRaceDetails(raceId: number | null) {
  const { chainId } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: chainId ? getRaceFactoryAddress(chainId) : undefined,
    abi: RACE_FACTORY_ABI,
    functionName: "getRaceDetails",
    args: raceId !== null ? [BigInt(raceId)] : undefined,
    query: {
      enabled: !!chainId && raceId !== null,
    },
  });

  let raceDetails: RaceDetails | null = null;

  if (data) {
    const [raceAddress, host, entryFee, currentState, totalPlayers, prizePool] = data as [
      `0x${string}`,
      `0x${string}`,
      bigint,
      number,
      bigint,
      bigint
    ];

    raceDetails = {
      raceId: raceId!,
      raceAddress,
      host,
      entryFee,
      state: currentState as RaceState,
      totalPlayers: Number(totalPlayers),
      prizePool,
    };
  }

  return {
    raceDetails,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get race instance data
 */
export function useRaceInstance(raceAddress: `0x${string}` | null) {
  const { data: state } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "state",
    query: {
      enabled: !!raceAddress,
      refetchInterval: 2000, // Poll every 2 seconds
    },
  });

  const { data: prizePool } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "prizePool",
    query: {
      enabled: !!raceAddress,
      refetchInterval: 2000,
    },
  });

  const { data: team1Players } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "getTeam1Players",
    query: {
      enabled: !!raceAddress,
      refetchInterval: 2000,
    },
  });

  const { data: team2Players } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "getTeam2Players",
    query: {
      enabled: !!raceAddress,
      refetchInterval: 2000,
    },
  });

  const { data: winningTeam } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "winningTeam",
    query: {
      enabled: !!raceAddress && state === 2, // Only when race ended
    },
  });

  return {
    state: state as RaceState | undefined,
    prizePool: prizePool as bigint | undefined,
    team1Players: (team1Players as `0x${string}`[]) || [],
    team2Players: (team2Players as `0x${string}`[]) || [],
    winningTeam: winningTeam as number | undefined,
  };
}

/**
 * Hook to get player's team and claimable amount
 */
export function usePlayerInfo(raceAddress: `0x${string}` | null, playerAddress: `0x${string}` | undefined) {
  const { data: team } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "playerTeam",
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!raceAddress && !!playerAddress,
    },
  });

  const { data: claimableAmount } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "getClaimableAmount",
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!raceAddress && !!playerAddress,
    },
  });

  const { data: hasClaimed } = useReadContract({
    address: raceAddress || undefined,
    abi: RACE_INSTANCE_ABI,
    functionName: "hasClaimed",
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!raceAddress && !!playerAddress,
    },
  });

  return {
    team: team as number | undefined,
    claimableAmount: claimableAmount as bigint | undefined,
    hasClaimed: hasClaimed as boolean | undefined,
  };
}

/**
 * Hook to watch for race events
 */
export function useRaceEvents(raceId: number | null, onEvent: (event: any) => void) {
  const { chainId } = useAccount();

  useWatchContractEvent({
    address: chainId ? getRaceFactoryAddress(chainId) : undefined,
    abi: RACE_FACTORY_ABI,
    eventName: "PlayerJoined",
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (Number(log.args.raceId) === raceId) {
          onEvent({ type: "PlayerJoined", ...log.args });
        }
      });
    },
  });

  useWatchContractEvent({
    address: chainId ? getRaceFactoryAddress(chainId) : undefined,
    abi: RACE_FACTORY_ABI,
    eventName: "RaceStarted",
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (Number(log.args.raceId) === raceId) {
          onEvent({ type: "RaceStarted", ...log.args });
        }
      });
    },
  });

  useWatchContractEvent({
    address: chainId ? getRaceFactoryAddress(chainId) : undefined,
    abi: RACE_FACTORY_ABI,
    eventName: "RaceEnded",
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (Number(log.args.raceId) === raceId) {
          onEvent({ type: "RaceEnded", ...log.args });
        }
      });
    },
  });
}

