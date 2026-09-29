import { EmptyTable, PageIntro } from "../listing";

export default function BillingPage() {
  return (
    <div className="stack">
      <PageIntro title="Facturación" lede="Lo que la plataforma cobra a la organización por inscripciones con pago aprobado." />
      <section className="card">
        <h2>Débito automático</h2>
        <p>Sin medio de pago guardado. Se activa al guardar uno, y las facturas siguientes pueden cobrarse con él.</p>
        <a className="button ghost" href="#datos">
          Gestionar facturación
        </a>
      </section>
      <section className="card">
        <h2>Periodo actual</h2>
        <p className="lede">Se cuentan las inscripciones del mes en curso. La factura llega al comienzo del mes siguiente y vence a las 72 horas.</p>
        <div className="stats">
          <p className="stat">
            <strong>0</strong>
            <span>Inscripciones</span>
          </p>
          <p className="stat">
            <strong>—</strong>
            <span>Precio por inscripción</span>
          </p>
          <p className="stat">
            <strong>$0.00</strong>
            <span>Total estimado (MXN)</span>
          </p>
        </div>
        <p className="hint">No hay registros en el periodo actual.</p>
      </section>
      <section className="card">
        <h2>Historial</h2>
        <EmptyTable
          columns={["Periodo", "Inscripciones", "Monto", "Estado", "Fecha de pago"]}
          message="No hay historial de facturación."
        />
      </section>
      <section className="card" id="datos">
        <h2>Datos de la próxima factura</h2>
        <p className="lede">Un cambio de datos fiscales o de medio de pago aplica solo a facturas futuras.</p>
        <form>
          <label>
            Nombre fiscal
            <input disabled placeholder="Sin capturar" />
          </label>
          <label>
            Identificador fiscal
            <input disabled placeholder="Sin capturar" />
          </label>
          <button type="button" disabled>
            Guardar medio de pago
          </button>
        </form>
        <p className="hint">El precio por inscripción se confirma en cada factura. Esta organización todavía no tiene un periodo con registros.</p>
      </section>
    </div>
  );
}
