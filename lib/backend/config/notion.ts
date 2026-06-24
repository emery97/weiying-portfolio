import { Client } from "@notionhq/client";

export function getNotionConfig() {
  const token = process.env.NOTION_KEY?.trim();
  const projectsDatabaseId = process.env.NOTION_PROJECTS_DB_ID?.trim();
  const journeyDatabaseId = process.env.NOTION_JOURNEY_DB_ID?.trim();
  return {
    token,
    projectsDatabaseId,
    journeyDatabaseId,
    isConfigured: Boolean(token && projectsDatabaseId),
  };
}

export function getNotionClient(): Client | null {
  const { token } = getNotionConfig();
  return token ? new Client({ auth: token }) : null;
}
