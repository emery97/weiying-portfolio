import { Journey } from "../models/journey.model";
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
    date?: {
        start?: string | null;
        end?: string | null;
        time_zone?: string | null;
    } | null;
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

type NotionPage = {
    id?: string;
    properties?: Record<string, unknown>;
};

// Helper function to get notion property
function notionProperty(property: unknown): NotionProperty | null {
    if (typeof property !== "object" || !property) {
        return null;
    }
    return property as NotionProperty;
}

function notionPage(page: unknown): NotionPage {
    if (typeof page !== "object" || !page) {
        return {};
    }
    return page as NotionPage;
}

export function isNotionQueryResponse(response: unknown): response is NotionQueryResponse {
    return (
        typeof response === "object" &&
        response !== null &&
        Array.isArray((response as NotionQueryResponse).results)
    );
}

/**
 * 
 * Helper functions to convert Notion property to TypeScript types
 */
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

function dateValue(property: unknown): Date {
    const propertyValue = notionProperty(property);
    if (!propertyValue) return new Date();

    if (propertyValue.type === "date" && propertyValue.date?.start) {
        return new Date(propertyValue.date.start);
    }

    if (propertyValue.type === "created_time" && propertyValue.created_time) {
        return new Date(propertyValue.created_time);
    }

    return new Date();
}

/**
 * Transforms a Notion page to respective objects.
 */
export function transformNotionPageToProject(page: unknown): Project {
    const notionPageValue = notionPage(page);
    const properties = notionPageValue.properties || {};

    const titleProp = properties.title;
    const descProp = properties.description;
    const techStackProp = properties.techStack;
    const imageProp = properties.imageUrl;
    const githubProp = properties.githubLink;
    const demoProp = properties.demoLink;

    return {
        id: notionPageValue.id || crypto.randomUUID(),
        title: plainText(titleProp) || "Untitled Project",
        description: plainText(descProp) || "",
        techStack: multiSelectValues(techStackProp),
        imageUrl: imageUrlValue(imageProp) || "",
        githubLink: plainText(githubProp) || "",
        demoLink: plainText(demoProp) || undefined,
    }
}


export function transformNotionPageToJourney(page: unknown): Journey {
    const notionPageValue = notionPage(page);
    const properties = notionPageValue.properties || {};

    const titleProp = properties.title;
    const startDateProp = properties.startDate;
    const endDateProp = properties.endDate;
    const locationProp = properties.location;
    const descProp = properties.description;
    const tagProp = properties.tag;

    return {
        id: notionPageValue.id || crypto.randomUUID(),
        title: plainText(titleProp) || "Untitled Project",
        description: plainText(descProp) || "",
        startDate: dateValue(startDateProp) || "",
        endDate: dateValue(endDateProp) || "",
        location: plainText(locationProp) || "",
        tag: plainText(tagProp) || "",
    }
}
