import {
  MTB_CATEGORY_AGE_HINTS,
  MTB_CATEGORY_GROUPS,
  MTB_CATEGORY_NAMES,
  type MtbGroupKey,
} from "@/modules/events/category-catalog";
import { customCategoryNames } from "@/modules/events/custom-categories";

export function MtbCategoriesField({
  selections,
}: {
  selections: Record<MtbGroupKey, string[]>;
}) {
  return (
    <fieldset className="stack">
      <legend>Categorías MTB</legend>
      <p className="hint">
        Marca las del catálogo o escribe categorías nuevas, una por línea. Las nuevas también
        aparecen en la inscripción. La edad se valida el día del evento.
      </p>
      {MTB_CATEGORY_GROUPS.map((group) => {
        const selected = new Set(selections[group.key] ?? []);
        // Include legacy typo so existing events keep the checkbox checked after rename.
        if (selected.has("PRINCIPAINTE")) selected.add("PRINCIPIANTES");
        const custom = customCategoryNames(selections[group.key] ?? [], [
          ...MTB_CATEGORY_NAMES,
          "PRINCIPAINTE",
        ]);
        return (
          <div key={group.key} className="stack">
            <h3>{group.label}</h3>
            <div className="size-grid mtb-grid" role="group" aria-label={group.label}>
              {MTB_CATEGORY_NAMES.map((name) => (
                <label key={name} className="switch-row">
                  <input
                    type="checkbox"
                    name={`mtb_${group.key}`}
                    value={name}
                    defaultChecked={selected.has(name)}
                  />
                  <span>
                    {name}
                    <span className="detail"> · {MTB_CATEGORY_AGE_HINTS[name]}</span>
                  </span>
                </label>
              ))}
            </div>
            <label>
              Otras categorías {group.label}
              <textarea
                name={`mtb_${group.key}_custom`}
                defaultValue={custom.join("\n")}
                placeholder="Una categoría por línea"
                rows={3}
              />
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
