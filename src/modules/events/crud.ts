import { and, desc, eq, gte, ilike, lte, ne, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations } from "@/db/schema/events";
import type { ActionResult, BibScope, EventStatus } from "@/modules/events/types";

export type EventListFilters = {
  q?: string;
  status?: EventStatus | "all";
  from?: string;
  to?: string;
};

export type EventWritable = {
  name: string;
  eventDate: Date;
  venue: string;
  description?: string;
  noticeHtml?: string | null;
  registrationDeadline?: Date | null;
  isFree?: boolean;
  bibScope?: BibScope;
  bibStart?: number;
  bibPrefix?: string;
  autoAssignBib?: boolean;
  showBibOnConfirmation?: boolean;
};

export async function createEvent(
  organizationId: string,
  input: EventWritable,
): Promise<ActionResult<{ eventId: string }>> {
  const name = input.name.trim();
  const venue = input.venue.trim();
  if (!name) return { ok: false, message: "El evento necesita un nombre." };
  if (!venue) return { ok: false, message: "El evento necesita un lugar." };
  if (Number.isNaN(input.eventDate.getTime())) {
    return { ok: false, message: "La fecha del evento no es válida." };
  }

  const db = getDb();
  const [created] = await db
    .insert(events)
    .values({
      organizationId,
      name,
      venue,
      eventDate: input.eventDate,
      description: input.description?.trim() ?? "",
      noticeHtml: input.noticeHtml ?? null,
      registrationDeadline: input.registrationDeadline ?? null,
      isFree: Boolean(input.isFree),
      bibScope: input.bibScope ?? "competition",
      bibStart: input.bibStart ?? 1,
      bibPrefix: input.bibPrefix ?? "",
      autoAssignBib: input.autoAssignBib ?? true,
      showBibOnConfirmation: input.showBibOnConfirmation ?? true,
      status: "draft",
      registrationOpen: false,
    })
    .returning({ id: events.id });

  if (!created) return { ok: false, message: "No se pudo crear el evento." };
  return { ok: true, eventId: created.id };
}

export async function updateEvent(
  eventId: string,
  organizationId: string,
  input: EventWritable,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const name = input.name.trim();
  const venue = input.venue.trim();
  if (!name) return { ok: false, message: "El evento necesita un nombre." };
  if (!venue) return { ok: false, message: "El evento necesita un lugar." };
  if (Number.isNaN(input.eventDate.getTime())) {
    return { ok: false, message: "La fecha del evento no es válida." };
  }

  await db
    .update(events)
    .set({
      name,
      venue,
      eventDate: input.eventDate,
      description: input.description?.trim() ?? "",
      noticeHtml: input.noticeHtml ?? null,
      registrationDeadline: input.registrationDeadline ?? null,
      isFree: Boolean(input.isFree),
      bibScope: input.bibScope ?? event.bibScope,
      bibStart: input.bibStart ?? event.bibStart,
      bibPrefix: input.bibPrefix ?? event.bibPrefix,
      autoAssignBib: input.autoAssignBib ?? event.autoAssignBib,
      showBibOnConfirmation: input.showBibOnConfirmation ?? event.showBibOnConfirmation,
    })
    .where(eq(events.id, eventId));

  return { ok: true };
}

export async function getOwnedEvent(eventId: string, organizationId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) return null;
  return event;
}

export async function getPublicEvent(eventId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.status !== "published") return null;
  return event;
}

export async function listOrganizationEvents(organizationId: string, filters: EventListFilters = {}) {
  const db = getDb();
  const conditions = [eq(events.organizationId, organizationId)];
  if (filters.q?.trim()) conditions.push(ilike(events.name, `%${filters.q.trim()}%`));
  if (filters.status && filters.status !== "all") conditions.push(eq(events.status, filters.status));
  if (filters.from) {
    const from = new Date(`${filters.from}T00:00:00`);
    if (!Number.isNaN(from.getTime())) conditions.push(gte(events.eventDate, from));
  }
  if (filters.to) {
    const to = new Date(`${filters.to}T23:59:59`);
    if (!Number.isNaN(to.getTime())) conditions.push(lte(events.eventDate, to));
  }

  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      venue: events.venue,
      eventDate: events.eventDate,
      status: events.status,
      registrationOpen: events.registrationOpen,
      registrationCount: sql<number>`(
        select count(*)::int from "registration" r
        inner join "competition" c on c.id = r.competition_id
        where c.event_id = "event"."id" and r.status <> 'cancelled'
      )`.mapWith(Number),
    })
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.eventDate));

  return rows;
}

export async function deleteEvent(
  eventId: string,
  organizationId: string,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const comps = await db.select({ id: competitions.id }).from(competitions).where(eq(competitions.eventId, eventId));
  if (comps.length > 0) {
    const ids = comps.map((c) => c.id);
    for (const competitionId of ids) {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(registrations)
        .where(and(eq(registrations.competitionId, competitionId), ne(registrations.status, "cancelled")));
      if ((row?.count ?? 0) > 0) {
        return {
          ok: false,
          message: "No se puede eliminar un evento con inscripciones. Cancélalo en su lugar.",
        };
      }
    }
  }

  await db.delete(events).where(eq(events.id, eventId));
  return { ok: true };
}

export function registrationIsOpen(event: {
  status: string;
  registrationOpen: boolean;
  registrationDeadline: Date | null;
  now?: Date;
}): boolean {
  if (event.status !== "published" || !event.registrationOpen) return false;
  const now = event.now ?? new Date();
  if (event.registrationDeadline && now > event.registrationDeadline) return false;
  return true;
}
