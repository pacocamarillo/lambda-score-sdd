import { EmptyTable, PageIntro } from "../listing";

export default function ContactsPage() {
  return (
    <div className="stack">
      <PageIntro title="Contactos" lede="Personas de la organización. Sirven como audiencia y no sustituyen una inscripción." />
      <section className="card stack">
        <form className="filters" action="/admin/contacts">
          <label>
            Búsqueda
            <input name="q" type="search" placeholder="Buscar por nombre o correo" />
          </label>
          <label>
            Eventos en los que participó
            <select name="event" defaultValue="all" disabled>
              <option value="all">Todos los eventos</option>
            </select>
          </label>
          <div className="inline-actions">
            <button type="submit">Buscar</button>
            <a className="button ghost" href="/admin/contacts">
              Limpiar filtros
            </a>
          </div>
        </form>
        <p className="hint">Puedes elegir uno o varios eventos cuando ya existan.</p>
        <div className="toolbar">
          <p className="hint">0 contactos encontrados · 0 seleccionados</p>
          <div className="inline-actions">
            <button type="button" disabled>
              Invitar a evento
            </button>
            <button type="button" className="ghost" disabled>
              Seleccionar página
            </button>
            <button type="button" className="ghost" disabled>
              Limpiar selección
            </button>
          </div>
        </div>
        <EmptyTable
          columns={["", "Nombre", "Correo", "Eventos en los que participó", "Acciones"]}
          message="Todavía no hay contactos. Aparecen cuando alguien se inscribe o cuando los usas como audiencia."
        />
      </section>
    </div>
  );
}
