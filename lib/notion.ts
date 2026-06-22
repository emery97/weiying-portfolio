import { Client } from "@notionhq/client";

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  date: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tag: string;
  imageUrl: string;
  order: number;
  linkUrl?: string;
};

export const fallbackProjects: Project[] = [
  {
    id: "ocli",
    title: "OCLI — Ocular Cognitive Load",
    description: "Webcam-based BCI workload detection",
    tag: "AI / ML",
    imageUrl: "/images/ocli.png",
    order: 1,
  },
  {
    id: "linked",
    title: "Linked — Browser Extension",
    description: "Swipe-based job discovery w/ AI",
    tag: "HACKATHON",
    imageUrl: "/images/linked.png",
    order: 2,
  },
  {
    id: "lac",
    title: "Little Acts Collective",
    description: "Peer-led volunteer initiative, SG",
    tag: "SOCIAL GOOD",
    imageUrl: "/images/lac.png",
    order: 3,
  },
  {
    id: "til-ai",
    title: "TIL-AI NLP Challenge",
    description: "Pure retrieval RAG, QA score 0.898",
    tag: "COMPETITION",
    imageUrl: "",
    order: 4,
  },
];

const notionToken = process.env.NOTION_API_KEY;

export const notion = notionToken
  ? new Client({ auth: notionToken })
  : null;

type RichTextPart = {
  plain_text?: string;
};

type NotionProperty = {
  type?: string;
  title?: RichTextPart[];
  rich_text?: RichTextPart[];
  select?: { name?: string } | null;
  url?: string | null;
  number?: number | null;
  created_time?: string | null;
};

function notionProperty(property: unknown): NotionProperty | null {
  if (typeof property !== "object" || !property) {
    return null;
  }

  return property as NotionProperty;
}

function plainText(property: unknown): string {
  const propertyValue = notionProperty(property);

  if (propertyValue?.type === "title" && Array.isArray(propertyValue.title)) {
    return propertyValue.title.map((part) => part.plain_text ?? "").join("");
  }

  if (
    propertyValue?.type === "rich_text" &&
    Array.isArray(propertyValue.rich_text)
  ) {
    return propertyValue.rich_text
      .map((part) => part.plain_text ?? "")
      .join("");
  }

  if (propertyValue?.type === "select" && propertyValue.select) {
    return propertyValue.select.name ?? "";
  }

  if (propertyValue?.type === "url") {
    return propertyValue.url ?? "";
  }

  return "";
}

function numberValue(property: unknown): number {
  const propertyValue = notionProperty(property);

  return propertyValue?.type === "number" ? (propertyValue.number ?? 0) : 0;
}

function createdTime(property: unknown): string {
  const propertyValue = notionProperty(property);

  return propertyValue?.type === "created_time"
    ? (propertyValue.created_time ?? "")
    : "";
}

function pageProperties(page: unknown): Record<string, unknown> {
  if (
    typeof page === "object" &&
    page &&
    "properties" in page &&
    typeof page.properties === "object" &&
    page.properties
  ) {
    return page.properties as Record<string, unknown>;
  }

  return {};
}

function pageId(page: unknown): string {
  if (typeof page === "object" && page && "id" in page) {
    return String(page.id);
  }

  return crypto.randomUUID();
}

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  if (!notion || !process.env.NOTION_GUESTBOOK_DB_ID) {
    return [];
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_GUESTBOOK_DB_ID,
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return response.results.map((page) => {
    const properties = pageProperties(page);

    return {
      id: pageId(page),
      name: plainText(properties.Name) || "ANON",
      message: plainText(properties.Message),
      date: createdTime(properties.Date),
    };
  });
}

export async function createGuestbookEntry(
  name: string,
  message: string,
): Promise<GuestbookEntry> {
  if (!notion || !process.env.NOTION_GUESTBOOK_DB_ID) {
    return {
      id: crypto.randomUUID(),
      name,
      message,
      date: new Date().toISOString(),
    };
  }

  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_GUESTBOOK_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Message: {
        rich_text: [{ text: { content: message } }],
      },
    },
  });

  return {
    id: pageId(page),
    name,
    message,
    date: new Date().toISOString(),
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!notion || !process.env.NOTION_PROJECTS_DB_ID) {
    return fallbackProjects;
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_PROJECTS_DB_ID,
    sorts: [{ property: "Order", direction: "ascending" }],
  });

  const projects = response.results.map((page) => {
    const properties = pageProperties(page);

    return {
      id: pageId(page),
      title: plainText(properties.Title),
      description: plainText(properties.Description),
      tag: plainText(properties.Tag),
      imageUrl: plainText(properties["Image URL"]),
      order: numberValue(properties.Order),
      linkUrl: plainText(properties["Link URL"]) || undefined,
    };
  });

  return projects.length > 0 ? projects : fallbackProjects;
}

export async function incrementVisits(): Promise<number> {
  if (!notion || !process.env.NOTION_VISITS_DB_ID) {
    return 1;
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_VISITS_DB_ID,
    page_size: 1,
  });

  const page = response.results[0];
  if (!page) {
    return 1;
  }

  const properties = pageProperties(page);
  const count = numberValue(properties.Count) + 1;

  await notion.pages.update({
    page_id: pageId(page),
    properties: {
      Count: { number: count },
    },
  });

  return count;
}
