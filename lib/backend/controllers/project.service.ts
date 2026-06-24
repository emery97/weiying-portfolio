import { getNotionClient, getNotionConfig } from "../config/notion";
import { Project, fallbackProjects } from "../models/project.model";
import { isNotionQueryResponse, transformNotionPageToProject } from "../services/notion-transformer";

export async function getProjects(): Promise<Project[]> {
    const config = getNotionConfig();
    const notion = getNotionClient();

    if (!config.token || !config.projectsDatabaseId || !notion) {
        console.error("Notion not configured", {
            hasToken: Boolean(config.token),
            hasProjectsDatabaseId: Boolean(config.projectsDatabaseId),
        });
        return fallbackProjects;
    }

    try {
        const response: unknown = await notion.dataSources.query({
            data_source_id: config.projectsDatabaseId,
        })

        if (!isNotionQueryResponse(response)) {
            return fallbackProjects;
        }

        const projects = response.results.map(transformNotionPageToProject);

        return projects.length > 0 ? projects : fallbackProjects;

    } catch (error) {
        console.error("Failed to fetch projects", error);
        return fallbackProjects;
    }
}
