import { getNotionClient, getNotionConfig } from "../config/notion";
import { Journey, fallbackJourney } from "../models/journey.model";
import { isNotionQueryResponse, transformNotionPageToJourney } from "../services/notion-transformer";

export async function getJourneys(): Promise<Journey[]> {
    const notion = getNotionClient();
    const config = getNotionConfig();

    if (!config.token || !config.journeyDatabaseId || !notion) {
        console.error("Notion not configured", {
            hasToken: Boolean(config.token),
            hasJourneyDatabaseId: Boolean(config.journeyDatabaseId),
        });
        return fallbackJourney;
    }

    try {
        const response: unknown = await notion.dataSources.query({
            data_source_id: config.journeyDatabaseId,
        })

        if (!isNotionQueryResponse(response)) {
            return fallbackJourney;
        }

        const journeys = response.results.map(transformNotionPageToJourney);

        return journeys.length > 0 ? journeys : fallbackJourney;

    } catch (error) {
        console.error("Failed to fetch journeys", error);
        return fallbackJourney;
    }
}
