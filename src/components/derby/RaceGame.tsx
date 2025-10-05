"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Button } from "~/components/ui/Button";
import { useRaceInstance, usePlayerInfo } from "~/lib/contracts/hooks";

interface RaceGameProps {
  raceId: number;
  raceAddress: `0x${string}`;
  onRaceEnded: () => void;
}

export function RaceGame({ raceId, raceAddress, onRaceEnded }: RaceGameProps) {
  const { address } = useAccount();
  const { state, team1Players, team2Players } = useRaceInstance(raceAddress);
  const { team } = usePlayerInfo(raceAddress, address);

  const [myTaps, setMyTaps] = useState(0);
  const [team1Taps, setTeam1Taps] = useState(0);
  const [team2Taps, setTeam2Taps] = useState(0);
  const [isRaceActive, setIsRaceActive] = useState(true);

  const LAPS_TO_WIN = 5;
  const TAPS_PER_LAP = 500;
  const TARGET_TAPS = LAPS_TO_WIN * TAPS_PER_LAP;

  // Handle tap
  const handleTap = useCallback(() => {
    if (!isRaceActive) return;

    setMyTaps((prev) => prev + 1);

    // Update team taps based on player's team
    if (team === 1) {
      setTeam1Taps((prev) => {
        const newTotal = prev + 1;
        if (newTotal >= TARGET_TAPS) {
          setIsRaceActive(false);
          setTimeout(onRaceEnded, 1000);
        }
        return newTotal;
      });
    } else if (team === 2) {
      setTeam2Taps((prev) => {
        const newTotal = prev + 1;
        if (newTotal >= TARGET_TAPS) {
          setIsRaceActive(false);
          setTimeout(onRaceEnded, 1000);
        }
        return newTotal;
      });
    }
  }, [team, isRaceActive, onRaceEnded, TARGET_TAPS]);

  // Calculate progress
  const team1Progress = Math.min((team1Taps / TARGET_TAPS) * 100, 100);
  const team2Progress = Math.min((team2Taps / TARGET_TAPS) * 100, 100);

  const team1Laps = Math.floor(team1Taps / TAPS_PER_LAP);
  const team2Laps = Math.floor(team2Taps / TAPS_PER_LAP);

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto">
      {/* Race Track */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Race #{raceId} - {isRaceActive ? "🏁 Racing!" : "🏆 Finished!"}
        </h2>

        {/* Team Ethereum Track */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-500">Ξ Team Ethereum</span>
            <span className="text-sm text-muted-foreground">
              Lap {team1Laps}/{LAPS_TO_WIN}
            </span>
          </div>
          <div className="relative h-16 bg-muted rounded-lg overflow-hidden border-2 border-blue-500">
            {/* Progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100"
              style={{ width: `${team1Progress}%` }}
            />
            {/* Coin */}
            <div
              className="absolute top-1/2 -translate-y-1/2 text-4xl transition-all duration-100"
              style={{ left: `${Math.min(team1Progress, 95)}%` }}
            >
              Ξ
            </div>
            {/* Finish line */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50" />
          </div>
          <div className="mt-1 text-sm text-muted-foreground text-right">
            {team1Taps.toLocaleString()} taps
          </div>
        </div>

        {/* Team Bitcoin Track */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-orange-500">₿ Team Bitcoin</span>
            <span className="text-sm text-muted-foreground">
              Lap {team2Laps}/{LAPS_TO_WIN}
            </span>
          </div>
          <div className="relative h-16 bg-muted rounded-lg overflow-hidden border-2 border-orange-500">
            {/* Progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-100"
              style={{ width: `${team2Progress}%` }}
            />
            {/* Coin */}
            <div
              className="absolute top-1/2 -translate-y-1/2 text-4xl transition-all duration-100"
              style={{ left: `${Math.min(team2Progress, 95)}%` }}
            >
              ₿
            </div>
            {/* Finish line */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50" />
          </div>
          <div className="mt-1 text-sm text-muted-foreground text-right">
            {team2Taps.toLocaleString()} taps
          </div>
        </div>
      </div>

      {/* Tap Button */}
      <div className="mb-8">
        <Button
          onClick={handleTap}
          disabled={!isRaceActive}
          className={`w-full h-48 text-4xl font-bold rounded-2xl ${
            isRaceActive
              ? "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 active:scale-95 transition-transform"
              : "bg-muted"
          }`}
        >
          {isRaceActive ? "TAP! 👆" : "Race Ended"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-bold text-primary">{myTaps}</div>
          <div className="text-xs text-muted-foreground">Your Taps</div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-blue-500 text-center">
          <div className="text-2xl font-bold text-blue-500">{team1Taps}</div>
          <div className="text-xs text-muted-foreground">Team Ξ Total</div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-orange-500 text-center">
          <div className="text-2xl font-bold text-orange-500">{team2Taps}</div>
          <div className="text-xs text-muted-foreground">Team ₿ Total</div>
        </div>
      </div>

      {/* Your Team */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          You're on{" "}
          <span
            className={`font-bold ${
              team === 1 ? "text-blue-500" : "text-orange-500"
            }`}
          >
            Team {team === 1 ? "Ethereum Ξ" : "Bitcoin ₿"}
          </span>
        </p>
      </div>

      {!isRaceActive && (
        <div className="mt-6 bg-primary/10 border border-primary rounded-lg p-4 text-center">
          <p className="font-bold text-lg">Race Complete! 🎉</p>
          <p className="text-sm text-muted-foreground mt-1">
            Calculating results...
          </p>
        </div>
      )}
    </div>
  );
}

