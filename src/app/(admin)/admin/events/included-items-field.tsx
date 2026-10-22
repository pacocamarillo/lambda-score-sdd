import { APPAREL_CATALOG, parseIncludedItems } from "@/modules/events/included-items";

const EXTRA_OPTIONS = ["Medalla", "Chip", "Bolsa del corredor"] as const;

export function IncludedItemsField({ initialValue }: { initialValue?: string | null }) {
  const initial = parseIncludedItems(initialValue);
  const selectedExtras = new Set(initial.extras);
  const apparelByCode = new Map(initial.apparel.map((item) => [item.code, new Set(item.sizes)]));

  return (
    <fieldset className="stack">
      <legend>Artículos incluidos</legend>
      <p className="hint">Marca jersey o playera para ofrecer tallas concretas en la inscripción.</p>

      <div className="stack">
        {EXTRA_OPTIONS.map((name) => (
          <label key={name} className="switch-row">
            <input
              type="checkbox"
              name="includedExtra"
              value={name}
              defaultChecked={selectedExtras.has(name)}
            />
            {name}
          </label>
        ))}
      </div>

      {APPAREL_CATALOG.map((item) => {
        const selectedSizes = apparelByCode.get(item.code);
        const checked = Boolean(selectedSizes);
        return (
          <div key={item.code} className="apparel-block">
            <label className="switch-row">
              <input
                className="apparel-toggle"
                type="checkbox"
                name={`apparel_${item.code}`}
                defaultChecked={checked}
              />
              <span>
                {item.category} · {item.label}{" "}
                <span className="hint">({item.code})</span>
              </span>
            </label>
            <div className="size-grid" role="group" aria-label={`Tallas ${item.label}`}>
              <p className="hint">Tallas disponibles</p>
              {item.sizes.map((size) => (
                <label key={size} className="switch-row">
                  <input
                    type="checkbox"
                    name={`apparel_size_${item.code}`}
                    value={size}
                    defaultChecked={selectedSizes?.has(size) ?? true}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
