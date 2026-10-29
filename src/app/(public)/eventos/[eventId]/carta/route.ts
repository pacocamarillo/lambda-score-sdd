import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions } from "@/db/schema/events";
import { getPublicEvent } from "@/modules/events/crud";
import {
  clip,
  formatBirthInput,
  formatDateTime,
  genderLabel,
  waiverDataFromRegistration,
} from "@/modules/events/waiver-data";
import { buildWaiverLines, buildWaiverPdf, type WaiverData } from "@/modules/events/waiver-pdf";

export async function GET(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const event = await getPublicEvent(eventId);
  if (!event) return new Response("No se encontró el evento.", { status: 404 });

  const url = new URL(request.url);
  const registrationId = url.searchParams.get("registrationId");
  const data = registrationId
    ? await waiverDataFromRegistration(eventId, registrationId, event)
    : await waiverFromQuery(eventId, url.searchParams, event);

  if (!data) return new Response("No se encontró la inscripción.", { status: 404 });

  const pdf = buildWaiverPdf(buildWaiverLines(data));
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="carta-exoneracion.pdf"',
      "Cache-Control": "no-store",
    },
  });
}

async function waiverFromQuery(
  eventId: string,
  params: URLSearchParams,
  event: { name: string; eventDate: Date; venue: string },
): Promise<WaiverData> {
  const competitionId = clip(params.get("competitionId") ?? "");
  let competitionName = "";
  if (competitionId) {
    const db = getDb();
    const [competition] = await db
      .select()
      .from(competitions)
      .where(and(eq(competitions.id, competitionId), eq(competitions.eventId, eventId)))
      .limit(1);
    competitionName = competition?.name ?? "";
  }

  return {
    eventName: event.name,
    eventDate: formatDateTime(event.eventDate),
    venue: event.venue,
    competitionName,
    firstName: clip(params.get("firstName") ?? ""),
    lastName: clip(params.get("lastName") ?? ""),
    gender: genderLabel(clip(params.get("gender") ?? "")),
    birthDate: formatBirthInput(clip(params.get("birthDate") ?? "")),
    email: clip(params.get("email") ?? ""),
    category: clip(params.get("category") ?? ""),
    issuedAt: formatDateTime(new Date()),
  };
}
