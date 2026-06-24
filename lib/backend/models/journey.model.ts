export type Journey = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    location: string;
    description: string;
    tag: string
}

export const fallbackJourney: Journey[] = [
    {
        id: "crew",
        title: "Crew",
        startDate: new Date("11/01/2020"),
        endDate: new Date("11/01/2023"),
        location: "McDonald's, Singapore",
        description: "Cross-trained across multiple store positions to ensure smooth operations. Delivered excellent customer service and effectively handled inquiries and complaints.",
        tag: "Experience"
    }
]