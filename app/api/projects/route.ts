import { getProjects } from "@/lib/backend/controllers/project.service";
import { fallbackProjects } from "@/lib/backend/models/project.model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjects();
    return Response.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ projects: fallbackProjects, error: message }, { status: 500 });
  }
}
