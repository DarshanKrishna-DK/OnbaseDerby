import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";
import { Team } from "~/lib/contracts/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raceId, players } = body;

    if (typeof raceId !== "number") {
      return NextResponse.json(
        { error: "Race ID required" },
        { status: 400 }
      );
    }

    // Initialize race
    const race = RaceStateManager.initRace(raceId);

    // Add players if provided
    if (players && Array.isArray(players)) {
      players.forEach((player: { address: string; team: Team }) => {
        RaceStateManager.addPlayer(raceId, player.address, player.team);
      });
    }

    return NextResponse.json({
      success: true,
      race,
    });
  } catch (error) {
    console.error("Error initializing race:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

