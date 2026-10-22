import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { addOns, events, registrationAddOns, registrations } from "@/db/schema/events";
import type { ActionResult } from "@/modules/events/types";

export type AddOnInput = {
  name: string;
  options?: string[];
  priceCents: number;
  stock?: number | null;
  required?: boolean;
  visible?: boolean;
  includedInCompetition?: boolean;
  competitionIds?: string[] | null;
  confirmZeroPrice?: boolean;
};

async function assertEventOwned(eventId: string, organizationId: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) return null;
  return event;
}

export async function listAddOns(eventId: string) {
  const db = getDb();
  return db.select().from(addOns).where(eq(addOns.eventId, eventId));
}

export function visibleAddOnsForCompetition<T extends { visible: boolean; competitionIds: string[] | null }>(
  items: T[],
  competitionId: string,
): T[] {
  return items.filter((item) => {
    if (!item.visible) return false;
    if (!item.competitionIds || item.competitionIds.length === 0) return true;
    return item.competitionIds.includes(competitionId);
  });
}

export async function saveAddOn(
  eventId: string,
  organizationId: string,
  input: AddOnInput,
  addOnId?: string,
): Promise<ActionResult<{ addOnId: string; warnHistory?: boolean; confirmZeroPrice?: boolean }>> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };

  const name = input.name.trim();
  if (!name) return { ok: false, message: "El adicional necesita un nombre." };
  if (input.priceCents < 0) return { ok: false, message: "El precio no puede ser negativo." };
  if (input.priceCents === 0 && !input.includedInCompetition && !input.confirmZeroPrice) {
    return {
      ok: false,
      message: "Confirma guardar un adicional a precio cero sin marcarlo como incluido.",
    };
  }

  const db = getDb();
  let warnHistory = false;
  if (addOnId) {
    const [existingChoice] = await db
      .select({ id: registrationAddOns.id })
      .from(registrationAddOns)
      .where(eq(registrationAddOns.addOnId, addOnId))
      .limit(1);
    warnHistory = Boolean(existingChoice);
  }

  const values = {
    name,
    options: input.options ?? [],
    priceCents: input.priceCents,
    stock: input.stock ?? null,
    required: Boolean(input.required),
    visible: input.visible ?? true,
    includedInCompetition: Boolean(input.includedInCompetition),
    competitionIds: input.competitionIds ?? null,
  };

  if (addOnId) {
    await db.update(addOns).set(values).where(and(eq(addOns.id, addOnId), eq(addOns.eventId, eventId)));
    return { ok: true, addOnId, warnHistory };
  }

  const [created] = await db.insert(addOns).values({ eventId, ...values }).returning({ id: addOns.id });
  if (!created) return { ok: false, message: "No se pudo guardar el adicional." };
  return { ok: true, addOnId: created.id };
}

export async function hideAddOn(
  eventId: string,
  organizationId: string,
  addOnId: string,
): Promise<ActionResult> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };
  const db = getDb();
  await db
    .update(addOns)
    .set({ visible: false })
    .where(and(eq(addOns.id, addOnId), eq(addOns.eventId, eventId)));
  return { ok: true };
}

export async function deleteAddOn(
  eventId: string,
  organizationId: string,
  addOnId: string,
): Promise<ActionResult> {
  const event = await assertEventOwned(eventId, organizationId);
  if (!event) return { ok: false, message: "No se encontró el evento." };
  const db = getDb();
  const [existingChoice] = await db
    .select({ id: registrationAddOns.id })
    .from(registrationAddOns)
    .where(eq(registrationAddOns.addOnId, addOnId))
    .limit(1);
  if (existingChoice) {
    return {
      ok: false,
      message: "Este adicional ya tiene elecciones. Ocúltalo para no borrar el historial.",
    };
  }
  await db.delete(addOns).where(and(eq(addOns.id, addOnId), eq(addOns.eventId, eventId)));
  return { ok: true };
}

/** Persiste elecciones; si el adicional luego se oculta, las filas siguen. */
export async function persistRegistrationAddOns(input: {
  registrationId: string;
  competitionId: string;
  eventId: string;
  selections: Array<{ addOnId: string; option?: string }>;
}): Promise<ActionResult> {
  const db = getDb();
  const available = visibleAddOnsForCompetition(await listAddOns(input.eventId), input.competitionId);

  for (const addOn of available) {
    const selected = input.selections.find((item) => item.addOnId === addOn.id);
    if (addOn.required && !selected) {
      return { ok: false, message: `El adicional "${addOn.name}" es obligatorio.` };
    }
  }

  for (const selection of input.selections) {
    const addOn = available.find((item) => item.id === selection.addOnId);
    if (!addOn) return { ok: false, message: "Hay un adicional que ya no está disponible." };
    if (addOn.options.length > 0 && !selection.option) {
      return { ok: false, message: `Elige una opción para ${addOn.name}.` };
    }
    if (selection.option && addOn.options.length > 0 && !addOn.options.includes(selection.option)) {
      return { ok: false, message: `Opción no válida en ${addOn.name}.` };
    }
    if (addOn.stock != null) {
      const chosen = await db
        .select({ id: registrationAddOns.id })
        .from(registrationAddOns)
        .innerJoin(registrations, eq(registrations.id, registrationAddOns.registrationId))
        .where(and(eq(registrationAddOns.addOnId, addOn.id)));
      if (chosen.length >= addOn.stock) {
        return { ok: false, message: `Ya no hay stock de ${addOn.name}.` };
      }
    }
  }

  for (const selection of input.selections) {
    const addOn = available.find((item) => item.id === selection.addOnId)!;
    await db.insert(registrationAddOns).values({
      registrationId: input.registrationId,
      addOnId: addOn.id,
      option: selection.option ?? null,
      priceCents: addOn.priceCents,
    });
  }

  return { ok: true };
}

export async function listRegistrationAddOns(registrationId: string) {
  const db = getDb();
  return db
    .select({
      id: registrationAddOns.id,
      option: registrationAddOns.option,
      priceCents: registrationAddOns.priceCents,
      addOnId: addOns.id,
      name: addOns.name,
      visible: addOns.visible,
    })
    .from(registrationAddOns)
    .innerJoin(addOns, eq(addOns.id, registrationAddOns.addOnId))
    .where(eq(registrationAddOns.registrationId, registrationId));
}
