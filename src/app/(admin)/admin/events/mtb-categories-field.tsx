import {
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
        aparecen en la inscripción.
      </p>
      {MTB_CATEGORY_GROUPS.map((group) => {
        const selected = new Set(selections[group.key] ?? []);
        const custom = customCategoryNames(selections[group.key] ?? [], MTB_CATEGORY_NAMES);
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
                  {name}
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
