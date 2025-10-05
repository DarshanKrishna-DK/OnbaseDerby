import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";

export async function POST(
  request: NextRequest,
  { params }: { params: { raceId: string } }
) {
  try {
    const raceId = parseInt(params.raceId);
    const body = await request.json();
    const { playerAddress } = body;

    if (!playerAddress) {
      return NextResponse.json(
        { error: "Player address required" },
        { status: 400 }
      );
    }

    // Record the tap
    const updatedRace = RaceStateManager.recordTap(raceId, playerAddress);

    if (!updatedRace) {
      return NextResponse.json(
        { error: "Race not found or not started" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      race: updatedRace,
    });
  } catch (error) {
    console.error("Error recording tap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

