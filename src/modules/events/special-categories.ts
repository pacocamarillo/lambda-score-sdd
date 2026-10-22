import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events, formFields } from "@/db/schema/events";
import {
  SPECIAL_CATEGORY_FIELD_LABEL,
  SPECIAL_CATEGORY_NAMES,
} from "@/modules/events/category-catalog";
import { saveFormField } from "@/modules/events/form";
import type { ActionResult } from "@/modules/events/types";

export {
  SPECIAL_CATEGORY_FIELD_LABEL,
  SPECIAL_CATEGORY_NAMES,
} from "@/modules/events/category-catalog";

export function specialSelectionsFromFormData(formData: FormData): string[] {
  const selected = formData.getAll("special_category").map(String);
  return SPECIAL_CATEGORY_NAMES.filter((name) => selected.includes(name));
}

export async function loadSpecialCategorySelections(eventId: string): Promise<string[]> {
  const db = getDb();
  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  const field = fields.find((row) => row.label === SPECIAL_CATEGORY_FIELD_LABEL);
  if (!field?.options?.length) return [];
  return field.options.filter((option) => (SPECIAL_CATEGORY_NAMES as readonly string[]).includes(option));
}

export async function saveSpecialCategories(
  eventId: string,
  organizationId: string,
  options: string[],
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const existing = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  const current = existing.find((row) => row.label === SPECIAL_CATEGORY_FIELD_LABEL);

  if (options.length === 0) {
    if (current) {
      await db
        .delete(formFields)
        .where(and(eq(formFields.id, current.id), eq(formFields.eventId, eventId)));
    }
    return { ok: true };
  }

  return saveFormField(
    eventId,
    organizationId,
    {
      label: SPECIAL_CATEGORY_FIELD_LABEL,
      fieldType: "select",
      required: false,
      options,
      sortOrder: current?.sortOrder ?? existing.length,
    },
    current?.id,
  );
}
