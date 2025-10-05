"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { RaceState, Team } from "~/lib/contracts/types";
import WinnerPage from "./WinnerPage";

interface RaceTrackProps {
  raceId: number;
  raceAddress: `0x${string}`;
  isHost: boolean;
  onBack: () => void;
}

export default function RaceTrack({ raceId, raceAddress, isHost, onBack }: RaceTrackProps) {
  const { address } = useAccount();
  const [raceState, setRaceState] = useState<any>(null);
  const [myTaps, setMyTaps] = useState(0);
  const [isRaceStarted, setIsRaceStarted] = useState(false);
  const [isRaceEnded, setIsRaceEnded] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapQueueRef = useRef<number>(0);

  // Initialize race on mount
  useEffect(() => {
    const initRace = async () => {
      try {
        const response = await fetch("/api/race/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raceId,
            players: [
              { address: address!, team: Team.Ethereum },
              { address: "0x1111111111111111111111111111111111111111", team: Team.Bitcoin },
            ],
          }),
        });
        const data = await response.json();
        if (data.success) {
          setRaceState(data.race);
        }
      } catch (error) {
        console.error("Failed to initialize race:", error);
      }
    };

    initRace();
  }, [raceId, address]);

  // Poll race state
  const pollRaceState = useCallback(async () => {
    try {
      const response = await fetch(`/api/race/${raceId}/state`);
      const data = await response.json();
      if (data.success) {
        setRaceState(data.race);
        if (data.race.state === RaceState.Ended) {
          setIsRaceEnded(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      }
    } catch (error) {
      console.error("Failed to poll race state:", error);
    }
  }, [raceId]);

  useEffect(() => {
    if (isRaceStarted && !isRaceEnded) {
      pollIntervalRef.current = setInterval(pollRaceState, 200);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isRaceStarted, isRaceEnded, pollRaceState]);

  // Batch tap sending
  useEffect(() => {
    if (!isRaceStarted || isRaceEnded) return;

    const sendTapsInterval = setInterval(async () => {
      if (tapQueueRef.current > 0) {
        try {
          await fetch(`/api/race/${raceId}/tap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerAddress: address }),
          });
          tapQueueRef.current = 0;
        } catch (error) {
          console.error("Failed to send taps:", error);
        }
      }
    }, 100);

    return () => clearInterval(sendTapsInterval);
  }, [isRaceStarted, isRaceEnded, raceId, address]);

  const handleStartRace = async () => {
    try {
      const response = await fetch("/api/race/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raceId }),
      });
      const data = await response.json();
      if (data.success) {
        setIsRaceStarted(true);
        setRaceState(data.race);
      }
    } catch (error) {
      console.error("Failed to start race:", error);
    }
  };

  const handleTap = () => {
    if (!isRaceStarted || isRaceEnded) return;
    setMyTaps((prev) => prev + 1);
    tapQueueRef.current++;
  };

  // Calculate positions
  const TARGET_TAPS = 2500;
  const team1Progress = raceState ? (raceState.team1Taps / TARGET_TAPS) * 100 : 0;
  const team2Progress = raceState ? (raceState.team2Taps / TARGET_TAPS) * 100 : 0;

  // Get player's team
  const myTeam = raceState?.players[address!]?.team;

  if (isRaceEnded) {
    return (
      <WinnerPage
        raceId={raceId}
        raceAddress={raceAddress}
        winningTeam={raceState?.winningTeam}
        myTeam={myTeam}
        myTaps={myTaps}
        teamTotalTaps={
          raceState?.winningTeam === Team.Ethereum
            ? raceState?.team1Taps
            : raceState?.team2Taps
        }
        prizePool={BigInt("1000000000000000")}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="text-sm font-semibold bg-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/50">
          Race #{raceId}
        </div>
      </div>

      {/* Waiting for Start */}
      {!isRaceStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">🏁 Race Lobby</h2>
            <p className="text-gray-300 mb-6">
              {isHost ? "Ready to start the race?" : "Waiting for host to start..."}
            </p>
            
            {isHost ? (
              <button
                onClick={handleStartRace}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                🚀 START RACE
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Race Track */}
      {isRaceStarted && (
        <div className="max-w-6xl mx-auto">
          {/* Track Container */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-3xl p-4 sm:p-8 border border-white/10 mb-6">
            {/* Team 1 - Ethereum */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl sm:text-4xl">🔵</span>
                  <span className="font-bold text-lg sm:text-xl">Team Ethereum</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-blue-400">
                  {raceState?.team1Taps || 0} taps
                </span>
              </div>
              <div className="relative h-16 sm:h-20 bg-gray-900/50 rounded-2xl overflow-hidden border-2 border-blue-500/30">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500/50 to-blue-400/30"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(team1Progress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center">
                  <motion.div
                    className="text-4xl sm:text-5xl ml-2"
                    animate={{ x: `${Math.min(team1Progress, 100) * 9}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    🪙
                  </motion.div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl">
                  🏁
                </div>
              </div>
            </div>

            {/* Team 2 - Bitcoin */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl sm:text-4xl">🟠</span>
                  <span className="font-bold text-lg sm:text-xl">Team Bitcoin</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-orange-400">
                  {raceState?.team2Taps || 0} taps
                </span>
              </div>
              <div className="relative h-16 sm:h-20 bg-gray-900/50 rounded-2xl overflow-hidden border-2 border-orange-500/30">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500/50 to-orange-400/30"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(team2Progress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center">
                  <motion.div
                    className="text-4xl sm:text-5xl ml-2"
                    animate={{ x: `${Math.min(team2Progress, 100) * 9}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    🪙
                  </motion.div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl">
                  🏁
                </div>
              </div>
            </div>
          </div>

          {/* Tap Button */}
          <div className="text-center mb-6">
            <motion.button
              onClick={handleTap}
              whileTap={{ scale: 0.9 }}
              className="w-full max-w-md h-32 sm:h-40 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl font-black text-4xl sm:text-5xl shadow-2xl hover:shadow-purple-500/50 active:shadow-inner transition-all border-4 border-white/30"
            >
              TAP! 👆
            </motion.button>
            <motion.p
              key={myTaps}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 text-2xl sm:text-3xl font-bold text-yellow-400"
            >
              Your Taps: {myTaps}
            </motion.p>
          </div>

          {/* Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">📊 Live Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Team</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {myTeam === Team.Ethereum ? "🔵 Ethereum" : "🟠 Bitcoin"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Team Total</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {myTeam === Team.Ethereum ? raceState?.team1Taps : raceState?.team2Taps}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
