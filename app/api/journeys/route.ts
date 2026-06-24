import { getJourneys } from "@/lib/backend/controllers/journey.service";
import { fallbackJourney } from "@/lib/backend/models/journey.model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const journeys = await getJourneys();
    return Response.json({ journeys });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ journeys: fallbackJourney, error: message }, { status: 500 });
  }
}
