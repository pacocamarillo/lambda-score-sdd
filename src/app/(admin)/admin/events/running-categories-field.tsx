import {
  RUNNING_CATEGORY_GROUPS,
  RUNNING_CATEGORY_NAMES,
  type RunningGroupKey,
} from "@/modules/events/category-catalog";
import { customCategoryNames } from "@/modules/events/custom-categories";

export function RunningCategoriesField({
  selections,
}: {
  selections: Record<RunningGroupKey, string[]>;
}) {
  return (
    <fieldset className="stack">
      <legend>Categorías Running</legend>
      <p className="hint">
        Marca las del catálogo o escribe categorías nuevas, una por línea. Las nuevas también
        aparecen en la inscripción.
      </p>
      {RUNNING_CATEGORY_GROUPS.map((group) => {
        const selected = new Set(selections[group.key] ?? []);
        const custom = customCategoryNames(selections[group.key] ?? [], RUNNING_CATEGORY_NAMES);
        return (
          <div key={group.key} className="stack">
            <h3>{group.label}</h3>
            <div className="size-grid mtb-grid" role="group" aria-label={group.label}>
              {RUNNING_CATEGORY_NAMES.map((name) => (
                <label key={name} className="switch-row">
                  <input
                    type="checkbox"
                    name={`running_${group.key}`}
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
                name={`running_${group.key}_custom`}
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
