import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { events, formFields } from "@/db/schema/events";
import {
  RUNNING_CATEGORY_GROUPS,
  RUNNING_CATEGORY_NAMES,
  type RunningGroupKey,
} from "@/modules/events/category-catalog";
import { mergeCategoryOptions } from "@/modules/events/custom-categories";
import { saveFormField } from "@/modules/events/form";
import type { ActionResult } from "@/modules/events/types";

export {
  RUNNING_CATEGORY_GROUPS,
  RUNNING_CATEGORY_NAMES,
  type RunningGroupKey,
} from "@/modules/events/category-catalog";

export function runningSelectionsFromFormData(formData: FormData): Record<RunningGroupKey, string[]> {
  const result = { varonil: [] as string[], femenil: [] as string[] };
  for (const group of RUNNING_CATEGORY_GROUPS) {
    const selected = formData.getAll(`running_${group.key}`).map(String);
    const custom = String(formData.get(`running_${group.key}_custom`) ?? "");
    result[group.key] = mergeCategoryOptions(selected, custom, RUNNING_CATEGORY_NAMES);
  }
  return result;
}

export async function loadRunningCategorySelections(
  eventId: string,
): Promise<Record<RunningGroupKey, string[]>> {
  const db = getDb();
  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  const result: Record<RunningGroupKey, string[]> = { varonil: [], femenil: [] };

  for (const group of RUNNING_CATEGORY_GROUPS) {
    const field = fields.find((row) => row.label === group.fieldLabel);
    result[group.key] = field?.options ?? [];
  }

  return result;
}

export async function saveRunningCategories(
  eventId: string,
  organizationId: string,
  selections: Record<RunningGroupKey, string[]>,
): Promise<ActionResult> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.organizationId !== organizationId) {
    return { ok: false, message: "No se encontró el evento." };
  }

  const existing = await db.select().from(formFields).where(eq(formFields.eventId, eventId));
  let sortOrder = existing.length;

  for (const group of RUNNING_CATEGORY_GROUPS) {
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
