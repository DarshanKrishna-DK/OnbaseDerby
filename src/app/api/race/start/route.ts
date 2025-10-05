import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raceId } = body;

    if (typeof raceId !== "number") {
      return NextResponse.json(
        { error: "Race ID required" },
        { status: 400 }
      );
    }

    // Start the race
    RaceStateManager.startRace(raceId);
    const race = RaceStateManager.getRace(raceId);

    return NextResponse.json({
      success: true,
      race,
    });
  } catch (error) {
    console.error("Error starting race:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

