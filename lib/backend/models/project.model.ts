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
