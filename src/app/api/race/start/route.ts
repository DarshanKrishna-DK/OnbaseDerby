import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raceId } = body;

    console.log("🏁 Start race request for raceId:", raceId);

    if (raceId === null || raceId === undefined) {
      return NextResponse.json(
        { error: "Race ID required" },
        { status: 400 }
      );
    }

    // Check if race exists
    const existingRace = RaceStateManager.getRace(raceId);
    if (!existingRace) {
      console.error(`❌ Race ${raceId} not found in backend!`);
      return NextResponse.json(
        { error: `Race ${raceId} not found` },
        { status: 404 }
      );
    }

    // Start the race
    console.log(`✅ Starting race ${raceId}`);
    RaceStateManager.startRace(raceId);
    const race = RaceStateManager.getRace(raceId);

    return NextResponse.json({
      success: true,
      race,
    });
  } catch (error) {
    console.error("❌ Error starting race:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

