"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { truncateAddress } from "~/lib/truncateAddress";
import { useActiveRaces, useRaceDetails, useCreateRace, useJoinRace } from "~/lib/contracts/hooks";
import { formatEther, parseEther } from "viem";
import { getRaceFactoryAddress } from "~/lib/contracts/addresses";
import { RaceState } from "~/lib/contracts/types";

interface DashboardProps {
  address: `0x${string}` | undefined;
  onRaceSelect: (raceId: number, raceAddress: `0x${string}`) => void;
}

export default function Dashboard({ address, onRaceSelect }: DashboardProps) {
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntryFee, setSelectedEntryFee] = useState("0.001");

  const { raceIds, refetch } = useActiveRaces();
  const { createRace, isPending: isCreating, isConfirming, isSuccess, createdRaceId, error: createError } = useCreateRace();
  
  // Handle successful race creation
  useEffect(() => {
    if (isSuccess) {
      console.log("Race created successfully! Race ID:", createdRaceId);
      setShowCreateModal(false);
      refetch();
    }
  }, [isSuccess, createdRaceId, refetch]);
  
  // Handle creation errors
  useEffect(() => {
    if (createError) {
      console.error("Error creating race:", createError);
      alert(`Failed to create race: ${createError.message}`);
    }
  }, [createError]);

  const handleCreateRace = async () => {
    const entryFee = parseEther(selectedEntryFee);

    // Check network
    if (chainId !== baseSepolia.id) {
      console.log("Wrong network, switching to Base Sepolia...");
      switchChain?.({ chainId: baseSepolia.id });
      return;
    }

    // Create race on blockchain with entry fee as value
    try {
      console.log("Creating race with entry fee:", formatEther(entryFee), "ETH");
      console.log("Chain ID:", chainId);
      console.log("Factory address:", getRaceFactoryAddress(chainId));
      
      createRace(entryFee);
      
      // Don't close modal yet - wait for transaction to be signed
      // Modal will close when transaction is confirmed
    } catch (error) {
      console.error("Failed to create race:", error);
      alert("Failed to create race. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                🏁 Onbase Derby
              </h1>
            </div>
            
            {/* Wallet Info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Wallet Address */}
              <div className="bg-white/5 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/10">
                <div className="font-mono text-xs sm:text-sm text-white whitespace-nowrap">
                  {address && `${address.slice(0, 4)}...${address.slice(-4)}`}
                </div>
              </div>
              
              {/* Disconnect Button */}
              <button
                onClick={() => disconnect()}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Disconnect"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {raceIds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-20 px-4"
            >
              <div className="text-5xl sm:text-6xl mb-4">🏁</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No Active Races</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-6">Be the first to create a race and start competing!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all text-sm sm:text-base hover:scale-105 active:scale-95"
              >
                Create First Race
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {raceIds.map((raceId) => (
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
                  disabled={isCreating || isConfirming}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating && "⏳ Sign TX..."}
                  {isConfirming && "⌛ Confirming..."}
                  {!isCreating && !isConfirming && "Create"}
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
  const { raceDetails, isLoading } = useRaceDetails(raceId);
  const { joinRace, isPending, isConfirming, isSuccess, error: joinError } = useJoinRace();

  const handleJoin = async () => {
    if (!raceDetails) return;

    try {
      console.log("Joining race:", raceId, "with entry fee:", formatEther(raceDetails.entryFee), "ETH");
      joinRace(raceId, raceDetails.entryFee);
    } catch (error) {
      console.error("Failed to join race:", error);
      alert("Failed to join race. Check console for details.");
    }
  };
  
  // Handle successful join
  useEffect(() => {
    if (isSuccess) {
      console.log("Successfully joined race!");
    }
  }, [isSuccess]);
  
  // Handle join errors
  useEffect(() => {
    if (joinError) {
      console.error("Error joining race:", joinError);
      alert(`Failed to join: ${joinError.message}`);
    }
  }, [joinError]);

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
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && "⏳ Sign TX..."}
          {isConfirming && "⌛ Confirming..."}
          {!isPending && !isConfirming && "Join Race"}
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

