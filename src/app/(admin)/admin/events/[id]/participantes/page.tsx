import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedEvent } from "@/modules/events/crud";
import { listEventRegistrations } from "@/modules/events/register";
import { EventNav } from "../../event-nav";

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  return "Pendiente de pago";
}

export default async function EventParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const { id } = await params;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) redirect("/admin/events");
  const rows = await listEventRegistrations(id, session.organizationId);

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href={`/admin/events/${id}`}>{event.name}</Link>
          </p>
          <h1>Participantes</h1>
          <p className="lede">Inscripciones activas del evento.</p>
        </div>
        {rows.length > 0 ? (
          <p>
            <a className="button" href={`/admin/events/${id}/participantes/export`}>
              Descargar Excel
            </a>
          </p>
        ) : null}
      </header>
      <EventNav eventId={id} current="/participantes" />
      <section className="card">
        {rows.length === 0 ? (
          <p className="empty">Todavía no hay inscripciones.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Competencia</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Folio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.firstName} {row.lastName}
                    </td>
                    <td>{row.email}</td>
                    <td>{row.competitionName}</td>
                    <td>{statusLabel(row.status)}</td>
                    <td>{row.bib ?? "—"}</td>
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
