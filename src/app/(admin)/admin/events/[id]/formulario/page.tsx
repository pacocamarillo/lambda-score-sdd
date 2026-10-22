import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedEvent } from "@/modules/events/crud";
import { deleteFormField, listFormFields, saveFormField } from "@/modules/events/form";
import {
  loadMtbCategorySelections,
  mtbSelectionsFromFormData,
  saveMtbCategories,
} from "@/modules/events/mtb-categories";
import {
  loadRunningCategorySelections,
  runningSelectionsFromFormData,
  saveRunningCategories,
} from "@/modules/events/running-categories";
import {
  loadSpecialCategorySelections,
  saveSpecialCategories,
  specialSelectionsFromFormData,
} from "@/modules/events/special-categories";
import type { FormFieldType } from "@/modules/events/types";
import { EventNav } from "../../event-nav";
import { MtbCategoriesField } from "../../mtb-categories-field";
import { RunningCategoriesField } from "../../running-categories-field";
import { SpecialCategoriesField } from "../../special-categories-field";

export default async function EventFormPage({
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
  const fields = await listFormFields(id);
  const mtbSelections = await loadMtbCategorySelections(id);
  const runningSelections = await loadRunningCategorySelections(id);
  const specialSelections = await loadSpecialCategorySelections(id);
  const canEdit = session.role === "owner" || session.role === "admin";

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
    const existing = await listFormFields(id);
    const result = await saveFormField(id, current.organizationId, {
      label: String(formData.get("label") ?? ""),
      fieldType: String(formData.get("fieldType") ?? "text") as FormFieldType,
      required: formData.get("required") === "on",
      uniqueInEvent: formData.get("uniqueInEvent") === "on",
      options,
      sortOrder: Number(formData.get("sortOrder") ?? existing.length),
    });
    if (!result.ok) redirect(`/admin/events/${id}/formulario?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}/formulario?saved=1`);
  }

  async function saveMtb(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await saveMtbCategories(id, current.organizationId, mtbSelectionsFromFormData(formData));
    if (!result.ok) redirect(`/admin/events/${id}/formulario?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}/formulario?saved=1`);
  }

  async function saveRunning(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await saveRunningCategories(
      id,
      current.organizationId,
      runningSelectionsFromFormData(formData),
    );
    if (!result.ok) redirect(`/admin/events/${id}/formulario?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}/formulario?saved=1`);
  }

  async function saveSpecial(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const result = await saveSpecialCategories(
      id,
      current.organizationId,
      specialSelectionsFromFormData(formData),
    );
    if (!result.ok) redirect(`/admin/events/${id}/formulario?error=${encodeURIComponent(result.message)}`);
    redirect(`/admin/events/${id}/formulario?saved=1`);
  }

  async function remove(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const fieldId = String(formData.get("fieldId") ?? "");
    await deleteFormField(id, current.organizationId, fieldId);
    redirect(`/admin/events/${id}/formulario?saved=1`);
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href={`/admin/events/${id}`}>{event.name}</Link>
          </p>
          <h1>Formulario</h1>
          <p className="lede">Campos propios además de nombre, apellido, nacimiento, documento y correo.</p>
        </div>
      </header>
      <EventNav eventId={id} current="/formulario" />
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados.</p> : null}

      <section className="card">
        {fields.length === 0 ? (
          <p className="empty">Sin campos propios. El formulario público usa solo los datos base.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Etiqueta</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Obligatorio</th>
                  <th scope="col">Único</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id}>
                    <td>
                      {field.label}
                      {field.options.length > 0 ? (
                        <div className="hint">{field.options.join(", ")}</div>
                      ) : null}
                    </td>
                    <td>{field.fieldType}</td>
                    <td>{field.required ? "Sí" : "No"}</td>
                    <td>{field.uniqueInEvent ? "Sí" : "No"}</td>
                    <td>
                      {canEdit ? (
                        <form action={remove}>
                          <input type="hidden" name="fieldId" value={field.id} />
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
          <form action={saveMtb} className="stack">
            <MtbCategoriesField selections={mtbSelections} />
            <button type="submit">Guardar categorías MTB</button>
          </form>
        </section>
      ) : null}

      {canEdit ? (
        <section className="card">
          <form action={saveRunning} className="stack">
            <RunningCategoriesField selections={runningSelections} />
            <button type="submit">Guardar categorías Running</button>
          </form>
        </section>
      ) : null}

      {canEdit ? (
        <section className="card">
          <form action={saveSpecial} className="stack">
            <SpecialCategoriesField selections={specialSelections} />
            <button type="submit">Guardar categorías especiales</button>
          </form>
        </section>
      ) : null}

      {canEdit ? (
        <section className="card">
          <h2>Agregar campo</h2>
          <form action={save} className="stack">
            <label>
              Etiqueta
              <input name="label" required />
            </label>
            <label>
              Tipo
              <select name="fieldType" defaultValue="text">
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="select">Lista</option>
                <option value="radio">Opción única</option>
                <option value="textarea">Texto largo</option>
                <option value="file">Archivo</option>
                <option value="heading">Separador</option>
              </select>
            </label>
            <label>
              Opciones (separadas por coma)
              <input name="options" placeholder="S, M, L" />
            </label>
            <label className="switch-row">
              <input name="required" type="checkbox" />
              Obligatorio
            </label>
            <label className="switch-row">
              <input name="uniqueInEvent" type="checkbox" />
              Único en el evento
            </label>
            <button type="submit">Guardar campo</button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
