import { SPECIAL_CATEGORY_NAMES } from "@/modules/events/category-catalog";
import { customCategoryNames } from "@/modules/events/custom-categories";

export function SpecialCategoriesField({ selections }: { selections: string[] }) {
  const selected = new Set(selections);
  const custom = customCategoryNames(selections, SPECIAL_CATEGORY_NAMES);
  return (
    <fieldset className="stack">
      <legend>Categorías especiales</legend>
      <p className="hint">
        Marca las del catálogo o escribe categorías nuevas, una por línea. Las nuevas también
        aparecen en la inscripción.
      </p>
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
      <label>
        Otras categorías especiales
        <textarea
          name="special_category_custom"
          defaultValue={custom.join("\n")}
          placeholder="Una categoría por línea"
          rows={3}
        />
      </label>
    </fieldset>
  );
}
