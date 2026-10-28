import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { deleteAddOn, hideAddOn, listAddOns, saveAddOn } from "@/modules/events/add-ons";
import { getOwnedEvent } from "@/modules/events/crud";
import { EventNav } from "../../event-nav";

export default async function EventAddOnsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; warn?: string; edit?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const { id } = await params;
  const query = await searchParams;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) redirect("/admin/events");
  const items = await listAddOns(id);
  const canEdit = session.role === "owner" || session.role === "admin";
  const editing = query.edit ? items.find((item) => item.id === query.edit) : undefined;

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const options = String(formData.get("options") ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const unlimited = formData.get("unlimitedStock") === "on";
    const result = await saveAddOn(id, current.organizationId, {
      name: String(formData.get("name") ?? ""),
      options,
      priceCents: Math.round(Number(formData.get("price") ?? 0) * 100),
      stock: unlimited ? null : Number(formData.get("stock") ?? 0),
      required: formData.get("required") === "on",
      visible: formData.get("visible") !== "off",
      includedInCompetition: formData.get("includedInCompetition") === "on",
    });
    if (!result.ok) {
      const editQuery = addOnId ? `&edit=${encodeURIComponent(addOnId)}` : "";
      redirect(`/admin/events/${id}/adicionales?error=${encodeURIComponent(result.message)}${editQuery}`);
    }
    const warn = "warnHistory" in result && result.warnHistory ? "&warn=1" : "";
    redirect(`/admin/events/${id}/adicionales?saved=1${warn}`);
  }

  async function hide(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    await hideAddOn(id, current.organizationId, String(formData.get("addOnId") ?? ""));
    redirect(`/admin/events/${id}/adicionales?saved=1`);
  }

  async function remove(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await deleteAddOn(id, current.organizationId, String(formData.get("addOnId") ?? ""));
    if (!result.ok) {
      redirect(`/admin/events/${id}/adicionales?error=${encodeURIComponent(result.message)}`);
    }
    redirect(`/admin/events/${id}/adicionales?saved=1`);
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href={`/admin/events/${id}`}>{event.name}</Link>
          </p>
          <h1>Adicionales</h1>
          <p className="lede">Opciones, precio, stock y visibilidad. Ocultar no borra el historial.</p>
        </div>
      </header>
      <EventNav eventId={id} current="/adicionales" />
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados.</p> : null}
      {query.warn ? (
        <p className="banner">Este adicional ya tiene elecciones. Los cambios afectan reportes e historial.</p>
      ) : null}
      {query.edit && !editing ? <p className="error">No se encontró el adicional a editar.</p> : null}

      <section className="card">
        {items.length === 0 ? (
          <p className="empty">Sin adicionales. Quien se inscribe solo ve la competencia.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Visible</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      {item.required ? " (obligatorio)" : ""}
                    </td>
                    <td>${(item.priceCents / 100).toFixed(2)}</td>
                    <td>{item.stock == null ? "Ilimitado" : item.stock}</td>
                    <td>{item.visible ? "Sí" : "Oculto"}</td>
                    <td>
                      {canEdit ? (
                        <div className="inline-actions">
                          <Link href={`/admin/events/${id}/adicionales?edit=${item.id}`}>Editar</Link>
                          {item.visible ? (
                            <form action={hide}>
                              <input type="hidden" name="addOnId" value={item.id} />
                              <button type="submit" className="ghost">
                                Ocultar
                              </button>
                            </form>
                          ) : null}
                          <form action={remove}>
                            <input type="hidden" name="addOnId" value={item.id} />
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
          <h2>{editing ? "Editar adicional" : "Agregar adicional"}</h2>
          <form action={save} className="stack" key={editing?.id ?? "new"}>
            {editing ? <input type="hidden" name="addOnId" value={editing.id} /> : null}
            {editing && !editing.visible ? <input type="hidden" name="visible" value="off" /> : null}
            <label>
              Nombre
              <input name="name" required placeholder="Playera" defaultValue={editing?.name ?? ""} />
            </label>
            <label>
              Opciones (separadas por coma)
              <input
                name="options"
                placeholder="S, M, L"
                defaultValue={editing?.options?.join(", ") ?? ""}
              />
            </label>
            <label>
              Precio (MXN)
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={editing ? (editing.priceCents / 100).toFixed(2) : 0}
              />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min={0} defaultValue={editing?.stock ?? 50} />
            </label>
            <label className="switch-row">
              <input
                name="unlimitedStock"
                type="checkbox"
                defaultChecked={editing ? editing.stock == null : false}
              />
              Stock ilimitado
            </label>
            <label className="switch-row">
              <input name="required" type="checkbox" defaultChecked={editing?.required ?? false} />
              Obligatorio
            </label>
            <label className="switch-row">
              <input
                name="includedInCompetition"
                type="checkbox"
                defaultChecked={editing?.includedInCompetition ?? false}
              />
              Incluido en la competencia
            </label>
            <button type="submit">Guardar adicional</button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
