import { and, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations } from "@/db/schema/events";
import type { ActionResult } from "@/modules/events/types";

function parseBibNumber(bib: string, prefix: string): number | null {
  const value = prefix && bib.startsWith(prefix) ? bib.slice(prefix.length) : bib;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

export function formatBib(prefix: string, number: number): string {
  return `${prefix}${number}`;
}

export async function nextBibNumber(input: {
  eventId: string;
  competitionId: string;
  bibScope: "event" | "competition";
  bibStart: number;
  bibPrefix: string;
}): Promise<number> {
  const db = getDb();
  const competitionIds =
    input.bibScope === "event"
      ? (
          await db
            .select({ id: competitions.id })
            .from(competitions)
            .where(eq(competitions.eventId, input.eventId))
        ).map((row) => row.id)
      : [input.competitionId];

  if (competitionIds.length === 0) return input.bibStart;

  const rows = await db
    .select({ bib: registrations.bib })
    .from(registrations)
    .where(and(inArray(registrations.competitionId, competitionIds), isNotNull(registrations.bib)));

  let max = input.bibStart - 1;
  for (const row of rows) {
    if (!row.bib) continue;
    const parsed = parseBibNumber(row.bib, input.bibPrefix);
    if (parsed !== null && parsed > max) max = parsed;
  }
  return max + 1;
}

/** Única escritura de folio. La llama el evento gratuito o el pago aprobado (feature 004). */
export async function assignBib(registrationId: string): Promise<ActionResult<{ bib: string }>> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [registration] = await tx
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);
    if (!registration) return { ok: false, message: "No se encontró la inscripción." };
    if (registration.bib) return { ok: true, bib: registration.bib };
    if (registration.status === "cancelled") {
      return { ok: false, message: "No se asigna folio a una inscripción cancelada." };
    }

    const [competition] = await tx
      .select()
      .from(competitions)
      .where(eq(competitions.id, registration.competitionId))
      .limit(1);
    if (!competition) return { ok: false, message: "No se encontró la competencia." };

    const [event] = await tx.select().from(events).where(eq(events.id, competition.eventId)).limit(1);
    if (!event) return { ok: false, message: "No se encontró el evento." };
    if (!event.autoAssignBib) return { ok: false, message: "La asignación automática de folio está apagada." };

    await tx.execute(sql`select id from "event" where id = ${event.id} for update`);

    const competitionIds =
      event.bibScope === "event"
        ? (
            await tx
              .select({ id: competitions.id })
              .from(competitions)
              .where(eq(competitions.eventId, event.id))
          ).map((row) => row.id)
        : [competition.id];

    const rows = await tx
      .select({ bib: registrations.bib })
      .from(registrations)
      .where(
        and(
          inArray(registrations.competitionId, competitionIds),
          isNotNull(registrations.bib),
          ne(registrations.id, registrationId),
        ),
      );

    let max = event.bibStart - 1;
    for (const row of rows) {
      if (!row.bib) continue;
      const parsed = parseBibNumber(row.bib, event.bibPrefix);
      if (parsed !== null && parsed > max) max = parsed;
    }

    const bib = formatBib(event.bibPrefix, max + 1);
    await tx.update(registrations).set({ bib }).where(eq(registrations.id, registrationId));
    return { ok: true, bib };
  });
}
