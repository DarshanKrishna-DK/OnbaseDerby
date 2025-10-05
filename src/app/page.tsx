"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { LandingPage } from "~/components/pages/LandingPage";
import { Dashboard } from "~/components/pages/Dashboard";
import { RaceTrack } from "~/components/pages/RaceTrack";
import { WinnerPage } from "~/components/pages/WinnerPage";

export type AppPage = "landing" | "dashboard" | "race" | "winner";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [currentPage, setCurrentPage] = useState<AppPage>("landing");
  const [currentRaceId, setCurrentRaceId] = useState<number | null>(null);
  const [currentRaceAddress, setCurrentRaceAddress] = useState<`0x${string}` | null>(null);

  // Navigate to dashboard after wallet connection
  useEffect(() => {
    if (isConnected && currentPage === "landing") {
      setCurrentPage("dashboard");
    }
  }, [isConnected, currentPage]);

  // Navigate to race track
  const goToRace = (raceId: number, raceAddress: `0x${string}`) => {
    setCurrentRaceId(raceId);
    setCurrentRaceAddress(raceAddress);
    setCurrentPage("race");
  };

  // Navigate to winner page
  const goToWinner = () => {
    setCurrentPage("winner");
  };

  // Navigate back to dashboard
  const goToDashboard = () => {
    setCurrentPage("dashboard");
    setCurrentRaceId(null);
    setCurrentRaceAddress(null);
  };

  return (
    <main className="min-h-screen">
      {currentPage === "landing" && <LandingPage />}
      
      {currentPage === "dashboard" && (
        <Dashboard
          address={address}
          onRaceSelect={goToRace}
        />
      )}
      
      {currentPage === "race" && currentRaceId !== null && currentRaceAddress && (
        <RaceTrack
          raceId={currentRaceId}
          raceAddress={currentRaceAddress}
          playerAddress={address}
          onRaceEnd={goToWinner}
          onBack={goToDashboard}
        />
      )}
      
      {currentPage === "winner" && currentRaceId !== null && currentRaceAddress && (
        <WinnerPage
          raceId={currentRaceId}
          raceAddress={currentRaceAddress}
          playerAddress={address}
          onBackToDashboard={goToDashboard}
        />
      )}
    </main>
  );
}
