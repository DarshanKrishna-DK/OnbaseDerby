"use client";

import { motion } from "framer-motion";

interface CircularTrackProps {
  team1Progress: number; // 0-100% (percentage of 3 laps)
  team2Progress: number;
  team1Laps: number; // Current lap number
  team2Laps: number;
}

export default function CircularTrack({
  team1Progress,
  team2Progress,
  team1Laps,
  team2Laps,
}: CircularTrackProps) {
  // Convert progress to angle (0-360 degrees per lap)
  const team1Angle = (team1Progress % (100 / 3)) * 10.8; // Scale to 360 degrees per lap
  const team2Angle = (team2Progress % (100 / 3)) * 10.8;

  // Calculate position on circle (SVG coordinates)
  const getPosition = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90 to start at top
    return {
      x: 200 + radius * Math.cos(radian), // Center at 200,200
      y: 200 + radius * Math.sin(radian),
    };
  };

  const team1Pos = getPosition(team1Angle, 140); // Outer track
  const team2Pos = getPosition(team2Angle, 100); // Inner track

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ transform: "scaleY(-1)" }} // Flip to make it go clockwise
      >
        {/* Background circles */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="#1e293b"
          strokeWidth="30"
          opacity="0.3"
        />
        <circle
          cx="200"
          cy="200"
          r="110"
          fill="none"
          stroke="#1e293b"
          strokeWidth="30"
          opacity="0.3"
        />

        {/* Track lanes */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="8"
          opacity="0.5"
          strokeDasharray="10 5"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="#f97316"
          strokeWidth="8"
          opacity="0.5"
          strokeDasharray="10 5"
        />

        {/* Start/Finish Line - At the top */}
        <line
          x1="200"
          y1="50"
          x2="200"
          y2="180"
          stroke="#22c55e"
          strokeWidth="4"
          strokeDasharray="8 4"
        />
        <text
          x="200"
          y="40"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="14"
          fontWeight="bold"
          style={{ transform: "scaleY(-1)", transformOrigin: "center" }}
        >
          🏁
        </text>

        {/* Team 1 Coin (Blue) - Outer track */}
        <motion.g
          animate={{
            x: team1Pos.x - 200,
            y: team1Pos.y - 200,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <circle cx="200" cy="200" r="18" fill="#3b82f6" opacity="0.8" />
          <text
            x="200"
            y="205"
            textAnchor="middle"
            fontSize="20"
            style={{ transform: "scaleY(-1)", transformOrigin: "200px 200px" }}
          >
            🔵
          </text>
        </motion.g>

        {/* Team 2 Coin (Orange) - Inner track */}
        <motion.g
          animate={{
            x: team2Pos.x - 200,
            y: team2Pos.y - 200,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <circle cx="200" cy="200" r="18" fill="#f97316" opacity="0.8" />
          <text
            x="200"
            y="205"
            textAnchor="middle"
            fontSize="20"
            style={{ transform: "scaleY(-1)", transformOrigin: "200px 200px" }}
          >
            🟠
          </text>
        </motion.g>

        {/* Center info */}
        <g style={{ transform: "scaleY(-1)", transformOrigin: "center" }}>
          <text
            x="200"
            y="190"
            textAnchor="middle"
            fill="#3b82f6"
            fontSize="16"
            fontWeight="bold"
          >
            Team 1: Lap {team1Laps}/3
          </text>
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill="#f97316"
            fontSize="16"
            fontWeight="bold"
          >
            Team 2: Lap {team2Laps}/3
          </text>
        </g>
      </svg>

      {/* Lap indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around p-4 bg-gradient-to-t from-gray-900/90 to-transparent rounded-b-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {[1, 2, 3].map((lap) => (
              <div
                key={`team1-${lap}`}
                className={`w-2 h-2 rounded-full ${
                  lap <= team1Laps ? "bg-blue-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-blue-400 font-semibold">🔵 Team 1</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {[1, 2, 3].map((lap) => (
              <div
                key={`team2-${lap}`}
                className={`w-2 h-2 rounded-full ${
                  lap <= team2Laps ? "bg-orange-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-orange-400 font-semibold">🟠 Team 2</p>
        </div>
      </div>
    </div>
  );
}

