import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createEvent, listOrganizationEvents } from "@/modules/events/crud";
import { EmptyTable, PageIntro } from "../listing";

function statusLabel(status: string) {
  if (status === "published") return "Publicado";
  if (status === "cancelled") return "Cancelado";
  return "Borrador";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
  }).format(value);
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const params = await searchParams;
  const status =
    params.status === "draft" || params.status === "published" || params.status === "cancelled"
      ? params.status
      : "all";
  const rows = await listOrganizationEvents(session.organizationId, {
    q: params.q,
    status,
    from: params.from,
    to: params.to,
  });

  async function create(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await createEvent(current.organizationId, {
      name: String(formData.get("name") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      eventDate: new Date(String(formData.get("eventDate") ?? "")),
      description: String(formData.get("description") ?? ""),
      isFree: formData.get("isFree") === "on",
    });
    if (!result.ok) redirect(`/admin/events?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${result.eventId}`);
  }

  return (
    <div className="stack">
      <PageIntro
        title="Eventos"
        lede="Borrador, publicado o cancelado. Publicar pide nombre, fecha, lugar y al menos una competencia."
        action={
          session.role === "owner" || session.role === "admin" ? (
            <a className="button" href="#crear">
              Crear evento
            </a>
          ) : null
        }
      />
      {params.error ? <p className="error">{params.error}</p> : null}

      {(session.role === "owner" || session.role === "admin") && (
        <section className="card" id="crear">
          <h2>Nuevo evento</h2>
          <form action={create} className="stack">
            <label>
              Nombre
              <input name="name" required placeholder="Carrera 10K" />
            </label>
            <label>
              Fecha
              <input name="eventDate" type="datetime-local" required />
            </label>
            <label>
              Lugar
              <input name="venue" required placeholder="Parque central" />
            </label>
            <label>
              Descripción
              <textarea name="description" placeholder="Breve descripción" />
            </label>
            <label className="switch-row">
              <input name="isFree" type="checkbox" />
              Evento gratuito (confirma sin pago)
            </label>
            <button type="submit">Crear borrador</button>
          </form>
        </section>
      )}

      <section className="card">
        <form className="filters" action="/admin/events">
          <label>
            Buscar
            <input name="q" type="search" defaultValue={params.q ?? ""} placeholder="Buscar eventos" />
          </label>
          <label>
            Estado
            <select name="status" defaultValue={status}>
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>
          <label>
            Desde
            <input name="from" type="date" defaultValue={params.from ?? ""} />
          </label>
          <label>
            Hasta
            <input name="to" type="date" defaultValue={params.to ?? ""} />
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
        {rows.length === 0 ? (
          <EmptyTable
            columns={["Evento", "Fecha", "Estado", "Inscripciones", "Acciones"]}
            message="Todavía no hay eventos. El primero muestra lugar, fecha, estado e inscripciones, y desde ahí se edita, se ven participantes, la página, las estadísticas, los resultados y el cronometraje."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Inscripciones</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                      <div className="hint">{row.venue}</div>
                    </td>
                    <td>{formatDate(row.eventDate)}</td>
                    <td>{statusLabel(row.status)}</td>
                    <td>{row.registrationCount}</td>
                    <td>
                      <div className="inline-actions">
                        <Link href={`/admin/events/${row.id}`}>Editar</Link>
                        <Link href={`/admin/events/${row.id}/participantes`}>Participantes</Link>
                        <Link href={`/eventos/${row.id}`}>Página</Link>
                        <span className="hint">Estadísticas</span>
                        <span className="hint">Resultados</span>
                        <span className="hint">Cronometrar</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
