"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { truncateAddress } from "~/lib/truncateAddress";
import { useActiveRaces, useRaceDetails, useCreateRace, useJoinRace } from "~/lib/contracts/hooks";
import { formatEther, parseEther } from "viem";
import { RaceState } from "~/lib/contracts/types";

interface DashboardProps {
  address: `0x${string}` | undefined;
  onRaceSelect: (raceId: number, raceAddress: `0x${string}`) => void;
}

export function Dashboard({ address, onRaceSelect }: DashboardProps) {
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntryFee, setSelectedEntryFee] = useState("0.001");

  const { raceIds, refetch } = useActiveRaces();
  const { createRace, isPending: isCreating } = useCreateRace();
  
  // Demo mode support
  const [demoRaces, setDemoRaces] = useState<number[]>([]);
  const isDemoMode = !process.env.NEXT_PUBLIC_RACE_FACTORY_ADDRESS;

  useEffect(() => {
    if (isDemoMode) {
      // Load demo races
      import("~/lib/demo-data").then(({ getMockActiveRaces }) => {
        setDemoRaces(getMockActiveRaces());
      });
    }
  }, [isDemoMode]);

  const displayRaceIds = isDemoMode ? demoRaces : raceIds;

  const handleCreateRace = async () => {
    if (isDemoMode) {
      // Demo mode: create mock race
      const { createMockRace } = await import("~/lib/demo-data");
      const entryFee = parseEther(selectedEntryFee);
      const newRace = createMockRace(entryFee, address!);
      setDemoRaces((prev) => [...prev, newRace.raceId]);
      setShowCreateModal(false);
      return;
    }

    if (chainId !== baseSepolia.id) {
      switchChain?.({ chainId: baseSepolia.id });
      return;
    }

    const entryFee = parseEther(selectedEntryFee);
    createRace(entryFee);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Onbase Derby
              </h1>
              <p className="text-sm text-gray-400">Ethereum vs Bitcoin</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Wallet</div>
                <div className="font-mono text-sm text-white">
                  {address && truncateAddress(address)}
                </div>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Disconnect"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Race Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl shadow-2xl shadow-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-2xl font-bold text-white">Create New Race</span>
          </div>
        </motion.button>

        {/* Races List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Active Races</h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {isDemoMode && demoRaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4 mb-4 text-center"
            >
              <p className="text-blue-400 font-semibold">🎮 Demo Mode Active</p>
              <p className="text-sm text-gray-400 mt-1">
                Create races to test without deployed contracts
              </p>
            </motion.div>
          )}

          {displayRaceIds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🏁</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Active Races</h3>
              <p className="text-gray-400 mb-6">Be the first to create a race and start competing!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all"
              >
                Create First Race
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRaceIds.map((raceId) => (
                <RaceCard
                  key={raceId}
                  raceId={raceId}
                  currentAddress={address}
                  onSelect={onRaceSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Race Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-white mb-6">Create a Race</h3>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-4">Select Entry Fee</label>
                <div className="space-y-3">
                  {["0.001", "0.01", "0.1"].map((fee) => (
                    <button
                      key={fee}
                      onClick={() => setSelectedEntryFee(fee)}
                      className={`w-full py-4 px-6 rounded-xl border-2 transition-all ${
                        selectedEntryFee === fee
                          ? "border-blue-500 bg-blue-500/20 text-white"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
                      }`}
                    >
                      <span className="text-2xl font-bold">{fee} ETH</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRace}
                  disabled={isCreating}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RaceCardProps {
  raceId: number;
  currentAddress: `0x${string}` | undefined;
  onSelect: (raceId: number, raceAddress: `0x${string}`) => void;
}

function RaceCard({ raceId, currentAddress, onSelect }: RaceCardProps) {
  const { raceDetails: contractRaceDetails, isLoading } = useRaceDetails(raceId);
  const { joinRace, isPending } = useJoinRace();
  const [mockRaceDetails, setMockRaceDetails] = useState<any>(null);
  const isDemoMode = !process.env.NEXT_PUBLIC_RACE_FACTORY_ADDRESS;

  useEffect(() => {
    if (isDemoMode) {
      import("~/lib/demo-data").then(({ getMockRaceDetails }) => {
        const details = getMockRaceDetails(raceId);
        setMockRaceDetails(details);
      });
    }
  }, [raceId, isDemoMode]);

  const raceDetails = isDemoMode ? mockRaceDetails : contractRaceDetails;

  const handleJoin = async () => {
    if (!raceDetails) return;

    if (isDemoMode) {
      const { joinMockRace } = await import("~/lib/demo-data");
      joinMockRace(raceId, raceDetails.entryFee);
      // Refresh display
      const { getMockRaceDetails } = await import("~/lib/demo-data");
      const updated = getMockRaceDetails(raceId);
      setMockRaceDetails(updated);
      return;
    }

    joinRace(raceId, raceDetails.entryFee);
  };

  if (isLoading || !raceDetails) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 animate-pulse">
        <div className="h-32 bg-white/10 rounded-lg"></div>
      </div>
    );
  }

  const isHost = raceDetails.host.toLowerCase() === currentAddress?.toLowerCase();
  const stateColors = {
    [RaceState.Created]: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    [RaceState.Started]: "bg-green-500/20 text-green-400 border-green-500/50",
    [RaceState.Ended]: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Race #{raceId}</h3>
          <p className="text-sm text-gray-400">{formatEther(raceDetails.entryFee)} ETH</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stateColors[raceDetails.state]}`}>
          {raceDetails.state === RaceState.Created ? "Open" : raceDetails.state === RaceState.Started ? "Racing" : "Ended"}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-4 text-gray-300">
        <span>👥 {raceDetails.totalPlayers} players</span>
        <span className="font-semibold text-blue-400">{formatEther(raceDetails.prizePool)} ETH</span>
      </div>

      {raceDetails.state === RaceState.Created && !isHost && (
        <button
          onClick={handleJoin}
          disabled={isPending}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {isPending ? "Joining..." : "Join Race"}
        </button>
      )}

      {isHost && (
        <button
          onClick={() => onSelect(raceId, raceDetails.raceAddress)}
          className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-lg transition-all border border-yellow-500/50"
        >
          👑 Enter Lobby
        </button>
      )}

      {raceDetails.state !== RaceState.Created && !isHost && (
        <button
          onClick={() => onSelect(raceId, raceDetails.raceAddress)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all"
        >
          View Race
        </button>
      )}
    </motion.div>
  );
}

