import {
  createGuestbookEntry,
  getGuestbookEntries,
} from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await getGuestbookEntries();
    return Response.json({ entries });
  } catch {
    return Response.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      message?: string;
    };
    const name = body.name?.trim().slice(0, 80);
    const message = body.message?.trim().slice(0, 500);

    if (!name || !message) {
      return Response.json({ error: "Missing name or message" }, { status: 400 });
    }

    const entry = await createGuestbookEntry(name, message);
    return Response.json({ entry });
  } catch {
    return Response.json({ error: "Unable to save entry" }, { status: 500 });
  }
}
