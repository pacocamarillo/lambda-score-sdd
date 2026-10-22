import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  deleteCompetition,
  listCompetitionsWithAvailability,
  saveCompetition,
} from "@/modules/events/competitions";
import { getOwnedEvent } from "@/modules/events/crud";
import { EventNav } from "../../event-nav";

export default async function EventCompetitionsPage({
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
  const comps = await listCompetitionsWithAvailability(id);
  const canEdit = session.role === "owner" || session.role === "admin";

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const unlimited = formData.get("unlimited") === "on";
    const capacityRaw = String(formData.get("capacity") ?? "");
    const mode = formData.get("mode") === "team" ? "team" : "individual";
    const result = await saveCompetition(
      id,
      current.organizationId,
      {
        name: String(formData.get("name") ?? ""),
        priceCents: Math.round(Number(formData.get("price") ?? 0) * 100),
        capacity: unlimited ? null : Number(capacityRaw || 0),
        mode,
        teamMinSize: mode === "team" ? Number(formData.get("teamMinSize") ?? 2) : null,
        teamNameRequired: formData.get("teamNameRequired") === "on",
        priceMode: formData.get("priceMode") === "per_team" ? "per_team" : "per_person",
        includedItems: String(formData.get("includedItems") ?? "") || null,
        bibColor: String(formData.get("bibColor") ?? "") || null,
        cashOnEvent: formData.get("cashOnEvent") === "on",
      },
      String(formData.get("competitionId") ?? "") || undefined,
    );
    if (!result.ok) {
      redirect(`/admin/events/${id}/competitions?error=${encodeURIComponent(result.message)}`);
    }
    redirect(`/admin/events/${id}/competitions?saved=1`);
  }

  async function remove(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const competitionId = String(formData.get("competitionId") ?? "");
    const result = await deleteCompetition(id, current.organizationId, competitionId);
    if (!result.ok) {
      redirect(`/admin/events/${id}/competitions?error=${encodeURIComponent(result.message)}`);
    }
    redirect(`/admin/events/${id}/competitions?saved=1`);
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href={`/admin/events/${id}`}>{event.name}</Link>
          </p>
          <h1>Competencias</h1>
          <p className="lede">Nombre, precio MXN, cupo o ilimitado, individual o equipo.</p>
        </div>
      </header>
      <EventNav eventId={id} current="/competitions" />
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados.</p> : null}

      <section className="card">
        {comps.length === 0 ? (
          <p className="empty">Todavía no hay competencias. Sin al menos una, el evento no se publica.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Cupo</th>
                  <th scope="col">Modo</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((competition) => (
                  <tr key={competition.id}>
                    <td>{competition.name}</td>
                    <td>${(competition.priceCents / 100).toFixed(2)} MXN</td>
                    <td>
                      {competition.capacity == null
                        ? `Ilimitado (${competition.used})`
                        : `${competition.used} / ${competition.capacity}${competition.full ? " (llena)" : ""}`}
                    </td>
                    <td>{competition.mode === "team" ? "Equipo" : "Individual"}</td>
                    <td>
                      {canEdit ? (
                        <form action={remove}>
                          <input type="hidden" name="competitionId" value={competition.id} />
                          <button type="submit" className="ghost">
                            Eliminar
                          </button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canEdit ? (
        <section className="card">
          <h2>Agregar competencia</h2>
          <form action={save} className="stack">
            <label>
              Nombre
              <input name="name" required placeholder="10K" />
            </label>
            <label>
              Precio (MXN)
              <input name="price" type="number" min={0} step="0.01" defaultValue={0} required />
            </label>
            <label>
              Cupo
              <input name="capacity" type="number" min={0} defaultValue={100} />
            </label>
            <label className="switch-row">
              <input name="unlimited" type="checkbox" />
              Cupo ilimitado
            </label>
            <label>
              Modo
              <select name="mode" defaultValue="individual">
                <option value="individual">Individual</option>
                <option value="team">Equipo</option>
              </select>
            </label>
            <label>
              Mínimo de integrantes (equipo)
              <input name="teamMinSize" type="number" min={2} defaultValue={2} />
            </label>
            <label className="switch-row">
              <input name="teamNameRequired" type="checkbox" />
              Nombre de equipo obligatorio
            </label>
            <label>
              Precio de equipo
              <select name="priceMode" defaultValue="per_person">
                <option value="per_person">Por persona</option>
                <option value="per_team">Por equipo</option>
              </select>
            </label>
            <label>
              Artículos incluidos
              <input name="includedItems" placeholder="Medalla, playera" />
            </label>
            <label>
              Color de folio
              <input name="bibColor" placeholder="#ff6600" />
            </label>
            <label className="switch-row">
              <input name="cashOnEvent" type="checkbox" />
              Efectivo el día del evento (dato; el cobro es de pagos)
            </label>
            <button type="submit">Guardar competencia</button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
