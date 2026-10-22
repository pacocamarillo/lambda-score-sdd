import { SPECIAL_CATEGORY_NAMES } from "@/modules/events/category-catalog";

export function SpecialCategoriesField({ selections }: { selections: string[] }) {
  const selected = new Set(selections);
  return (
    <fieldset className="stack">
      <legend>Categorías especiales</legend>
      <p className="hint">Marca las categorías especiales que aparecerán en la inscripción.</p>
      <div className="size-grid mtb-grid" role="group" aria-label="Categorías especiales">
        {SPECIAL_CATEGORY_NAMES.map((name) => (
          <label key={name} className="switch-row">
            <input
              type="checkbox"
              name="special_category"
              value={name}
              defaultChecked={selected.has(name)}
            />
            {name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
