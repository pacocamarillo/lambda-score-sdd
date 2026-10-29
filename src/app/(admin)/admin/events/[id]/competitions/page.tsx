import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  deleteCompetition,
  listCompetitionsWithAvailability,
  saveCompetition,
} from "@/modules/events/competitions";
import { getOwnedEvent } from "@/modules/events/crud";
import { formatIncludedItemsSummary, includedItemsFromFormData } from "@/modules/events/included-items";
import { IncludedItemsField } from "../../included-items-field";
import { EventNav } from "../../event-nav";

export default async function EventCompetitionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; edit?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const { id } = await params;
  const query = await searchParams;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) redirect("/admin/events");
  const comps = await listCompetitionsWithAvailability(id);
  const canEdit = session.role === "owner" || session.role === "admin";
  const editing = query.edit ? comps.find((competition) => competition.id === query.edit) : undefined;

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const unlimited = formData.get("unlimited") === "on";
    const capacityRaw = String(formData.get("capacity") ?? "");
    const mode = formData.get("mode") === "team" ? "team" : "individual";
    const rawCompetitionId = String(formData.get("competitionId") ?? "").trim();
    const competitionId = rawCompetitionId || undefined;
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
        includedItems: includedItemsFromFormData(formData),
        bibColor: String(formData.get("bibColor") ?? "") || null,
        cashOnEvent: false,
      },
      competitionId,
    );
    if (!result.ok) {
      const editQuery = competitionId ? `&edit=${encodeURIComponent(competitionId)}` : "";
      redirect(`/admin/events/${id}/competitions?error=${encodeURIComponent(result.message)}${editQuery}`);
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
      {query.edit && !editing ? <p className="error">No se encontró la competencia a editar.</p> : null}

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
                  <th scope="col">Artículos</th>
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
                    <td>{formatIncludedItemsSummary(competition.includedItems)}</td>
                    <td>{competition.mode === "team" ? "Equipo" : "Individual"}</td>
                    <td>
                      {canEdit ? (
                        <div className="inline-actions">
                          <Link href={`/admin/events/${id}/competitions?edit=${competition.id}`}>Editar</Link>
                          <form action={remove}>
                            <input type="hidden" name="competitionId" value={competition.id} />
                            <button type="submit" className="ghost">
                              Eliminar
                            </button>
                          </form>
                        </div>
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
          <h2>{editing ? "Editar competencia" : "Agregar competencia"}</h2>
          <form action={save} className="stack" key={editing?.id ?? "new"}>
            {editing ? <input type="hidden" name="competitionId" value={editing.id} /> : null}
            <label>
              Nombre
              <input name="name" required placeholder="10K" defaultValue={editing?.name ?? ""} />
            </label>
            <label>
              Precio (MXN)
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={editing ? (editing.priceCents / 100).toFixed(2) : 0}
                required
              />
            </label>
            <label>
              Cupo
              <input
                name="capacity"
                type="number"
                min={0}
                defaultValue={editing?.capacity ?? 100}
              />
            </label>
            <label className="switch-row">
              <input
                name="unlimited"
                type="checkbox"
                defaultChecked={editing ? editing.capacity == null : false}
              />
              Cupo ilimitado
            </label>
            <label>
              Modo
              <select name="mode" defaultValue={editing?.mode ?? "individual"}>
                <option value="individual">Individual</option>
                <option value="team">Equipo</option>
              </select>
            </label>
            <label>
              Mínimo de integrantes (equipo)
              <input
                name="teamMinSize"
                type="number"
                min={2}
                defaultValue={editing?.teamMinSize ?? 2}
              />
            </label>
            <label className="switch-row">
              <input
                name="teamNameRequired"
                type="checkbox"
                defaultChecked={editing?.teamNameRequired ?? false}
              />
              Nombre de equipo obligatorio
            </label>
            <label>
              Precio de equipo
              <select name="priceMode" defaultValue={editing?.priceMode ?? "per_person"}>
                <option value="per_person">Por persona</option>
                <option value="per_team">Por equipo</option>
              </select>
            </label>
            <IncludedItemsField initialValue={editing?.includedItems} />
            <label>
              Color de folio
              <input name="bibColor" placeholder="#ff6600" defaultValue={editing?.bibColor ?? ""} />
            </label>
            <div className="inline-actions">
              <button type="submit">{editing ? "Guardar cambios" : "Guardar competencia"}</button>
              {editing ? (
                <Link className="button ghost" href={`/admin/events/${id}/competitions`}>
                  Cancelar
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
