import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";

export async function GET(
  request: NextRequest,
  { params }: { params: { raceId: string } }
) {
  try {
    const raceId = parseInt(params.raceId);
    const race = RaceStateManager.getRace(raceId);

    if (!race) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      race,
    });
  } catch (error) {
    console.error("Error fetching race state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

