"use client";

import { useState } from "react";

type EventOption = { id: string; name: string };

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function CreateCouponDialog({
  events,
  action,
}: {
  events: EventOption[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"coupon" | "conditions">("coupon");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [scope, setScope] = useState<"all" | "specific">("all");
  const [limitUses, setLimitUses] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);

  function close() {
    setOpen(false);
    setTab("coupon");
    setMode("single");
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}>
        Crear cupón
      </button>
    );
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-coupon-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-coupon-title">{mode === "bulk" ? "Cupón masivo" : "Crear cupón"}</h2>
        <form action={action} className="stack">
          <input type="hidden" name="createMode" value={mode} />
          <fieldset>
            <legend>Tipo de creación</legend>
            <label className="switch-row">
              <input
                type="radio"
                name="modeUi"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              Cupón individual
            </label>
            <label className="switch-row">
              <input
                type="radio"
                name="modeUi"
                checked={mode === "bulk"}
                onChange={() => setMode("bulk")}
              />
              Cupón masivo
            </label>
          </fieldset>

          {mode === "single" ? (
            <>
              <label>
                Código del cupón
                <input
                  name="code"
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                />
              </label>
              <button type="button" className="ghost" onClick={() => setCode(randomCode())}>
                Generar código
              </button>
            </>
          ) : (
            <label>
              Cantidad de cupones (1 a 100)
              <input name="bulkQuantity" type="number" min={1} max={100} step={1} defaultValue={10} required />
            </label>
          )}

          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "coupon"} onClick={() => setTab("coupon")}>
              Cupón
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "conditions"}
              onClick={() => setTab("conditions")}
            >
              Condiciones de uso
            </button>
          </div>

          <div hidden={tab !== "coupon"} className="stack">
            <fieldset>
              <legend>Descuento</legend>
              <label className="switch-row">
                <input
                  type="radio"
                  name="discountType"
                  value="percent"
                  checked={discountType === "percent"}
                  onChange={() => setDiscountType("percent")}
                />
                Porcentaje
              </label>
              <label className="switch-row">
                <input
                  type="radio"
                  name="discountType"
                  value="fixed"
                  checked={discountType === "fixed"}
                  onChange={() => setDiscountType("fixed")}
                />
                Monto fijo
              </label>
            </fieldset>
            {discountType === "percent" ? (
              <label>
                Porcentaje (1 a 100)
                <input name="percent" type="number" min={1} max={100} step={1} />
              </label>
            ) : (
              <label>
                Monto fijo (MXN)
                <input name="amount" type="number" min={0.01} step={0.01} />
              </label>
            )}
            <label>
              Descripción
              <textarea name="description" />
            </label>
          </div>

          <div hidden={tab !== "conditions"} className="stack">
            <fieldset>
              <legend>¿Sobre qué aplica?</legend>
              <label className="switch-row">
                <input name="appliesToRegistration" type="checkbox" />
                Costo de inscripción
              </label>
              <label className="switch-row">
                <input name="appliesToAddOns" type="checkbox" />
                Adicionales
              </label>
            </fieldset>

            <fieldset>
              <legend>Eventos aplicables</legend>
              <label className="switch-row">
                <input
                  type="radio"
                  name="eventScope"
                  value="all"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                Todos los eventos
              </label>
              <label className="switch-row">
                <input
                  type="radio"
                  name="eventScope"
                  value="specific"
                  checked={scope === "specific"}
                  onChange={() => setScope("specific")}
                />
                Eventos específicos
              </label>
              {scope === "specific" ? (
                <div className="check-list">
                  {events.length === 0 ? (
                    <p className="hint">Todavía no hay eventos.</p>
                  ) : (
                    events.map((event) => (
                      <label key={event.id} className="switch-row">
                        <input type="checkbox" name="eventId" value={event.id} />
                        {event.name}
                      </label>
                    ))
                  )}
                </div>
              ) : null}
            </fieldset>

            <label className="switch-row">
              <input name="includeFutureCompetitions" type="checkbox" />
              Aplicar también a las competencias futuras de los eventos seleccionados
            </label>

            <div className="inline-actions">
              <button
                type="button"
                className={limitUses ? "" : "ghost"}
                aria-pressed={limitUses}
                onClick={() => setLimitUses((value) => !value)}
              >
                Limitar cantidad de usos
              </button>
              <button
                type="button"
                className={hasExpiry ? "" : "ghost"}
                aria-pressed={hasExpiry}
                onClick={() => setHasExpiry((value) => !value)}
              >
                Fecha de vencimiento
              </button>
            </div>
            {limitUses ? <input type="hidden" name="limitUses" value="on" /> : null}
            {hasExpiry ? <input type="hidden" name="hasExpiry" value="on" /> : null}
            {limitUses ? (
              <label>
                Cantidad de usos
                <input name="usageLimit" type="number" min={1} step={1} />
              </label>
            ) : null}
            {hasExpiry ? (
              <label>
                Válido hasta
                <input name="expiresOn" type="date" />
              </label>
            ) : null}
          </div>

          <div className="inline-actions">
            <button type="submit">{mode === "bulk" ? "Crear cupones" : "Crear cupón"}</button>
            <button type="button" className="ghost" onClick={close}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
