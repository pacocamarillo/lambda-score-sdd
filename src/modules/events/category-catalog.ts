/** Catálogos de categorías (sin acceso a base de datos; seguro para el cliente). */

export const MTB_CATEGORY_NAMES = [
  "INFANTIL A",
  "INFANTIL B",
  "JUVENIL A",
  "JUVENIL B",
  "JUVENIL C",
  "MASTER 20",
  "MASTER 30",
  "MASTER 40",
  "MASTER 50",
  "MASTER 60",
  "MASTER 70",
  "ELITE",
  "PRINCIPIANTES",
  "ENTUSIASTAS",
] as const;

/** Texto de edad para el catálogo MTB (admin e inscripción). */
export const MTB_CATEGORY_AGE_HINTS: Record<(typeof MTB_CATEGORY_NAMES)[number], string> = {
  "INFANTIL A": "9 y 10 años",
  "INFANTIL B": "11 y 12 años",
  "JUVENIL A": "13-14 años",
  "JUVENIL B": "15-16 años",
  "JUVENIL C": "17-19 años",
  "MASTER 20": "20 a 29 años",
  "MASTER 30": "30 a 39 años",
  "MASTER 40": "40 a 49 años",
  "MASTER 50": "50 a 59 años",
  "MASTER 60": "60 a 69 años",
  "MASTER 70": "70 en adelante",
  ELITE: "edad libre",
  PRINCIPIANTES: "edad libre",
  ENTUSIASTAS: "edad libre",
};

export const MTB_CATEGORY_GROUPS = [
  {
    key: "varonil",
    label: "Categorías MTB Varonil",
    fieldLabel: "Categoría MTB Varonil",
  },
  {
    key: "femenil",
    label: "Categorías MTB Femenil",
    fieldLabel: "Categoría MTB Femenil",
  },
] as const;

export type MtbGroupKey = (typeof MTB_CATEGORY_GROUPS)[number]["key"];

export const RUNNING_CATEGORY_NAMES = [
  "Sub-16",
  "Sub-18",
  "Sub-20",
  "Sub-23",
  "JUVENIL",
  "LIBRE",
  "MASTER",
  "VETERANOS",
] as const;

/** Texto de edad para el catálogo Running (admin e inscripción). */
export const RUNNING_CATEGORY_AGE_HINTS: Record<(typeof RUNNING_CATEGORY_NAMES)[number], string> = {
  "Sub-16": "14 a 15 años",
  "Sub-18": "16 a 17 años",
  "Sub-20": "18 a 19 años",
  "Sub-23": "20 a 22 años",
  JUVENIL: "15 a 19 años",
  LIBRE: "edad libre",
  MASTER: "40 a 49 años",
  VETERANOS: "50 años en adelante",
};

export const RUNNING_CATEGORY_GROUPS = [
  {
    key: "varonil",
    label: "Categorías Running Varonil",
    fieldLabel: "Categoría Running Varonil",
  },
  {
    key: "femenil",
    label: "Categorías Running Femenil",
    fieldLabel: "Categoría Running Femenil",
  },
] as const;

export type RunningGroupKey = (typeof RUNNING_CATEGORY_GROUPS)[number]["key"];

export const SPECIAL_CATEGORY_NAMES = ["PCD O SILLA DE RUEDAS"] as const;

export const SPECIAL_CATEGORY_FIELD_LABEL = "Categoría especial";
