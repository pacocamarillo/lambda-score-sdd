import {
  MTB_CATEGORY_GROUPS,
  MTB_CATEGORY_NAMES,
  RUNNING_CATEGORY_GROUPS,
  RUNNING_CATEGORY_NAMES,
  SPECIAL_CATEGORY_FIELD_LABEL,
} from "@/modules/events/category-catalog";

export type Gender = "male" | "female";

export const GENDER_ANSWER_KEY = "_gender";

type AgeRange = { min: number; max: number | null };

/** Edad al día del evento. Si no hay fecha de evento, usa hoy. */
export function ageOnDate(birthDate: string | Date, onDate: Date): number | null {
  const birth = typeof birthDate === "string" ? new Date(`${birthDate}T12:00:00`) : birthDate;
  if (Number.isNaN(birth.getTime())) return null;
  let age = onDate.getFullYear() - birth.getFullYear();
  const monthDiff = onDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birth.getDate())) age -= 1;
  return age < 0 ? null : age;
}

const MTB_AGE_RANGES: Record<(typeof MTB_CATEGORY_NAMES)[number], AgeRange> = {
  "INFANTIL A": { min: 0, max: 9 },
  "INFANTIL B": { min: 10, max: 12 },
  "JUVENIL A": { min: 13, max: 14 },
  "JUVENIL B": { min: 15, max: 16 },
  "JUVENIL C": { min: 17, max: 18 },
  "MASTER 20": { min: 19, max: 29 },
  "MASTER 30": { min: 30, max: 39 },
  "MASTER 40": { min: 40, max: 49 },
  "MASTER 50": { min: 50, max: 59 },
  "MASTER 60": { min: 60, max: 69 },
  "MASTER 70": { min: 70, max: null },
  ELITE: { min: 19, max: null },
  PRINCIPAINTE: { min: 15, max: null },
  ENTUSIASTAS: { min: 15, max: null },
};

const RUNNING_AGE_RANGES: Record<(typeof RUNNING_CATEGORY_NAMES)[number], AgeRange> = {
  JUVENIL: { min: 0, max: 17 },
  LIBRE: { min: 18, max: 39 },
  MASTER: { min: 40, max: null },
};

function inAgeRange(age: number, range: AgeRange): boolean {
  if (age < range.min) return false;
  if (range.max != null && age > range.max) return false;
  return true;
}

export function parseGender(value: unknown): Gender | null {
  if (value === "male" || value === "female") return value;
  if (value === "varonil" || value === "masculino") return "male";
  if (value === "femenil" || value === "femenino") return "female";
  return null;
}

function genderForFieldLabel(label: string): Gender | "any" | null {
  if (label === SPECIAL_CATEGORY_FIELD_LABEL) return "any";
  if (label.toLowerCase().includes("varonil")) return "male";
  if (label.toLowerCase().includes("femenil")) return "female";
  return null;
}

function isCategoryFieldLabel(label: string): boolean {
  if (label === SPECIAL_CATEGORY_FIELD_LABEL) return true;
  return (
    MTB_CATEGORY_GROUPS.some((group) => group.fieldLabel === label) ||
    RUNNING_CATEGORY_GROUPS.some((group) => group.fieldLabel === label)
  );
}

export function isCategoryFormField(field: { label: string }): boolean {
  return isCategoryFieldLabel(field.label);
}

export function optionEligibleForAge(option: string, age: number, kind: "mtb" | "running" | "special"): boolean {
  if (kind === "special") return true;
  if (kind === "mtb") {
    const range = MTB_AGE_RANGES[option as (typeof MTB_CATEGORY_NAMES)[number]];
    return range ? inAgeRange(age, range) : true;
  }
  const range = RUNNING_AGE_RANGES[option as (typeof RUNNING_CATEGORY_NAMES)[number]];
  return range ? inAgeRange(age, range) : true;
}

function fieldKind(label: string): "mtb" | "running" | "special" | null {
  if (label === SPECIAL_CATEGORY_FIELD_LABEL) return "special";
  if (label.includes("MTB")) return "mtb";
  if (label.toLowerCase().includes("running")) return "running";
  return null;
}

export function filterCategoryOptions(input: {
  label: string;
  options: string[];
  gender: Gender | null;
  birthDate: string;
  eventDate: Date;
}): string[] {
  if (!isCategoryFieldLabel(input.label)) return input.options;

  const requiredGender = genderForFieldLabel(input.label);
  if (requiredGender === "male" || requiredGender === "female") {
    if (!input.gender || input.gender !== requiredGender) return [];
  }

  const age = ageOnDate(input.birthDate, input.eventDate);
  if (age == null) return [];

  const kind = fieldKind(input.label);
  if (!kind) return input.options;

  return input.options.filter((option) => optionEligibleForAge(option, age, kind));
}

export function validateCategoryAnswers(input: {
  fields: Array<{ id: string; label: string; options: string[]; required: boolean; fieldType: string }>;
  answers: Record<string, unknown>;
  gender: Gender | null;
  birthDate: string;
  eventDate: Date;
}): { ok: true } | { ok: false; message: string } {
  if (!input.gender) return { ok: false, message: "Selecciona el género." };

  for (const field of input.fields) {
    if (!isCategoryFormField(field)) continue;
    if (field.fieldType === "heading") continue;

    const allowed = filterCategoryOptions({
      label: field.label,
      options: field.options,
      gender: input.gender,
      birthDate: input.birthDate,
      eventDate: input.eventDate,
    });

    const raw = input.answers[field.id];
    const value = raw == null ? "" : String(raw).trim();

    if (!value) {
      if (field.required && allowed.length > 0) {
        return { ok: false, message: `Falta completar: ${field.label}.` };
      }
      continue;
    }

    if (!allowed.includes(value)) {
      return {
        ok: false,
        message: `La opción elegida en ${field.label} no corresponde a tu género o edad.`,
      };
    }
  }

  return { ok: true };
}
