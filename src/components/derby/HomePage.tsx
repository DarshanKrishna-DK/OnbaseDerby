"use client";

import { useState } from "react";
import { useConnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "~/components/ui/Button";
import { useCreateRace, useActiveRaces, useRaceDetails, useJoinRace } from "~/lib/contracts/hooks";
import { formatEther, parseEther } from "viem";
import { RaceState } from "~/lib/contracts/types";

interface HomePageProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  onRaceJoined: (raceId: number, raceAddress: `0x${string}`) => void;
  onRaceCreated: (raceId: number, raceAddress: `0x${string}`) => void;
}

export function HomePage({ isConnected, address, onRaceJoined, onRaceCreated }: HomePageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntryFee, setSelectedEntryFee] = useState("0.001");

  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { createRace, isPending: isCreating, isConfirming: isConfirmingCreate } = useCreateRace();
  const { raceIds, refetch: refetchRaces } = useActiveRaces();

  const handleCreateRace = () => {
    if (chainId !== baseSepolia.id) {
      switchChain?.({ chainId: baseSepolia.id });
      return;
    }

    const entryFee = parseEther(selectedEntryFee);
    createRace(entryFee);
    setShowCreateModal(false);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            ⚡ Onbase Derby
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tap-to-win racing game. Compete in teams, race to the finish, and claim your share of the prize!
          </p>

          <div className="space-y-3">
            {connectors.slice(1).map((connector) => (
              <Button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="w-full"
              >
                Connect {connector.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          ⚡ Onbase Derby
        </h1>
        <p className="text-muted-foreground">
          Ethereum vs Bitcoin - Who will win?
        </p>
      </div>

      {/* Create Race Button */}
      <div className="mb-8">
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          disabled={isCreating || isConfirmingCreate}
          isLoading={isCreating || isConfirmingCreate}
        >
          🏁 Create New Race
        </Button>
      </div>

      {/* Active Races List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Active Races</h2>
          <Button
            onClick={() => refetchRaces()}
            className="px-3 py-1 text-sm"
          >
            Refresh
          </Button>
        </div>

        {raceIds.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No active races. Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {raceIds.map((raceId) => (
              <RaceCard
                key={raceId}
                raceId={raceId}
                currentAddress={address}
                onJoin={onRaceJoined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Race Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border">
            <h3 className="text-2xl font-bold mb-4">Create a Race</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Entry Fee</label>
              <div className="space-y-2">
                {["0.001", "0.01", "0.1"].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setSelectedEntryFee(fee)}
                    className={`w-full py-3 px-4 rounded-lg border-2 transition-colors ${
                      selectedEntryFee === fee
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-bold">{fee} ETH</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRace}
                className="flex-1"
                isLoading={isCreating || isConfirmingCreate}
                disabled={isCreating || isConfirmingCreate}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RaceCardProps {
  raceId: number;
  currentAddress: `0x${string}` | undefined;
  onJoin: (raceId: number, raceAddress: `0x${string}`) => void;
}

function RaceCard({ raceId, currentAddress, onJoin }: RaceCardProps) {
  const { raceDetails, isLoading } = useRaceDetails(raceId);
  const { joinRace, isPending, isConfirming } = useJoinRace();

  const handleJoin = () => {
    if (raceDetails) {
      joinRace(raceId, raceDetails.entryFee);
    }
  };

  if (isLoading || !raceDetails) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  const isHost = raceDetails.host.toLowerCase() === currentAddress?.toLowerCase();
  const stateText = raceDetails.state === RaceState.Created ? "Waiting" : raceDetails.state === RaceState.Started ? "In Progress" : "Ended";

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">Race #{raceId}</h3>
          <p className="text-sm text-muted-foreground">Entry: {formatEther(raceDetails.entryFee)} ETH</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          raceDetails.state === RaceState.Created ? "bg-blue-500/20 text-blue-500" :
          raceDetails.state === RaceState.Started ? "bg-green-500/20 text-green-500" :
          "bg-gray-500/20 text-gray-500"
        }`}>
          {stateText}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-muted-foreground">Players: {raceDetails.totalPlayers}</span>
        <span className="font-medium">Prize: {formatEther(raceDetails.prizePool)} ETH</span>
      </div>

      {raceDetails.state === RaceState.Created && !isHost && (
        <Button
          onClick={handleJoin}
          className="w-full"
          disabled={isPending || isConfirming}
          isLoading={isPending || isConfirming}
        >
          Join Race
        </Button>
      )}

      {isHost && (
        <Button
          onClick={() => onJoin(raceId, raceDetails.raceAddress)}
          className="w-full"
        >
          Enter Lobby
        </Button>
      )}

      {raceDetails.state !== RaceState.Created && !isHost && (
        <Button
          onClick={() => onJoin(raceId, raceDetails.raceAddress)}
          className="w-full"
          variant="outline"
        >
          View Race
        </Button>
      )}
    </div>
  );
}

