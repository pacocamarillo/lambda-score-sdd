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
  "PRINCIPAINTE",
  "ENTUSIASTAS",
] as const;

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

export const RUNNING_CATEGORY_NAMES = ["JUVENIL", "LIBRE", "MASTER"] as const;

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
