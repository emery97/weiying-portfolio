import { Project } from "../models/project.model";

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

export type NotionQueryResponse = {
    results: unknown[];
};

// Helper function to get notion property
function notionProperty(property: unknown): NotionProperty | null {
    if (typeof property !== "object" || !property) {
        return null;
    }
    return property as NotionProperty;
}

export function isNotionQueryResponse(response: any): response is NotionQueryResponse {
    return Array.isArray(response.results);
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

export function transformNotionPageToProject(page: any): Project {
    const properties = page?.properties || {};

    const titleProp = properties.title;
    const descProp = properties.description;
    const techStackProp = properties.techStack;
    const imageProp = properties.imageUrl;
    const githubProp = properties.githubLink;
    const demoProp = properties.demoLink;

    return {
        id: page?.id || crypto.randomUUID(),
        title: plainText(titleProp) || "Untitled Project",
        description: plainText(descProp) || "",
        techStack: multiSelectValues(techStackProp),
        imageUrl: imageUrlValue(imageProp) || "",
        githubLink: plainText(githubProp) || "",
        demoLink: plainText(demoProp) || undefined,
    }
}
