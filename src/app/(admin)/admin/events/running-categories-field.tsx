import {
  RUNNING_CATEGORY_GROUPS,
  RUNNING_CATEGORY_NAMES,
  type RunningGroupKey,
} from "@/modules/events/category-catalog";

export function RunningCategoriesField({
  selections,
}: {
  selections: Record<RunningGroupKey, string[]>;
}) {
  return (
    <fieldset className="stack">
      <legend>Categorías Running</legend>
      <p className="hint">
        Marca las categorías que aparecerán en la inscripción. Se guardan como listas de opción
        única (varonil y femenil).
      </p>
      {RUNNING_CATEGORY_GROUPS.map((group) => {
        const selected = new Set(selections[group.key] ?? []);
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
          </div>
        );
      })}
    </fieldset>
  );
}
