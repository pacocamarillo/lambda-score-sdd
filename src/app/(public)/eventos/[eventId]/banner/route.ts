import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { events } from "@/db/schema/events";
import { eq } from "drizzle-orm";
import { parseEventImageDataUrl } from "@/modules/events/event-image";

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event?.imageKey || event.status !== "published") {
    return new NextResponse("Not found", { status: 404 });
  }

  const embedded = parseEventImageDataUrl(event.imageKey);
  if (embedded) {
    return new NextResponse(new Uint8Array(embedded.bytes), {
      status: 200,
      headers: {
        "Content-Type": embedded.contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const relative = event.imageKey.split("?")[0] ?? "";
  if (!relative.startsWith("/uploads/events/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", relative.replace(/^\//, ""));
    const bytes = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
