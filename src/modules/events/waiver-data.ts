import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, formFields, registrations } from "@/db/schema/events";
import { isCategoryFormField } from "@/modules/events/category-eligibility";
import type { WaiverData } from "@/modules/events/waiver-pdf";

export async function waiverDataFromRegistration(
  eventId: string,
  registrationId: string,
  event: { name: string; eventDate: Date; venue: string },
): Promise<(WaiverData & { status: string; competitionId: string }) | null> {
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

  return {
    eventName: event.name,
    eventDate: formatDateTime(event.eventDate),
    venue: event.venue,
    competitionName: competition.name,
    firstName: registration.firstName,
    lastName: registration.lastName,
    gender: genderLabel(String(answers._gender ?? "")),
    birthDate: formatDate(registration.birthDate),
    email: registration.email,
    category,
    issuedAt: formatDateTime(new Date()),
    status: registration.status,
    competitionId: competition.id,
  };
}

export function genderLabel(value: string): string {
  if (value === "male" || value === "varonil") return "Varonil";
  if (value === "female" || value === "femenil") return "Femenil";
  return value;
}

export function formatDateTime(value: Date): string {
  return value.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function formatDate(value: Date): string {
  return value.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "long" });
}

export function formatBirthInput(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return formatDate(date);
}

export function clip(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, 180);
}
