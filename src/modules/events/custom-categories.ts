/** Nombres escritos por el organizador, además del catálogo. */

export function parseCustomCategoryNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of raw.split(/[\n,;]/)) {
    const name = part.trim().replace(/\s+/g, " ");
    if (!name) continue;
    const key = name.toLocaleLowerCase("es-MX");
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export function mergeCategoryOptions(
  catalogSelected: string[],
  customRaw: string,
  catalog: readonly string[],
): string[] {
  const byKey = new Map(catalog.map((name) => [name.toLocaleLowerCase("es-MX"), name]));
  const chosen = new Set<string>();
  const ordered: string[] = [];

  const push = (name: string) => {
    const canonical = byKey.get(name.toLocaleLowerCase("es-MX")) ?? name;
    const key = canonical.toLocaleLowerCase("es-MX");
    if (chosen.has(key)) return;
    chosen.add(key);
    ordered.push(canonical);
  };

  for (const name of catalog) {
    if (catalogSelected.includes(name)) push(name);
  }
  for (const name of parseCustomCategoryNames(customRaw)) push(name);
  return ordered;
}

export function customCategoryNames(options: string[], catalog: readonly string[]): string[] {
  const known = new Set(catalog.map((name) => name.toLocaleLowerCase("es-MX")));
  return options.filter((name) => !known.has(name.toLocaleLowerCase("es-MX")));
}
