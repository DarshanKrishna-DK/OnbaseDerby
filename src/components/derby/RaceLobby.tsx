"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "~/components/ui/Button";
import { useRaceDetails, useRaceInstance, useStartRace, useRaceEvents } from "~/lib/contracts/hooks";
import { formatEther } from "viem";
import { RaceState } from "~/lib/contracts/types";
import { truncateAddress } from "~/lib/truncateAddress";

interface RaceLobbyProps {
  raceId: number;
  raceAddress: `0x${string}`;
  onRaceStarted: () => void;
  onBack: () => void;
}

export function RaceLobby({ raceId, raceAddress, onRaceStarted, onBack }: RaceLobbyProps) {
  const { address } = useAccount();
  const { raceDetails, refetch } = useRaceDetails(raceId);
  const { state, prizePool, team1Players, team2Players } = useRaceInstance(raceAddress);
  const { startRace, isPending, isConfirming } = useStartRace();

  const isHost = raceDetails?.host.toLowerCase() === address?.toLowerCase();

  // Listen for race events
  useRaceEvents(raceId, (event) => {
    if (event.type === "PlayerJoined") {
      refetch();
    } else if (event.type === "RaceStarted") {
      onRaceStarted();
    }
  });

  // Auto-navigate when race starts
  useEffect(() => {
    if (state === RaceState.Started) {
      onRaceStarted();
    }
  }, [state, onRaceStarted]);

  const handleStartRace = () => {
    startRace(raceId);
  };

  if (!raceDetails) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading race...</p>
        </div>
      </div>
    );
  }

  const canStart = team1Players.length > 0 && team2Players.length > 0;

  return (
    <div className="px-6 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          ← Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Race #{raceId} Lobby</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Entry Fee: {formatEther(raceDetails.entryFee)} ETH
          </p>
          <p className="text-lg font-bold text-primary">
            Prize Pool: {prizePool ? formatEther(prizePool) : "0"} ETH
          </p>
        </div>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Team Ethereum */}
        <div className="bg-card rounded-lg p-4 border-2 border-blue-500">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">Ξ</div>
            <h3 className="font-bold text-lg">Team Ethereum</h3>
            <p className="text-sm text-muted-foreground">
              {team1Players.length} {team1Players.length === 1 ? "Player" : "Players"}
            </p>
          </div>
          <div className="space-y-2">
            {team1Players.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Waiting for players...
              </p>
            ) : (
              team1Players.map((player, idx) => (
                <div
                  key={player}
                  className="bg-background rounded px-3 py-2 text-sm font-mono"
                >
                  {truncateAddress(player)}
                  {player.toLowerCase() === address?.toLowerCase() && (
                    <span className="ml-2 text-xs text-primary">(You)</span>
                  )}
                  {player.toLowerCase() === raceDetails.host.toLowerCase() && (
                    <span className="ml-2 text-xs text-yellow-500">👑 Host</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Bitcoin */}
        <div className="bg-card rounded-lg p-4 border-2 border-orange-500">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">₿</div>
            <h3 className="font-bold text-lg">Team Bitcoin</h3>
            <p className="text-sm text-muted-foreground">
              {team2Players.length} {team2Players.length === 1 ? "Player" : "Players"}
            </p>
          </div>
          <div className="space-y-2">
            {team2Players.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Waiting for players...
              </p>
            ) : (
              team2Players.map((player, idx) => (
                <div
                  key={player}
                  className="bg-background rounded px-3 py-2 text-sm font-mono"
                >
                  {truncateAddress(player)}
                  {player.toLowerCase() === address?.toLowerCase() && (
                    <span className="ml-2 text-xs text-primary">(You)</span>
                  )}
                  {player.toLowerCase() === raceDetails.host.toLowerCase() && (
                    <span className="ml-2 text-xs text-yellow-500">👑 Host</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Start Race Section */}
      <div className="bg-card rounded-lg p-6 border border-border text-center">
        {isHost ? (
          <>
            {canStart ? (
              <Button
                onClick={handleStartRace}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                disabled={isPending || isConfirming}
                isLoading={isPending || isConfirming}
              >
                🏁 Start Race
              </Button>
            ) : (
              <div>
                <p className="text-muted-foreground mb-2">
                  ⏳ Waiting for at least one player on each team...
                </p>
                <p className="text-sm text-muted-foreground">
                  Need {team1Players.length === 0 ? "Team Ethereum" : "Team Bitcoin"} players
                </p>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">⏳ Waiting for host to start the race...</p>
            <p className="text-sm text-muted-foreground">
              The race will begin once the host clicks "Start Race"
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-muted/50 rounded-lg p-4">
        <h4 className="font-bold mb-2">📋 How to Play:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Tap as fast as you can to move your team's coin forward</li>
          <li>• First team to complete the race wins!</li>
          <li>• Winners split the prize based on their tap contributions</li>
        </ul>
      </div>
    </div>
  );
}

