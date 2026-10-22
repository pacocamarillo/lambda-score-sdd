export type ApparelCatalogItem = {
  code: string;
  category: string;
  label: string;
  sizes: string[];
};

/** Catálogo fijo de playeras y jersey con tallas ofrecibles. */
export const APPAREL_CATALOG: ApparelCatalogItem[] = [
  {
    code: "LAMBDA_01",
    category: "PLAYERAS",
    label: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL", "2X", "3X"],
  },
  {
    code: "LAMBDA_02",
    category: "PLAYERAS",
    label: "Dama",
    sizes: ["S", "M", "L", "XL", "2X"],
  },
  {
    code: "LAMBDA_03",
    category: "JERSEY MTB",
    label: "MTB",
    sizes: ["S", "M", "L", "XL", "2X"],
  },
];

export type IncludedApparelSelection = {
  code: string;
  sizes: string[];
};

export type IncludedItemsValue = {
  extras: string[];
  apparel: IncludedApparelSelection[];
};

export function emptyIncludedItems(): IncludedItemsValue {
  return { extras: [], apparel: [] };
}

export function parseIncludedItems(raw: string | null | undefined): IncludedItemsValue {
  if (!raw?.trim()) return emptyIncludedItems();
  try {
    const parsed = JSON.parse(raw) as IncludedItemsValue;
    if (!parsed || typeof parsed !== "object") return emptyIncludedItems();
    return {
      extras: Array.isArray(parsed.extras) ? parsed.extras.map(String).filter(Boolean) : [],
      apparel: Array.isArray(parsed.apparel)
        ? parsed.apparel
            .filter((item) => item && typeof item.code === "string")
            .map((item) => ({
              code: item.code,
              sizes: Array.isArray(item.sizes) ? item.sizes.map(String) : [],
            }))
        : [],
    };
  } catch {
    // Texto libre anterior: "Medalla, playera"
    const extras = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return { extras, apparel: [] };
  }
}

export function serializeIncludedItems(value: IncludedItemsValue): string | null {
  const extras = value.extras.map((item) => item.trim()).filter(Boolean);
  const apparel = value.apparel
    .map((item) => ({
      code: item.code,
      sizes: [...new Set(item.sizes.map((size) => size.trim()).filter(Boolean))],
    }))
    .filter((item) => item.sizes.length > 0);

  if (extras.length === 0 && apparel.length === 0) return null;
  return JSON.stringify({ extras, apparel });
}

export function catalogItem(code: string): ApparelCatalogItem | undefined {
  return APPAREL_CATALOG.find((item) => item.code === code);
}

export function formatIncludedItemsSummary(raw: string | null | undefined): string {
  const value = parseIncludedItems(raw);
  const parts: string[] = [...value.extras];
  for (const selection of value.apparel) {
    const item = catalogItem(selection.code);
    if (!item) continue;
    parts.push(`${item.category} ${item.label} (${selection.sizes.join(", ")})`);
  }
  return parts.join(" · ") || "—";
}

/** Lee el formulario del editor de competencias. */
export function includedItemsFromFormData(formData: FormData): string | null {
  const extras = formData.getAll("includedExtra").map(String);
  const apparel: IncludedApparelSelection[] = [];

  for (const item of APPAREL_CATALOG) {
    if (formData.get(`apparel_${item.code}`) !== "on") continue;
    const sizes = formData.getAll(`apparel_size_${item.code}`).map(String);
    apparel.push({ code: item.code, sizes });
  }

  return serializeIncludedItems({ extras, apparel });
}
