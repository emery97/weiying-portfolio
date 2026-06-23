import { Client } from "@notionhq/client";

export type Project = {
  id: string;
  title: string;       // Maps to "Name" or "Title"
  description: string; // Maps to "Description"
  techStack: string[]; // Maps to "Tech Stack" (string array)
  imageUrl: string;    // Maps to "Image" or "Image URL"
  githubLink: string;  // Maps to "Github Link"
  demoLink?: string;   // Maps to "Demo Link"
};

export const fallbackProjects: Project[] = [
  {
    id: "ocli",
    title: "OCLI — Ocular Cognitive Load",
    description: "Webcam-based BCI workload detection",
    techStack: ["AI / ML", "Python", "FastAPI", "OpenCV"],
    imageUrl: "/images/ocli.png",
    githubLink: "https://github.com/emery97/ocli",
    demoLink: "https://ocli.dev",
  },
  {
    id: "linked",
    title: "Linked — Browser Extension",
    description: "Swipe-based job discovery w/ AI",
    techStack: ["HACKATHON", "React", "Chrome Extension", "Gemini API"],
    imageUrl: "/images/linked.png",
    githubLink: "https://github.com/emery97/linked",
    demoLink: "https://linked-extension.com",
  },
  {
    id: "lac",
    title: "Little Acts Collective",
    description: "Peer-led volunteer initiative, SG",
    techStack: ["SOCIAL GOOD", "Next.js", "TailwindCSS", "Notion API"],
    imageUrl: "/images/lac.png",
    githubLink: "https://github.com/emery97/lac",
  },
  {
    id: "til-ai",
    title: "TIL-AI NLP Challenge",
    description: "Pure retrieval RAG, QA score 0.898",
    techStack: ["COMPETITION", "Python", "RAG", "NLP"],
    imageUrl: "",
    githubLink: "https://github.com/emery97/til-ai",
  },
];

function getNotionConfig() {
  const token = process.env.NOTION_KEY?.trim();
  const projectsDatabaseId = process.env.NOTION_PROJECTS_DB_ID?.trim();
  console.log(`projectsDatabaseID: ${projectsDatabaseId}`)
  return {
    token,
    projectsDatabaseId,
    isConfigured: Boolean(token && projectsDatabaseId),
  };
}

function getNotionClient(): Client | null {
  const { token } = getNotionConfig();
  return token ? new Client({ auth: token }) : null;
}

type RichTextPart = {
  plain_text?: string;
};

type NotionProperty = {
  type?: string;
  title?: RichTextPart[];
  rich_text?: RichTextPart[];
  select?: { name?: string } | null;
  multi_select?: { name?: string }[] | null;
  url?: string | null;
  number?: number | null;
  created_time?: string | null;
  files?: {
    name: string;
    type: string;
    file?: { url: string };
    external?: { url: string };
  }[] | null;
};

// Helper function to get notion property
function notionProperty(property: unknown): NotionProperty | null {
  if (typeof property !== "object" || !property) {
    return null;
  }

  return property as NotionProperty;
}

// Helper function to get raw unformatted strings from NotionProperty structures
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

function multiSelectValues(property: unknown): string[] {
  const propertyValue = notionProperty(property);
  if (!propertyValue) return [];

  if (propertyValue.type === "multi_select" && Array.isArray(propertyValue.multi_select)) {
    return propertyValue.multi_select.map((part) => part.name ?? "").filter(Boolean);
  }

  if (propertyValue.type === "select" && propertyValue.select?.name) {
    return [propertyValue.select.name];
  }

  if (propertyValue.type === "rich_text") {
    const text = plainText(property);
    return text ? text.split(",").map((t) => t.trim()).filter(Boolean) : [];
  }

  return [];
}

function imageUrlValue(property: unknown): string {
  const propertyValue = notionProperty(property);
  if (!propertyValue) return "";

  if (propertyValue.type === "files" && Array.isArray(propertyValue.files) && propertyValue.files.length > 0) {
    const file = propertyValue.files[0];
    if (file.type === "file" && file.file) {
      return file.file.url;
    }
    if (file.type === "external" && file.external) {
      return file.external.url;
    }
  }

  if (propertyValue.type === "url") {
    return propertyValue.url ?? "";
  }

  return plainText(property);
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

type NotionQueryResponse = {
  results: unknown[];
};

function isNotionQueryResponse(response: unknown): response is NotionQueryResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "results" in response &&
    Array.isArray(response.results)
  );
}

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
    });

    if (!isNotionQueryResponse(response)) {
      return fallbackProjects;
    }

    const projects = response.results.map((page) => {
      const properties = pageProperties(page);

      // Extract properties with check for multiple likely names
      const titleProp = properties.Name ?? properties.Title ?? properties.title;
      const descProp = properties.Description ?? properties.description;
      const techStackProp = properties.techStack ?? properties["Tech Stack"] ?? properties.TechStack;
      const imageProp = properties.Image ?? properties["Image URL"] ?? properties.imageUrl ?? properties.image;
      const githubProp = properties["Github Link"] ?? properties.githubLink ?? properties.GithubLink ?? properties.GitHub ?? properties.github;
      const demoProp = properties["Demo Link"] ?? properties.demoLink ?? properties.DemoLink ?? properties.LinkURL ?? properties["Link URL"] ?? properties.linkUrl ?? properties.demo;

      const techStack = multiSelectValues(techStackProp);

      return {
        id: pageId(page),
        title: plainText(titleProp) || "Untitled Project",
        description: plainText(descProp) || "",
        techStack: techStack,
        imageUrl: imageUrlValue(imageProp) || "",
        githubLink: plainText(githubProp) || "",
        demoLink: plainText(demoProp) || undefined,
      };
    });

    return projects.length > 0 ? projects : fallbackProjects;
  } catch (error) {
    console.error("Error fetching projects from Notion:", error);
    return fallbackProjects;
  }
}
