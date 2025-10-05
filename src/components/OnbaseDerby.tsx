"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { HomePage } from "~/components/derby/HomePage";
import { RaceLobby } from "~/components/derby/RaceLobby";
import { RaceGame } from "~/components/derby/RaceGame";
import { VictoryScreen } from "~/components/derby/VictoryScreen";
import { RaceState } from "~/lib/contracts/types";

export type DerbyView = "home" | "lobby" | "race" | "victory";

export default function OnbaseDerby() {
  const { isSDKLoaded, context } = useMiniApp();
  const { address, isConnected } = useAccount();

  const [currentView, setCurrentView] = useState<DerbyView>("home");
  const [currentRaceId, setCurrentRaceId] = useState<number | null>(null);
  const [currentRaceAddress, setCurrentRaceAddress] = useState<`0x${string}` | null>(null);

  // Navigate between views
  const navigateToLobby = (raceId: number, raceAddress: `0x${string}`) => {
    setCurrentRaceId(raceId);
    setCurrentRaceAddress(raceAddress);
    setCurrentView("lobby");
  };

  const navigateToRace = () => {
    setCurrentView("race");
  };

  const navigateToVictory = () => {
    setCurrentView("victory");
  };

  const navigateToHome = () => {
    setCurrentView("home");
    setCurrentRaceId(null);
    setCurrentRaceAddress(null);
  };

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-background"
    >
      <div className="mx-auto pb-20">
        <Header />

        {currentView === "home" && (
          <HomePage
            isConnected={isConnected}
            address={address}
            onRaceJoined={navigateToLobby}
            onRaceCreated={navigateToLobby}
          />
        )}

        {currentView === "lobby" && currentRaceId !== null && currentRaceAddress && (
          <RaceLobby
            raceId={currentRaceId}
            raceAddress={currentRaceAddress}
            onRaceStarted={navigateToRace}
            onBack={navigateToHome}
          />
        )}

        {currentView === "race" && currentRaceId !== null && currentRaceAddress && (
          <RaceGame
            raceId={currentRaceId}
            raceAddress={currentRaceAddress}
            onRaceEnded={navigateToVictory}
          />
        )}

        {currentView === "victory" && currentRaceId !== null && currentRaceAddress && (
          <VictoryScreen
            raceId={currentRaceId}
            raceAddress={currentRaceAddress}
            onBackToHome={navigateToHome}
          />
        )}

        <Footer
          activeTab="home"
          setActiveTab={() => {}}
          showWallet={true}
        />
      </div>
    </div>
  );
}

