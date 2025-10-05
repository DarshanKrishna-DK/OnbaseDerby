"use client";

import { useConnect } from "wagmi";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { connect, connectors } = useConnect();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-5 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-6 sm:space-y-8 w-full">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 sm:p-6 rounded-full">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 leading-tight">
            Onbase Derby
          </h1>
          <p className="text-lg sm:text-xl text-purple-300 font-semibold">
            Tap-to-Win Racing Game
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto px-2"
        >
          Compete in real-time tap-to-win races. Stake ETH, race with your team, and claim proportional rewards based on your performance!
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-400 max-w-3xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="text-xl sm:text-2xl mb-2">⚡</div>
            <div className="font-semibold text-white mb-1 text-sm sm:text-base">Real-Time Racing</div>
            <div className="text-xs sm:text-sm">Tap to move your team forward</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="text-xl sm:text-2xl mb-2">💰</div>
            <div className="font-semibold text-white mb-1 text-sm sm:text-base">Stake & Earn</div>
            <div className="text-xs sm:text-sm">Winners split the prize pool</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="text-xl sm:text-2xl mb-2">🏆</div>
            <div className="font-semibold text-white mb-1 text-sm sm:text-base">Fair Rewards</div>
            <div className="text-xs sm:text-sm">Proportional to your taps</div>
          </div>
        </motion.div>

        {/* Connect Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 sm:space-y-4 pt-4"
        >
          {connectors.slice(1).map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full max-w-md mx-auto block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/50"
            >
              Connect with {connector.name}
            </button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs sm:text-sm text-gray-500 pt-6 sm:pt-8"
        >
          Powered by Base Sepolia • Built on Ethereum
        </motion.div>
      </div>
    </div>
  );
}
