import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events } from "@/db/schema/events";
import { countActiveRegistrations } from "@/modules/events/capacity";
import type { ActionResult, CompetitionMode, PriceMode } from "@/modules/events/types";

export type CompetitionInput = {
  name: string;
  priceCents: number;
  capacity: number | null;
  mode: CompetitionMode;
  teamMinSize?: number | null;
  teamNameRequired?: boolean;
  priceMode?: PriceMode;
  startTime?: Date | null;
  includedItems?: string | null;
  bibColor?: string | null;
  cashOnEvent?: boolean;
};

async function assertEventOwned(eventId: string, organizationId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) return null;
  return event;
}

export async function listCompetitions(eventId: string) {
  const db = getDb();
  return db.select().from(competitions).where(eq(competitions.eventId, eventId));
}

export async function listCompetitionsWithAvailability(eventId: string) {
  const comps = await listCompetitions(eventId);
  const db = getDb();
  return Promise.all(
    comps.map(async (competition) => {
      const used = await countActiveRegistrations(db, competition.id);
      return {
        ...competition,
        used,
        full: competition.capacity != null && used >= competition.capacity,
      };
    }),
  );
}

export async function saveCompetition(
  eventId: string,
  organizationId: string,
  input: CompetitionInput,
  competitionId?: string,
): Promise<ActionResult<{ competitionId: string }>> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };

  const name = input.name.trim();
  if (!name) return { ok: false, message: "La competencia necesita un nombre." };
  if (input.priceCents < 0) return { ok: false, message: "El precio no puede ser negativo." };
  if (input.capacity != null && input.capacity < 0) {
    return { ok: false, message: "El cupo no puede ser negativo." };
  }
  if (input.mode === "team" && (input.teamMinSize == null || input.teamMinSize < 2)) {
    return { ok: false, message: "Una competencia de equipo necesita un mínimo de al menos 2 integrantes." };
  }

  const db = getDb();
  const values = {
    name,
    priceCents: input.priceCents,
    capacity: input.capacity,
    mode: input.mode,
    teamMinSize: input.mode === "team" ? (input.teamMinSize ?? 2) : null,
    teamNameRequired: input.mode === "team" ? Boolean(input.teamNameRequired) : false,
    priceMode: input.mode === "team" ? (input.priceMode ?? "per_person") : "per_person",
    startTime: input.startTime ?? null,
    includedItems: input.includedItems ?? null,
    bibColor: input.bibColor ?? null,
    cashOnEvent: Boolean(input.cashOnEvent),
  };

  if (competitionId) {
    const [existing] = await db
      .select()
      .from(competitions)
      .where(and(eq(competitions.id, competitionId), eq(competitions.eventId, eventId)))
      .limit(1);
    if (!existing) return { ok: false, message: "No se encontró la competencia." };

    if (input.capacity != null) {
      const used = await countActiveRegistrations(db, competitionId);
      if (input.capacity < used) {
        return {
          ok: false,
          message: `El cupo no puede quedar por debajo de las ${used} inscripciones ya hechas.`,
        };
      }
    }

    await db.update(competitions).set(values).where(eq(competitions.id, competitionId));
    return { ok: true, competitionId };
  }

  const [created] = await db
    .insert(competitions)
    .values({ eventId, ...values })
    .returning({ id: competitions.id });
  if (!created) return { ok: false, message: "No se pudo guardar la competencia." };
  return { ok: true, competitionId: created.id };
}

export async function deleteCompetition(
  eventId: string,
  organizationId: string,
  competitionId: string,
): Promise<ActionResult> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };

  const db = getDb();
  const used = await countActiveRegistrations(db, competitionId);
  if (used > 0) {
    return { ok: false, message: "No se puede borrar una competencia con inscripciones." };
  }

  await db
    .delete(competitions)
    .where(and(eq(competitions.id, competitionId), eq(competitions.eventId, eventId)));
  return { ok: true };
}
