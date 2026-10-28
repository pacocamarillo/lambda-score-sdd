import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations } from "@/db/schema/events";
import { persistRegistrationAddOns } from "@/modules/events/add-ons";
import { assignBib } from "@/modules/events/bib";
import { capacityAvailable, countActiveRegistrations } from "@/modules/events/capacity";
import { registrationIsOpen } from "@/modules/events/crud";
import { GENDER_ANSWER_KEY, parseGender } from "@/modules/events/category-eligibility";
import { fieldsForCompetition, listFormFields, validateCustomAnswers } from "@/modules/events/form";
import type { ActionResult, DocumentType, ParticipantGender, ParticipantInput } from "@/modules/events/types";

const DOCUMENT_TYPES: DocumentType[] = ["ine", "curp", "rfc", "other"];

type ParsedParticipant = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: ParticipantGender;
  documentType: DocumentType;
  documentNumber: string;
  answers: Record<string, unknown>;
};

export function parseParticipant(raw: ParticipantInput): ActionResult<ParsedParticipant> {
  const email = raw.email.trim().toLowerCase();
  const firstName = raw.firstName.trim();
  const lastName = raw.lastName.trim();
  const documentNumber = (raw.documentNumber ?? "").trim();
  const documentType: DocumentType =
    raw.documentType && DOCUMENT_TYPES.includes(raw.documentType) ? raw.documentType : "other";
  const birthDate = raw.birthDate;
  const gender = parseGender(raw.gender) as ParticipantGender | null;

  if (!email || !email.includes("@")) return { ok: false, message: "El correo no es válido." };
  if (!firstName) return { ok: false, message: "Falta el nombre." };
  if (!lastName) return { ok: false, message: "Falta el apellido." };
  if (!gender) return { ok: false, message: "Selecciona el género." };
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return { ok: false, message: "La fecha de nacimiento no es válida." };

  return {
    ok: true,
    email,
    firstName,
    lastName,
    birthDate,
    gender,
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
    gender: participant.gender,
    birthDate: participant.birthDate,
    eventDate: event.eventDate,
  });
  if (!answersCheck.ok) return answersCheck;
  const answersWithGender = {
    ...answersCheck.answers,
    [GENDER_ANSWER_KEY]: participant.gender,
  };

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
          answers: answersWithGender,
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
    gender: parseGender(row.answers?.[GENDER_ANSWER_KEY]) as ParticipantGender | null,
  }));
}

export async function getEventRegistration(
  eventId: string,
  organizationId: string,
  registrationId: string,
) {
  const rows = await listEventRegistrations(eventId, organizationId);
  return rows.find((row) => row.id === registrationId) ?? null;
}

export type AdminRegistrationUpdate = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: ParticipantGender;
  documentType: DocumentType;
  documentNumber: string;
  competitionId: string;
  answers: Record<string, unknown>;
  status?: "pending_payment" | "confirmed" | "cancelled";
};

/** Actualiza una inscripción desde el panel; el organizador puede corregir categoría y datos. */
export async function updateEventRegistration(
  eventId: string,
  organizationId: string,
  registrationId: string,
  input: AdminRegistrationUpdate,
): Promise<ActionResult> {
  const participant = parseParticipant({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    birthDate: input.birthDate,
    gender: input.gender,
    documentType: input.documentType,
    documentNumber: input.documentNumber,
    answers: input.answers,
  });
  if (!participant.ok) return participant;

  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const existing = await getEventRegistration(eventId, organizationId, registrationId);
  if (!existing) return { ok: false, message: "No se encontró la inscripción." };

  const [competition] = await db
    .select()
    .from(competitions)
    .where(and(eq(competitions.id, input.competitionId), eq(competitions.eventId, eventId)))
    .limit(1);
  if (!competition) return { ok: false, message: "No se encontró la competencia." };

  if (input.competitionId !== existing.competitionId) {
    const used = await countActiveRegistrations(db, input.competitionId);
    if (!capacityAvailable(competition.capacity, used)) {
      return { ok: false, message: "Esta competencia ya no tiene cupo." };
    }
  }

  const fields = fieldsForCompetition(await listFormFields(eventId), input.competitionId);
  const cleanedAnswers: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.fieldType === "heading") continue;
    const raw = input.answers[field.id];
    const empty =
      raw == null ||
      (typeof raw === "string" && raw.trim() === "") ||
      (Array.isArray(raw) && raw.length === 0);
    if (field.required && empty) {
      return { ok: false, message: `Falta completar: ${field.label}.` };
    }
    if (empty) continue;
    if (field.fieldType === "number") {
      const number = Number(raw);
      if (Number.isNaN(number)) return { ok: false, message: `${field.label} debe ser un número.` };
      cleanedAnswers[field.id] = number;
    } else if (field.fieldType === "select" || field.fieldType === "radio") {
      const value = String(raw);
      if (field.options.length > 0 && !field.options.includes(value)) {
        return { ok: false, message: `Opción no válida en ${field.label}.` };
      }
      cleanedAnswers[field.id] = value;
    } else {
      cleanedAnswers[field.id] = String(raw).trim();
    }
  }

  const status = input.status ?? existing.status;
  if (status !== "pending_payment" && status !== "confirmed" && status !== "cancelled") {
    return { ok: false, message: "Estado de inscripción no válido." };
  }

  await db
    .update(registrations)
    .set({
      competitionId: input.competitionId,
      email: participant.email,
      firstName: participant.firstName,
      lastName: participant.lastName,
      birthDate: new Date(`${participant.birthDate}T12:00:00`),
      documentType: participant.documentType,
      documentNumber: participant.documentNumber,
      status,
      answers: {
        ...cleanedAnswers,
        [GENDER_ANSWER_KEY]: participant.gender,
      },
    })
    .where(eq(registrations.id, registrationId));

  return { ok: true };
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
