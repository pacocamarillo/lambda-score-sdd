import {
  MTB_CATEGORY_GROUPS,
  MTB_CATEGORY_NAMES,
  type MtbGroupKey,
} from "@/modules/events/category-catalog";

export function MtbCategoriesField({
  selections,
}: {
  selections: Record<MtbGroupKey, string[]>;
}) {
  return (
    <fieldset className="stack">
      <legend>Categorías MTB</legend>
      <p className="hint">
        Marca las categorías que aparecerán en la inscripción. Se guardan como listas de opción
        única (varonil y femenil).
      </p>
      {MTB_CATEGORY_GROUPS.map((group) => {
        const selected = new Set(selections[group.key] ?? []);
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
          </div>
        );
      })}
    </fieldset>
  );
}
