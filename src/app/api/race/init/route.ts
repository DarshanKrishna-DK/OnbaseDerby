import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state-singleton";
import { Team } from "~/lib/contracts/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raceId, players } = body;

    console.log("📥 Race init request:", { raceId, players: players?.length });

    if (raceId === null || raceId === undefined) {
      return NextResponse.json(
        { error: "Race ID required" },
        { status: 400 }
      );
    }

    // Check if race already exists
    const existingRace = RaceStateManager.getRace(raceId);
    if (existingRace) {
      console.log(`✅ Race ${raceId} already exists, returning existing state`);
      return NextResponse.json({
        success: true,
        race: existingRace,
      });
    }

    // Initialize race
    console.log(`🆕 Creating new race ${raceId}`);
    const race = RaceStateManager.initRace(raceId);

    // Add players if provided
    if (players && Array.isArray(players)) {
      players.forEach((player: { address: string; team: Team }) => {
        RaceStateManager.addPlayer(raceId, player.address, player.team);
      });
    }

    const updatedRace = RaceStateManager.getRace(raceId);
    console.log(`✅ Race ${raceId} initialized with ${Object.keys(updatedRace?.players || {}).length} players`);

    return NextResponse.json({
      success: true,
      race: updatedRace,
    });
  } catch (error) {
    console.error("❌ Error initializing race:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

