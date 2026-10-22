import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations } from "@/db/schema/events";
import { persistRegistrationAddOns } from "@/modules/events/add-ons";
import { assignBib } from "@/modules/events/bib";
import { capacityAvailable, countActiveRegistrations } from "@/modules/events/capacity";
import { registrationIsOpen } from "@/modules/events/crud";
import { listFormFields, validateCustomAnswers } from "@/modules/events/form";
import type { ActionResult, DocumentType, ParticipantInput } from "@/modules/events/types";

const DOCUMENT_TYPES: DocumentType[] = ["ine", "curp", "rfc", "other"];

export function parseParticipant(raw: ParticipantInput): ActionResult<ParticipantInput> {
  const email = raw.email.trim().toLowerCase();
  const firstName = raw.firstName.trim();
  const lastName = raw.lastName.trim();
  const documentNumber = raw.documentNumber.trim();
  const documentType = raw.documentType;
  const birthDate = raw.birthDate;

  if (!email || !email.includes("@")) return { ok: false, message: "El correo no es válido." };
  if (!firstName) return { ok: false, message: "Falta el nombre." };
  if (!lastName) return { ok: false, message: "Falta el apellido." };
  if (!documentNumber) return { ok: false, message: "Falta el número de documento." };
  if (!DOCUMENT_TYPES.includes(documentType)) {
    return { ok: false, message: "Tipo de documento no válido." };
  }
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return { ok: false, message: "La fecha de nacimiento no es válida." };

  return {
    ok: true,
    email,
    firstName,
    lastName,
    birthDate,
    documentType,
    documentNumber,
    answers: raw.answers ?? {},
  };
}

export type RegisterInput = {
  eventId: string;
  competitionId: string;
  participant: ParticipantInput;
  acceptedTerms: boolean;
  acceptedWaiver: boolean;
  addOnSelections?: Array<{ addOnId: string; option?: string }>;
  teamId?: string | null;
};

export async function registerParticipant(
  input: RegisterInput,
): Promise<ActionResult<{ registrationId: string; status: string; bib: string | null }>> {
  if (!input.acceptedTerms || !input.acceptedWaiver) {
    return { ok: false, message: "Debes aceptar los términos y la renuncia de responsabilidad." };
  }

  const participant = parseParticipant(input.participant);
  if (!participant.ok) return participant;

  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
  if (!event) return { ok: false, message: "No se encontró el evento." };
  if (!registrationIsOpen(event)) {
    return { ok: false, message: "La inscripción de este evento está cerrada." };
  }

  const answersCheck = await validateCustomAnswers({
    eventId: input.eventId,
    competitionId: input.competitionId,
    answers: participant.answers ?? {},
  });
  if (!answersCheck.ok) return answersCheck;

  try {
    const created = await db.transaction(async (tx) => {
      await tx.execute(sql`select id from "competition" where id = ${input.competitionId} for update`);

      const [competition] = await tx
        .select()
        .from(competitions)
        .where(and(eq(competitions.id, input.competitionId), eq(competitions.eventId, input.eventId)))
        .limit(1);
      if (!competition) throw new Error("NO_COMPETITION");

      const used = await countActiveRegistrations(tx, competition.id);
      if (!capacityAvailable(competition.capacity, used)) {
        throw new Error("FULL");
      }

      const status = event.isFree || competition.priceCents === 0 ? "confirmed" : "pending_payment";
      const now = new Date();
      const [row] = await tx
        .insert(registrations)
        .values({
          competitionId: competition.id,
          teamId: input.teamId ?? null,
          email: participant.email,
          firstName: participant.firstName,
          lastName: participant.lastName,
          birthDate: new Date(`${participant.birthDate}T12:00:00`),
          documentType: participant.documentType,
          documentNumber: participant.documentNumber,
          status,
          origin: "public",
          answers: answersCheck.answers,
          acceptedTermsAt: now,
          acceptedWaiverAt: now,
        })
        .returning({ id: registrations.id, status: registrations.status });

      if (!row) throw new Error("INSERT_FAILED");
      return { registrationId: row.id, status: row.status, competition };
    });

    const addOnsResult = await persistRegistrationAddOns({
      registrationId: created.registrationId,
      competitionId: input.competitionId,
      eventId: input.eventId,
      selections: input.addOnSelections ?? [],
    });
    if (!addOnsResult.ok) {
      await db
        .update(registrations)
        .set({ status: "cancelled" })
        .where(eq(registrations.id, created.registrationId));
      return addOnsResult;
    }

    let bib: string | null = null;
    if (created.status === "confirmed" && event.autoAssignBib) {
      const assigned = await assignBib(created.registrationId);
      if (assigned.ok) bib = assigned.bib;
    }

    return { ok: true, registrationId: created.registrationId, status: created.status, bib };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FULL") return { ok: false, message: "Esta competencia ya no tiene cupo." };
    if (message === "NO_COMPETITION") return { ok: false, message: "No se encontró la competencia." };
    return { ok: false, message: "No se pudo consultar el cupo. Intenta de nuevo." };
  }
}

export async function listEventRegistrations(eventId: string, organizationId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) return [];

  const comps = await db.select().from(competitions).where(eq(competitions.eventId, eventId));
  if (comps.length === 0) return [];
  const byId = new Map(comps.map((c) => [c.id, c]));

  const rows = await db
    .select()
    .from(registrations)
    .where(and(inArray(registrations.competitionId, comps.map((c) => c.id)), ne(registrations.status, "cancelled")));

  return rows.map((row) => ({
    ...row,
    competitionName: byId.get(row.competitionId)?.name ?? "",
  }));
}

/** Exportado para pruebas de cupo sin UI. */
export async function tryReserveSlot(
  competitionId: string,
): Promise<{ ok: true; used: number } | { ok: false; reason: "full" | "missing" }> {
  const db = getDb();
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select id from "competition" where id = ${competitionId} for update`);
      const [competition] = await tx
        .select()
        .from(competitions)
        .where(eq(competitions.id, competitionId))
        .limit(1);
      if (!competition) return { ok: false as const, reason: "missing" as const };
      const used = await countActiveRegistrations(tx, competitionId);
      if (!capacityAvailable(competition.capacity, used)) {
        return { ok: false as const, reason: "full" as const };
      }
      return { ok: true as const, used };
    });
  } catch {
    return { ok: false, reason: "missing" };
  }
}

export { listFormFields };
