import { fallbackProjects, getProjects } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjects();
    return Response.json({ projects });
  } catch {
    return Response.json({ projects: fallbackProjects }, { status: 200 });
  }
}
