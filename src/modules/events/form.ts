import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events, formFields, registrations, competitions } from "@/db/schema/events";
import type { ActionResult, FormFieldType } from "@/modules/events/types";

const FIELD_TYPES: FormFieldType[] = ["text", "number", "select", "radio", "textarea", "file", "heading"];

export type FormFieldInput = {
  label: string;
  fieldType: FormFieldType;
  required?: boolean;
  uniqueInEvent?: boolean;
  options?: string[];
  competitionIds?: string[] | null;
  sortOrder?: number;
};

async function assertEventOwned(eventId: string, organizationId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) return null;
  return event;
}

export async function listFormFields(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(formFields)
    .where(eq(formFields.eventId, eventId))
    .orderBy(asc(formFields.sortOrder));
}

export function fieldsForCompetition<T extends { competitionIds: string[] | null }>(
  fields: T[],
  competitionId: string,
): T[] {
  return fields.filter((field) => {
    if (!field.competitionIds || field.competitionIds.length === 0) return true;
    return field.competitionIds.includes(competitionId);
  });
}

export async function saveFormField(
  eventId: string,
  organizationId: string,
  input: FormFieldInput,
  fieldId?: string,
): Promise<ActionResult<{ fieldId: string }>> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };

  const label = input.label.trim();
  if (!label) return { ok: false, message: "El campo necesita una etiqueta." };
  if (!FIELD_TYPES.includes(input.fieldType)) {
    return { ok: false, message: "Tipo de campo no válido." };
  }
  if ((input.fieldType === "select" || input.fieldType === "radio") && !(input.options?.length)) {
    return { ok: false, message: "Lista y opción única necesitan opciones." };
  }

  const db = getDb();
  const values = {
    label,
    fieldType: input.fieldType,
    required: Boolean(input.required),
    uniqueInEvent: Boolean(input.uniqueInEvent),
    options: input.options ?? [],
    competitionIds: input.competitionIds ?? null,
    sortOrder: input.sortOrder ?? 0,
  };

  if (fieldId) {
    await db
      .update(formFields)
      .set(values)
      .where(and(eq(formFields.id, fieldId), eq(formFields.eventId, eventId)));
    return { ok: true, fieldId };
  }

  const [created] = await db.insert(formFields).values({ eventId, ...values }).returning({ id: formFields.id });
  if (!created) return { ok: false, message: "No se pudo guardar el campo." };
  return { ok: true, fieldId: created.id };
}

export async function deleteFormField(
  eventId: string,
  organizationId: string,
  fieldId: string,
): Promise<ActionResult> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };
  const db = getDb();
  await db.delete(formFields).where(and(eq(formFields.id, fieldId), eq(formFields.eventId, eventId)));
  return { ok: true };
}

export async function validateCustomAnswers(input: {
  eventId: string;
  competitionId: string;
  answers: Record<string, unknown>;
}): Promise<ActionResult<{ answers: Record<string, unknown> }>> {
  const fields = fieldsForCompetition(await listFormFields(input.eventId), input.competitionId);
  const cleaned: Record<string, unknown> = {};

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
      cleaned[field.id] = number;
    } else if (field.fieldType === "select" || field.fieldType === "radio") {
      const value = String(raw);
      if (!field.options.includes(value)) {
        return { ok: false, message: `Opción no válida en ${field.label}.` };
      }
      cleaned[field.id] = value;
    } else {
      cleaned[field.id] = String(raw).trim();
    }

    if (field.uniqueInEvent) {
      const db = getDb();
      const competitionRows = await db
        .select({ id: competitions.id })
        .from(competitions)
        .where(eq(competitions.eventId, input.eventId));
      const competitionIds = competitionRows.map((row) => row.id);
      if (competitionIds.length > 0) {
        const existing = await db.select().from(registrations).where(inArray(registrations.competitionId, competitionIds));
        const value = String(cleaned[field.id]);
        const duplicate = existing.some((row) => String(row.answers?.[field.id] ?? "") === value);
        if (duplicate) {
          return { ok: false, message: `${field.label} ya está registrado en este evento.` };
        }
      }
    }
  }

  return { ok: true, answers: cleaned };
}
