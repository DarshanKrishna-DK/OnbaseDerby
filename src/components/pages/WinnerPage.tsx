"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatEther } from "viem";
import { Team } from "~/lib/contracts/types";
import { useClaimWinnings } from "~/lib/contracts/hooks";

interface WinnerPageProps {
  raceId: number;
  raceAddress: `0x${string}`;
  winningTeam: Team;
  myTeam: Team;
  myTaps: number;
  teamTotalTaps: number;
  prizePool: bigint;
  onBack: () => void;
}

export default function WinnerPage({
  raceId,
  raceAddress,
  winningTeam,
  myTeam,
  myTaps,
  teamTotalTaps,
  prizePool,
  onBack,
}: WinnerPageProps) {
  const { claimWinnings, isPending: isClaiming } = useClaimWinnings(raceAddress);
  const [claimed, setClaimed] = useState(false);

  const didIWin = myTeam === winningTeam;
  const contributionPercentage = teamTotalTaps > 0 ? (myTaps / teamTotalTaps) * 100 : 0;
  const myWinnings = didIWin ? (Number(formatEther(prizePool)) * contributionPercentage) / 100 : 0;

  const handleClaim = async () => {
    try {
      await claimWinnings();
      setClaimed(true);
    } catch (error) {
      console.error("Failed to claim winnings:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
      >
        {/* Winner Announcement */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl sm:text-8xl mb-4"
          >
            {didIWin ? "🏆" : "😔"}
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-black mb-2">
            {winningTeam === Team.Ethereum ? "🔵 Team 1" : "🟠 Team 2"} Wins!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300">
            {didIWin ? "Congratulations! 🎉" : "Better luck next time!"}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-base sm:text-lg">Your Taps:</span>
            <span className="text-xl sm:text-2xl font-bold">{myTaps.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-base sm:text-lg">Team Total:</span>
            <span className="text-xl sm:text-2xl font-bold">{teamTotalTaps.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-base sm:text-lg">Your Contribution:</span>
            <span className="text-xl sm:text-2xl font-bold text-yellow-400">
              {contributionPercentage.toFixed(2)}%
            </span>
          </div>

          {didIWin && (
            <>
              <div className="border-t border-white/20 pt-3 sm:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base sm:text-lg">Your Winnings:</span>
                  <span className="text-2xl sm:text-3xl font-black text-green-400">
                    {myWinnings.toFixed(6)} ETH
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 sm:space-y-4">
          {didIWin && !claimed && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg sm:text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? "Claiming..." : "💰 Claim Winnings"}
            </button>
          )}

          {claimed && (
            <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-lg font-bold text-green-400">Winnings Claimed!</p>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg sm:text-xl transition-colors"
          >
            🏠 Back to Dashboard
          </button>
        </div>

        {/* Confetti */}
        {didIWin && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl sm:text-3xl"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: "-10%",
                  rotate: 0,
                }}
                animate={{
                  y: "110%",
                  rotate: 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {["🎉", "🏆", "⭐", "✨"][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
