"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { RaceState, Team } from "~/lib/contracts/types";
import WinnerPage from "./WinnerPage";
import CircularTrack from "~/components/CircularTrack";

interface RaceTrackProps {
  raceId: number;
  raceAddress: `0x${string}`;
  isHost: boolean;
  address: `0x${string}` | undefined;
  onBack: () => void;
}

export default function RaceTrack({ raceId, raceAddress, isHost: isHostProp, address: addressProp, onBack }: RaceTrackProps) {
  const { address: accountAddress } = useAccount();
  const address = addressProp || accountAddress;
  const [raceState, setRaceState] = useState<any>(null);
  const [isHost, setIsHost] = useState(isHostProp);
  const [myTaps, setMyTaps] = useState(0);
  const [isRaceStarted, setIsRaceStarted] = useState(false);
  const [isRaceEnded, setIsRaceEnded] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapQueueRef = useRef<number>(0);

  // Initialize race on mount - check if already exists first
  useEffect(() => {
    const initRace = async () => {
      try {
        console.log("🏁 RaceTrack: Initializing with raceId:", raceId, "address:", address);
        
        if (raceId === null || raceId === undefined) {
          console.error("❌ Invalid raceId:", raceId);
          return;
        }

        if (!address) {
          console.error("❌ No wallet address");
          return;
        }

        // First check if race already exists in backend
        console.log(`📡 Checking if race ${raceId} exists...`);
        const checkResponse = await fetch(`/api/race/${raceId}/state`);

        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.success && checkData.race) {
            // Race exists, use existing state
            console.log("✅ Race exists! Loading state:", checkData.race);
            setRaceState(checkData.race);
            
            // Determine if current user is host
            const hostAddress = Object.keys(checkData.race.players)[0]; // First player is host
            if (address && hostAddress) {
              const isCurrentUserHost = hostAddress.toLowerCase() === address.toLowerCase();
              console.log(`👤 User is ${isCurrentUserHost ? "HOST" : "PLAYER"}`);
              setIsHost(isCurrentUserHost);
            }
            
            if (checkData.race.state === RaceState.Started) {
              console.log("🏃 Race is already started!");
              setIsRaceStarted(true);
            }
            return;
          }
        }

        // Race doesn't exist in backend, initialize it
        console.log(`🆕 Race ${raceId} not found in backend. Initializing...`);
        const response = await fetch("/api/race/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raceId,
            players: [
              { address: address, team: Team.Ethereum },
            ],
          }),
        });
        
        const data = await response.json();
        console.log("📥 Init response:", data);
        
        if (data.success) {
          console.log("✅ Race initialized successfully!");
          setRaceState(data.race);
          setIsHost(true); // First user to initialize is the host
        } else {
          console.error("❌ Failed to initialize:", data.error);
        }
      } catch (error) {
        console.error("❌ Failed to initialize race:", error);
      }
    };

    if (address && raceId !== null && raceId !== undefined) {
      initRace();
    }
  }, [raceId, address]);

  // Poll race state
  const pollRaceState = useCallback(async () => {
    try {
      const response = await fetch(`/api/race/${raceId}/state`);
      if (!response.ok) {
        // Don't log 404 if race doesn't exist yet
        if (response.status !== 404) {
          console.error("Failed to fetch race state:", response.status);
        }
        return;
      }
      const data = await response.json();
      if (data.success && data.race) {
        setRaceState(data.race);
        if (data.race.state === RaceState.Started && !isRaceStarted) {
          setIsRaceStarted(true);
        }
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
  }, [raceId, isRaceStarted]);

  // Poll for race existence (for non-hosts waiting for initialization)
  useEffect(() => {
    if (!raceState) {
      const waitForRaceInterval = setInterval(pollRaceState, 1000);
      return () => clearInterval(waitForRaceInterval);
    }
  }, [raceState, pollRaceState]);

  // Poll during active race
  useEffect(() => {
    if (isRaceStarted && !isRaceEnded) {
      // Start polling immediately
      pollRaceState();
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
      const tapsToSend = tapQueueRef.current;
      if (tapsToSend > 0) {
        tapQueueRef.current = 0; // Reset immediately to prevent duplicates
        try {
          // Send the batch of taps
          for (let i = 0; i < tapsToSend; i++) {
            await fetch(`/api/race/${raceId}/tap`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerAddress: address }),
            });
          }
        } catch (error) {
          console.error("Failed to send taps:", error);
        }
      }
    }, 50); // Send every 50ms for smoother updates

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

  // Calculate positions and laps (3 laps = 3000 taps total, 1000 per lap)
  const TARGET_TAPS = 3000; // 3 laps
  const TAPS_PER_LAP = 1000;
  const team1Progress = raceState ? (raceState.team1Taps / TARGET_TAPS) * 100 : 0;
  const team2Progress = raceState ? (raceState.team2Taps / TARGET_TAPS) * 100 : 0;
  const team1Laps = raceState ? Math.floor(raceState.team1Taps / TAPS_PER_LAP) : 0;
  const team2Laps = raceState ? Math.floor(raceState.team2Taps / TAPS_PER_LAP) : 0;

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
          <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">🏁 Race Lobby</h2>
            
            {/* Player Count */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Players in Race</p>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {raceState ? Object.values(raceState.players).filter(p => p.team === Team.Ethereum).length : 0}
                  </div>
                  <div className="text-xs text-gray-400">Team 🔵</div>
                </div>
                <div className="text-gray-500 font-bold">VS</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {raceState ? Object.values(raceState.players).filter(p => p.team === Team.Bitcoin).length : 0}
                  </div>
                  <div className="text-xs text-gray-400">Team 🟠</div>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
              {isHost ? "Ready to start the race?" : "Waiting for host to start..."}
            </p>
            
            {isHost ? (
              <button
                onClick={handleStartRace}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
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
        <div className="max-w-4xl mx-auto px-4">
          {/* Circular Track */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/10 mb-6">
            <CircularTrack
              team1Progress={team1Progress}
              team2Progress={team2Progress}
              team1Laps={team1Laps}
              team2Laps={team2Laps}
            />
          </div>

          {/* Tap Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔵</span>
                <span className="text-sm text-gray-400">Team 1</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                {raceState?.team1Taps || 0}
              </p>
              <p className="text-xs text-gray-500">taps</p>
            </div>

            <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🟠</span>
                <span className="text-sm text-gray-400">Team 2</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">
                {raceState?.team2Taps || 0}
              </p>
              <p className="text-xs text-gray-500">taps</p>
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
            <motion.div
              key={myTaps}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                {myTaps}
              </p>
              <p className="text-sm text-gray-400 mt-1">your taps</p>
            </motion.div>
          </div>

          {/* Your Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">📊 Your Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Your Team</p>
                <p className="text-lg sm:text-xl font-bold">
                  {myTeam === Team.Ethereum ? "🔵 Team 1" : "🟠 Team 2"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Your Taps</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-400">
                  {myTaps}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Team Lap</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">
                  {myTeam === Team.Ethereum ? team1Laps : team2Laps}/3
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
