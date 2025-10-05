"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "~/components/ui/Button";
import { useRaceInstance, usePlayerInfo, useClaimWinnings } from "~/lib/contracts/hooks";
import { formatEther } from "viem";

interface VictoryScreenProps {
  raceId: number;
  raceAddress: `0x${string}`;
  onBackToHome: () => void;
}

export function VictoryScreen({ raceId, raceAddress, onBackToHome }: VictoryScreenProps) {
  const { address } = useAccount();
  const { winningTeam, prizePool } = useRaceInstance(raceAddress);
  const { team, claimableAmount, hasClaimed } = usePlayerInfo(raceAddress, address);
  const { claimWinnings, isPending, isConfirming, isSuccess } = useClaimWinnings(raceAddress);

  const [showConfetti, setShowConfetti] = useState(false);

  const isWinner = team === winningTeam;

  useEffect(() => {
    if (isWinner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isWinner]);

  const handleClaim = () => {
    claimWinnings();
  };

  return (
    <div className="px-6 py-4 max-w-2xl mx-auto">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 animate-pulse">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              >
                {["🎉", "🏆", "⭐", "✨", "🎊"][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Victory Banner */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">
          {winningTeam === 1 ? "Ξ" : "₿"}
        </h1>
        <h2 className="text-3xl font-bold mb-2">
          Team {winningTeam === 1 ? "Ethereum" : "Bitcoin"} Wins!
        </h2>
        <p className="text-lg text-muted-foreground">
          Race #{raceId} Complete
        </p>
      </div>

      {/* Results Card */}
      <div
        className={`bg-card rounded-lg p-6 border-2 mb-6 ${
          isWinner ? "border-primary" : "border-border"
        }`}
      >
        {isWinner ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                You Won!
              </h3>
              <p className="text-muted-foreground">
                Congratulations! Your team secured victory.
              </p>
            </div>

            {/* Winnings */}
            <div className="bg-background rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Your Winnings:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {claimableAmount ? formatEther(claimableAmount) : "0"} ETH
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                Based on your tap contribution
              </div>
            </div>

            {/* Prize Pool Info */}
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Prize Pool:</span>
                <span className="font-medium">
                  {prizePool ? formatEther(prizePool) : "0"} ETH
                </span>
              </div>
            </div>

            {/* Claim Button */}
            {!hasClaimed && claimableAmount && claimableAmount > 0n ? (
              <Button
                onClick={handleClaim}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                disabled={isPending || isConfirming}
                isLoading={isPending || isConfirming}
              >
                💰 Claim Winnings
              </Button>
            ) : hasClaimed || isSuccess ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
                <p className="font-bold text-green-500">✓ Winnings Claimed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your wallet for the ETH
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No winnings to claim
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold mb-2">Better Luck Next Time</h3>
              <p className="text-muted-foreground">
                Your team didn't win this race, but you can try again!
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prize Pool:</span>
                <span className="font-medium">
                  {prizePool ? formatEther(prizePool) : "0"} ETH
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Winners will claim their share
              </p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={onBackToHome} className="w-full" variant="outline">
          🏠 Back to Home
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 bg-muted/50 rounded-lg p-4">
        <h4 className="font-bold mb-3 text-center">Race Statistics</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winning Team:</span>
            <span className="font-medium">
              {winningTeam === 1 ? "Ethereum Ξ" : "Bitcoin ₿"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Team:</span>
            <span className="font-medium">
              {team === 1 ? "Ethereum Ξ" : team === 2 ? "Bitcoin ₿" : "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

