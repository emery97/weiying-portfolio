import { incrementVisits } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const count = await incrementVisits();
    return Response.json({ count });
  } catch {
    return Response.json({ count: 1 }, { status: 200 });
  }
}
