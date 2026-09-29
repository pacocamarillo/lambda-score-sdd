import { EmptyTable, PageIntro } from "../listing";

export default function CouponsPage() {
  return (
    <div className="stack">
      <PageIntro
        title="Cupones"
        lede="Un cupón reduce el total. La compra se paga completa con un solo medio."
        action={
          <button type="button" disabled>
            Crear descuento
          </button>
        }
      />
      <section className="card" aria-label="Resumen de usos y ahorro">
        <h2>Resumen de usos y ahorro</h2>
        <p className="lede">Indicadores de todos los cupones de la organización.</p>
        <div className="stats">
          <p className="stat">
            <strong>0</strong>
            <span>Cupones</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Veces usado</span>
          </p>
          <p className="stat">
            <strong>$0.00</strong>
            <span>Ahorro total (MXN)</span>
          </p>
        </div>
      </section>
      <section className="card stack">
        <form className="filters" action="/admin/coupons">
          <label>
            Buscar
            <input name="q" type="search" placeholder="Código o descripción" />
          </label>
          <label>
            Eventos aplicables
            <select name="event" defaultValue="all" disabled>
              <option value="all">Todos los eventos</option>
            </select>
          </label>
          <label>
            Estado
            <select name="status" defaultValue="all">
              <option value="all">Todos</option>
              <option value="active">Disponible</option>
              <option value="exhausted">Agotado</option>
              <option value="expired">Vencido</option>
            </select>
          </label>
          <div className="inline-actions">
            <button type="submit">Buscar</button>
          </div>
        </form>
        <details>
          <summary>Más filtros</summary>
          <div className="filters">
            <label>
              Competencia
              <select defaultValue="all" disabled>
                <option value="all">Todas</option>
              </select>
            </label>
            <label>
              Tipo de descuento
              <select defaultValue="all">
                <option value="all">Todos</option>
                <option value="percent">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </label>
            <label>
              ¿Sobre qué aplica?
              <select defaultValue="all">
                <option value="all">Todos</option>
                <option value="registration">Inscripción</option>
                <option value="extras">Adicionales</option>
                <option value="both">Inscripción y adicionales</option>
              </select>
            </label>
          </div>
        </details>
        <div className="inline-actions">
          <a className="button ghost" href="/admin/coupons">
            Limpiar filtros
          </a>
          <button type="button" disabled>
            Exportar
          </button>
        </div>
        <p className="hint">La exportación queda bloqueada hasta habilitar los lotes de cupones.</p>
        <EmptyTable
          columns={["Código", "Descuento", "Dónde se usa", "Aplica a", "Usos", "Vence", "Estado", "Acciones"]}
          message="Todavía no hay cupones. Cada uno tendrá código, descuento, alcance, usos, vencimiento y estado."
        />
      </section>
    </div>
  );
}
