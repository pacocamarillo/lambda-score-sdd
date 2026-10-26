import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, formFields, registrations } from "@/db/schema/events";
import { isCategoryFormField } from "@/modules/events/category-eligibility";
import { getPublicEvent } from "@/modules/events/crud";
import { buildWaiverLines, buildWaiverPdf, type WaiverData } from "@/modules/events/waiver-pdf";

export async function GET(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const event = await getPublicEvent(eventId);
  if (!event) return new Response("No se encontró el evento.", { status: 404 });

  const url = new URL(request.url);
  const data = url.searchParams.get("registrationId")
    ? await waiverFromRegistration(eventId, url.searchParams.get("registrationId") ?? "", event)
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

async function waiverFromRegistration(
  eventId: string,
  registrationId: string,
  event: { name: string; eventDate: Date; venue: string },
): Promise<WaiverData | null> {
  const db = getDb();
  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  if (!registration) return null;

  const [competition] = await db
    .select()
    .from(competitions)
    .where(and(eq(competitions.id, registration.competitionId), eq(competitions.eventId, eventId)))
    .limit(1);
  if (!competition) return null;

  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  const answers = registration.answers ?? {};
  const category = fields
    .filter((field) => isCategoryFormField(field))
    .map((field) => String(answers[field.id] ?? "").trim())
    .filter(Boolean)
    .join(", ");
  const gender = genderLabel(String(answers._gender ?? ""));

  return {
    eventName: event.name,
    eventDate: formatDateTime(event.eventDate),
    venue: event.venue,
    competitionName: competition.name,
    firstName: registration.firstName,
    lastName: registration.lastName,
    gender,
    birthDate: formatDate(registration.birthDate),
    email: registration.email,
    category,
    issuedAt: formatDateTime(new Date()),
  };
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

function genderLabel(value: string): string {
  if (value === "male" || value === "varonil") return "Varonil";
  if (value === "female" || value === "femenil") return "Femenil";
  return value;
}

function formatDateTime(value: Date): string {
  return value.toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "long", timeStyle: "short" });
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "long" });
}

function formatBirthInput(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return formatDate(date);
}

function clip(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, 180);
}
