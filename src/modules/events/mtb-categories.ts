import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events, formFields } from "@/db/schema/events";
import {
  MTB_CATEGORY_GROUPS,
  MTB_CATEGORY_NAMES,
  type MtbGroupKey,
} from "@/modules/events/category-catalog";
import { mergeCategoryOptions } from "@/modules/events/custom-categories";
import { saveFormField } from "@/modules/events/form";
import type { ActionResult } from "@/modules/events/types";

export {
  MTB_CATEGORY_GROUPS,
  MTB_CATEGORY_NAMES,
  type MtbGroupKey,
} from "@/modules/events/category-catalog";

function normalizeMtbCategoryName(name: string): string {
  return name.trim() === "PRINCIPAINTE" ? "PRINCIPIANTES" : name;
}

export function mtbSelectionsFromFormData(formData: FormData): Record<MtbGroupKey, string[]> {
  const result = { varonil: [] as string[], femenil: [] as string[] };
  for (const group of MTB_CATEGORY_GROUPS) {
    const selected = formData.getAll(`mtb_${group.key}`).map(String).map(normalizeMtbCategoryName);
    const custom = String(formData.get(`mtb_${group.key}_custom`) ?? "").replaceAll(
      /\bPRINCIPAINTE\b/g,
      "PRINCIPIANTES",
    );
    result[group.key] = mergeCategoryOptions(selected, custom, MTB_CATEGORY_NAMES);
  }
  return result;
}

export async function loadMtbCategorySelections(eventId: string): Promise<Record<MtbGroupKey, string[]>> {
  const db = getDb();
  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  const result: Record<MtbGroupKey, string[]> = { varonil: [], femenil: [] };

  for (const group of MTB_CATEGORY_GROUPS) {
    const field = fields.find((row) => row.label === group.fieldLabel);
    result[group.key] = (field?.options ?? []).map(normalizeMtbCategoryName);
  }

  return result;
}

export async function saveMtbCategories(
  eventId: string,
  organizationId: string,
  selections: Record<MtbGroupKey, string[]>,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const existing = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  let sortOrder = existing.length;

  for (const group of MTB_CATEGORY_GROUPS) {
    const options = selections[group.key] ?? [];
    const current = existing.find((row) => row.label === group.fieldLabel);

    if (options.length === 0) {
      if (current) {
        await db
          .delete(formFields)
          .where(and(eq(formFields.id, current.id), eq(formFields.eventId, eventId)));
      }
      continue;
    }

    const result = await saveFormField(
      eventId,
      organizationId,
      {
        label: group.fieldLabel,
        fieldType: "select",
        required: true,
        options,
        sortOrder: current?.sortOrder ?? sortOrder++,
      },
      current?.id,
    );
    if (!result.ok) return result;
  }

  return { ok: true };
}
