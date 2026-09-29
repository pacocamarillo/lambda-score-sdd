import { EmptyTable, PageIntro } from "../listing";

export default function EventsPage() {
  return (
    <div className="stack">
      <PageIntro
        title="Eventos"
        lede="Borrador, publicado o cancelado. Publicar pide nombre, fecha, lugar y al menos una competencia."
        action={
          <button type="button" disabled>
            Crear evento
          </button>
        }
      />
      <p className="hint">El alta se habilita con la gestión de eventos. Hasta entonces el listado permanece vacío.</p>
      <section className="card">
        <form className="filters" action="/admin/events">
          <label>
            Buscar
            <input name="q" type="search" placeholder="Buscar eventos" />
          </label>
          <label>
            Estado
            <select name="status" defaultValue="all">
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>
          <label>
            Desde
            <input name="from" type="date" />
          </label>
          <label>
            Hasta
            <input name="to" type="date" />
          </label>
          <div className="inline-actions">
            <button type="submit">Buscar</button>
            <a className="button ghost" href="/admin/events">
              Limpiar
            </a>
          </div>
        </form>
      </section>
      <section className="card">
        <EmptyTable
          columns={["Evento", "Fecha", "Estado", "Inscripciones", "Acciones"]}
          message="Todavía no hay eventos. El primero muestra lugar, fecha, estado e inscripciones, y desde ahí se edita, se ven participantes, la página, las estadísticas, los resultados y el cronometraje."
        />
      </section>
    </div>
  );
}
