import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listOrganizationContacts } from "@/modules/contacts/list";
import { listOrganizationEvents } from "@/modules/events/crud";
import { EmptyTable, PageIntro } from "../listing";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; event?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const params = await searchParams;
  const eventId = params.event && params.event !== "all" ? params.event : "all";
  const [contacts, events] = await Promise.all([
    listOrganizationContacts(session.organizationId, { q: params.q, eventId }),
    listOrganizationEvents(session.organizationId),
  ]);

  return (
    <div className="stack">
      <PageIntro
        title="Contactos"
        lede="Participantes de todos los eventos de la organización."
      />
      <section className="card stack">
        <form className="filters" action="/admin/contacts">
          <label>
            Búsqueda
            <input
              name="q"
              type="search"
              placeholder="Buscar por nombre o correo"
              defaultValue={params.q ?? ""}
            />
          </label>
          <label>
            Eventos en los que participó
            <select name="event" defaultValue={eventId}>
              <option value="all">Todos los eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <button type="submit">Buscar</button>
            <a className="button ghost" href="/admin/contacts">
              Limpiar filtros
            </a>
          </div>
        </form>
        <div className="toolbar">
          <p className="hint">
            {contacts.length} contacto{contacts.length === 1 ? "" : "s"} encontrado
            {contacts.length === 1 ? "" : "s"}
          </p>
        </div>
        {contacts.length === 0 ? (
          <EmptyTable
            columns={["Nombre", "Correo", "Eventos en los que participó"]}
            message="Todavía no hay contactos. Aparecen cuando alguien se inscribe a un evento."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Eventos en los que participó</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.email}>
                    <td>
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td>{contact.email}</td>
                    <td>{contact.events.map((event) => event.name).join(", ")}</td>
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
