import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCompetitions } from "@/modules/events/competitions";
import { deleteEvent, getOwnedEvent, updateEvent } from "@/modules/events/crud";
import {
  cancelEvent,
  describePublishBlockers,
  getPublishBlockers,
  publishEvent,
  setRegistrationOpen,
} from "@/modules/events/publish";
import { EventNav } from "../event-nav";

function toLocalInput(value: Date | null | undefined) {
  if (!value) return "";
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const { id } = await params;
  const query = await searchParams;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) redirect("/admin/events");
  const comps = await listCompetitions(id);
  const blockers = await getPublishBlockers(id);
  const blockerMessages = describePublishBlockers(blockers);
  const canEdit = session.role === "owner" || session.role === "admin";

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const deadlineRaw = String(formData.get("registrationDeadline") ?? "");
    const result = await updateEvent(id, current.organizationId, {
      name: String(formData.get("name") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      eventDate: new Date(String(formData.get("eventDate") ?? "")),
      description: String(formData.get("description") ?? ""),
      noticeHtml: String(formData.get("noticeHtml") ?? "") || null,
      registrationDeadline: deadlineRaw ? new Date(deadlineRaw) : null,
      isFree: formData.get("isFree") === "on",
      bibScope: formData.get("bibScope") === "event" ? "event" : "competition",
      bibStart: Number(formData.get("bibStart") ?? 1),
      bibPrefix: String(formData.get("bibPrefix") ?? ""),
      autoAssignBib: formData.get("autoAssignBib") === "on",
      showBibOnConfirmation: formData.get("showBibOnConfirmation") === "on",
    });
    if (!result.ok) redirect(`/admin/events/${id}?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}?saved=1`);
  }

  async function publish() {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await publishEvent(id, current.organizationId);
    if (!result.ok) redirect(`/admin/events/${id}?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}?saved=1`);
  }

  async function openRegistration() {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await setRegistrationOpen(id, current.organizationId, true);
    if (!result.ok) redirect(`/admin/events/${id}?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}?saved=1`);
  }

  async function closeRegistration() {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await setRegistrationOpen(id, current.organizationId, false);
    if (!result.ok) redirect(`/admin/events/${id}?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}?saved=1`);
  }

  async function cancel() {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    await cancelEvent(id, current.organizationId);
    redirect(`/admin/events/${id}?saved=1`);
  }

  async function remove() {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await deleteEvent(id, current.organizationId);
    if (!result.ok) redirect(`/admin/events/${id}?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/events");
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href="/admin/events">Eventos</Link>
          </p>
          <h1>{event.name}</h1>
          <p className="lede">
            Estado: {event.status}. Inscripción: {event.registrationOpen ? "abierta" : "cerrada"}.
          </p>
        </div>
        <Link className="button ghost" href={`/eventos/${event.id}`}>
          Ver página
        </Link>
      </header>

      <EventNav eventId={id} current="" />

      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados.</p> : null}

      <section className="card">
        <h2>Resumen</h2>
        <ul className="feature-list">
          <li>
            <span>Fecha</span>
            <span>{event.eventDate.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</span>
          </li>
          <li>
            <span>Cierre de inscripción</span>
            <span>
              {event.registrationDeadline
                ? event.registrationDeadline.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })
                : "Sin fecha límite"}
            </span>
          </li>
          <li>
            <span>Inscripción abierta</span>
            <span>{event.registrationOpen ? "Sí" : "No"}</span>
          </li>
          <li>
            <span>Competencias</span>
            <span>{comps.length}</span>
          </li>
          <li>
            <span>Medios de pago</span>
            <span>{event.isFree ? "Gratuito" : "Pendiente de la feature de pagos"}</span>
          </li>
        </ul>
        {blockerMessages.length > 0 && event.status === "draft" ? (
          <p className="hint">Para publicar: {blockerMessages.join(" ")}</p>
        ) : null}
        {canEdit ? (
          <div className="inline-actions">
            {event.status === "draft" ? (
              <form action={publish}>
                <button type="submit">Publicar</button>
              </form>
            ) : null}
            {event.status === "published" && !event.registrationOpen ? (
              <form action={openRegistration}>
                <button type="submit">Abrir inscripción</button>
              </form>
            ) : null}
            {event.status === "published" && event.registrationOpen ? (
              <form action={closeRegistration}>
                <button type="submit" className="ghost">
                  Cerrar inscripción
                </button>
              </form>
            ) : null}
            {event.status !== "cancelled" ? (
              <form action={cancel}>
                <button type="submit" className="ghost">
                  Cancelar evento
                </button>
              </form>
            ) : null}
            <form action={remove}>
              <button type="submit" className="ghost">
                Eliminar
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Información</h2>
        <form action={save} className="stack">
          <label>
            Nombre
            <input name="name" defaultValue={event.name} required disabled={!canEdit} />
          </label>
          <label>
            Fecha
            <input
              name="eventDate"
              type="datetime-local"
              defaultValue={toLocalInput(event.eventDate)}
              required
              disabled={!canEdit}
            />
          </label>
          <label>
            Lugar
            <input name="venue" defaultValue={event.venue} required disabled={!canEdit} />
          </label>
          <label>
            Descripción
            <textarea name="description" defaultValue={event.description} disabled={!canEdit} />
          </label>
          <label>
            Aviso en la inscripción (HTML)
            <textarea name="noticeHtml" defaultValue={event.noticeHtml ?? ""} disabled={!canEdit} />
          </label>
          <label>
            Fin de inscripción
            <input
              name="registrationDeadline"
              type="datetime-local"
              defaultValue={toLocalInput(event.registrationDeadline)}
              disabled={!canEdit}
            />
          </label>
          <label className="switch-row">
            <input name="isFree" type="checkbox" defaultChecked={event.isFree} disabled={!canEdit} />
            Evento gratuito
          </label>
          <label>
            Alcance del folio
            <select name="bibScope" defaultValue={event.bibScope} disabled={!canEdit}>
              <option value="competition">Por competencia</option>
              <option value="event">Todo el evento</option>
            </select>
          </label>
          <label>
            Folio inicial
            <input name="bibStart" type="number" min={1} defaultValue={event.bibStart} disabled={!canEdit} />
          </label>
          <label>
            Prefijo de folio
            <input name="bibPrefix" defaultValue={event.bibPrefix} disabled={!canEdit} />
          </label>
          <label className="switch-row">
            <input
              name="autoAssignBib"
              type="checkbox"
              defaultChecked={event.autoAssignBib}
              disabled={!canEdit}
            />
            Asignar folio automáticamente al confirmar
          </label>
          <label className="switch-row">
            <input
              name="showBibOnConfirmation"
              type="checkbox"
              defaultChecked={event.showBibOnConfirmation}
              disabled={!canEdit}
            />
            Mostrar folio en la confirmación
          </label>
          {canEdit ? <button type="submit">Guardar</button> : null}
        </form>
      </section>
    </div>
  );
}
