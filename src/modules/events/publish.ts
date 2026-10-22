import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events } from "@/db/schema/events";
import type { ActionResult } from "@/modules/events/types";

export type PublishBlockers = {
  missingName: boolean;
  missingDate: boolean;
  missingVenue: boolean;
  missingCompetition: boolean;
  competitionWithoutPrice: boolean;
};

export function describePublishBlockers(blockers: PublishBlockers): string[] {
  const messages: string[] = [];
  if (blockers.missingName) messages.push("Falta el nombre del evento.");
  if (blockers.missingDate) messages.push("Falta la fecha del evento.");
  if (blockers.missingVenue) messages.push("Falta el lugar del evento.");
  if (blockers.missingCompetition) messages.push("Se necesita al menos una competencia.");
  if (blockers.competitionWithoutPrice) {
    messages.push("Cada competencia necesita un precio (puede ser 0 en eventos gratuitos).");
  }
  return messages;
}

export async function getPublishBlockers(eventId: string): Promise<PublishBlockers> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  const comps = await db.select().from(competitions).where(eq(competitions.eventId, eventId));

  return {
    missingName: !event?.name?.trim(),
    missingDate: !event?.eventDate,
    missingVenue: !event?.venue?.trim(),
    missingCompetition: comps.length === 0,
    competitionWithoutPrice: comps.some((c) => c.priceCents == null || c.priceCents < 0),
  };
}

export function canPublish(blockers: PublishBlockers): boolean {
  return !Object.values(blockers).some(Boolean);
}

export async function publishEvent(
  eventId: string,
  organizationId: string,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }
  if (event.status === "cancelled") {
    return { ok: false, message: "Un evento cancelado no se puede publicar." };
  }

  const blockers = await getPublishBlockers(eventId);
  if (!canPublish(blockers)) {
    return { ok: false, message: describePublishBlockers(blockers).join(" ") };
  }

  await db.update(events).set({ status: "published" }).where(eq(events.id, eventId));
  return { ok: true };
}

export async function cancelEvent(
  eventId: string,
  organizationId: string,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }
  await db
    .update(events)
    .set({ status: "cancelled", registrationOpen: false })
    .where(eq(events.id, eventId));
  return { ok: true };
}

export async function setRegistrationOpen(
  eventId: string,
  organizationId: string,
  open: boolean,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }
  if (open && event.status !== "published") {
    return { ok: false, message: "Solo un evento publicado puede abrir la inscripción." };
  }
  await db.update(events).set({ registrationOpen: open }).where(eq(events.id, eventId));
  return { ok: true };
}
