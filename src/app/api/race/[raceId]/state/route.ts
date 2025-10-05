import { NextRequest, NextResponse } from "next/server";
import { RaceStateManager } from "~/lib/race-state";

// Force this API route to use Edge Runtime (shares memory)
export const runtime = "edge";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ raceId: string }> }
) {
  try {
    const params = await context.params;
    const raceId = parseInt(params.raceId);
    const race = RaceStateManager.getRace(raceId);

    if (!race) {
      return NextResponse.json(
        { error: `Race ${raceId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      race,
    });
  } catch (error) {
    console.error("❌ Error fetching race state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
