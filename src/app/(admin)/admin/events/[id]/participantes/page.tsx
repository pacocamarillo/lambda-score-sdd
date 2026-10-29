import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedEvent } from "@/modules/events/crud";
import { listCompetitions } from "@/modules/events/competitions";
import { GENDER_ANSWER_KEY, isCategoryFormField } from "@/modules/events/category-eligibility";
import { fieldsForCompetition, listFormFields } from "@/modules/events/form";
import { listRegistrationAddOns } from "@/modules/events/add-ons";
import {
  getEventRegistration,
  listEventRegistrations,
  resendRegistrationConfirmation,
  updateEventRegistration,
} from "@/modules/events/register";
import type { DocumentType, ParticipantGender } from "@/modules/events/types";
import { EventNav } from "../../event-nav";

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  return "Pendiente de pago";
}

function genderLabel(value: string | null | undefined) {
  if (value === "male") return "Varonil";
  if (value === "female") return "Femenil";
  return "—";
}

function toDateInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function categorySummary(answers: Record<string, unknown>, fields: Array<{ id: string; label: string }>) {
  const parts = fields
    .filter((field) => isCategoryFormField(field))
    .map((field) => String(answers[field.id] ?? "").trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export default async function EventParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; mailed?: string; edit?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const { id } = await params;
  const query = await searchParams;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) redirect("/admin/events");
  const canEdit = session.role === "owner" || session.role === "admin";
  const rows = await listEventRegistrations(id, session.organizationId);
  const competitions = await listCompetitions(id);
  const formFields = await listFormFields(id);
  const editing = query.edit ? await getEventRegistration(id, session.organizationId, query.edit) : null;
  const editingFields = editing
    ? fieldsForCompetition(formFields, editing.competitionId).filter((field) => field.fieldType !== "heading")
    : [];
  const editingAddOns = editing ? await listRegistrationAddOns(editing.id) : [];
  const categoryFields = formFields.filter((field) => isCategoryFormField(field));

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const registrationId = String(formData.get("registrationId") ?? "");
    const answers: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("field_")) answers[key.slice(6)] = String(value);
    }
    const result = await updateEventRegistration(id, current.organizationId, registrationId, {
      email: String(formData.get("email") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      gender: String(formData.get("gender") ?? "") as ParticipantGender,
      documentType: String(formData.get("documentType") ?? "other") as DocumentType,
      documentNumber: String(formData.get("documentNumber") ?? ""),
      competitionId: String(formData.get("competitionId") ?? ""),
      status: String(formData.get("status") ?? "pending_payment") as
        | "pending_payment"
        | "confirmed"
        | "cancelled",
      answers,
    });
    if (!result.ok) {
      redirect(
        `/admin/events/${id}/participantes?edit=${encodeURIComponent(registrationId)}&error=${encodeURIComponent(result.message)}`,
      );
    }
    redirect(`/admin/events/${id}/participantes?saved=1`);
  }

  async function resendMail(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const registrationId = String(formData.get("registrationId") ?? "");
    const result = await resendRegistrationConfirmation(id, current.organizationId, registrationId);
    if (!result.ok) {
      redirect(
        `/admin/events/${id}/participantes?edit=${encodeURIComponent(registrationId)}&error=${encodeURIComponent(result.message)}`,
      );
    }
    redirect(
      `/admin/events/${id}/participantes?edit=${encodeURIComponent(registrationId)}&mailed=1`,
    );
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="hint">
            <Link href={`/admin/events/${id}`}>{event.name}</Link>
          </p>
          <h1>Participantes</h1>
          <p className="lede">Inscripciones del evento con todos los datos capturados.</p>
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
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados.</p> : null}
      {query.mailed ? <p className="notice">Correo de confirmación reenviado.</p> : null}
      {query.edit && !editing ? <p className="error">No se encontró la inscripción a editar.</p> : null}

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
                  <th scope="col">Género</th>
                  <th scope="col">Nacimiento</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Competencia</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Folio</th>
                  {canEdit ? <th scope="col">Acciones</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.firstName} {row.lastName}
                    </td>
                    <td>{row.email}</td>
                    <td>{genderLabel(row.gender)}</td>
                    <td>{toDateInput(row.birthDate)}</td>
                    <td>
                      {row.documentType.toUpperCase()}
                      {row.documentNumber ? ` ${row.documentNumber}` : ""}
                    </td>
                    <td>{row.competitionName}</td>
                    <td>{categorySummary(row.answers ?? {}, categoryFields)}</td>
                    <td>{statusLabel(row.status)}</td>
                    <td>{row.bib ?? "—"}</td>
                    {canEdit ? (
                      <td>
                        <Link href={`/admin/events/${id}/participantes?edit=${row.id}`}>Editar</Link>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canEdit && editing ? (
        <section className="card">
          <h2>
            Editar participante: {editing.firstName} {editing.lastName}
          </h2>
          <form action={save} className="stack" key={editing.id}>
            <input type="hidden" name="registrationId" value={editing.id} />
            <label>
              Competencia
              <select name="competitionId" required defaultValue={editing.competitionId}>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nombre
              <input name="firstName" required defaultValue={editing.firstName} />
            </label>
            <label>
              Apellido
              <input name="lastName" required defaultValue={editing.lastName} />
            </label>
            <label>
              Correo
              <input name="email" type="email" required defaultValue={editing.email} />
            </label>
            <label>
              Género
              <select name="gender" required defaultValue={editing.gender ?? ""}>
                <option value="" disabled>
                  Elige
                </option>
                <option value="male">Varonil</option>
                <option value="female">Femenil</option>
              </select>
            </label>
            <label>
              Fecha de nacimiento
              <input name="birthDate" type="date" required defaultValue={toDateInput(editing.birthDate)} />
            </label>
            <label>
              Tipo de documento
              <select name="documentType" defaultValue={editing.documentType}>
                <option value="ine">INE</option>
                <option value="curp">CURP</option>
                <option value="rfc">RFC</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <label>
              Número de documento
              <input name="documentNumber" defaultValue={editing.documentNumber} />
            </label>
            <label>
              Estado
              <select name="status" defaultValue={editing.status}>
                <option value="pending_payment">Pendiente de pago</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </label>

            {editingFields.map((field) => {
              const current = String(editing.answers?.[field.id] ?? "");
              if (field.fieldType === "select" || field.fieldType === "radio") {
                return (
                  <label key={field.id}>
                    {field.label}
                    <select
                      name={`field_${field.id}`}
                      required={field.required}
                      defaultValue={current}
                    >
                      <option value="">{field.required ? "Elige" : "Sin valor"}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              if (field.fieldType === "textarea") {
                return (
                  <label key={field.id}>
                    {field.label}
                    <textarea name={`field_${field.id}`} required={field.required} defaultValue={current} />
                  </label>
                );
              }
              return (
                <label key={field.id}>
                  {field.label}
                  <input
                    name={`field_${field.id}`}
                    type={field.fieldType === "number" ? "number" : "text"}
                    required={field.required}
                    defaultValue={current}
                  />
                </label>
              );
            })}

            {editingAddOns.length > 0 ? (
              <div>
                <p className="hint">Adicionales elegidos</p>
                <ul>
                  {editingAddOns.map((addOn) => (
                    <li key={addOn.id}>
                      {addOn.name}
                      {addOn.option ? ` · ${addOn.option}` : ""}
                      {` · $${(addOn.priceCents / 100).toFixed(2)}`}
                      {!addOn.visible ? " (oculto)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="hint">
              Folio: {editing.bib ?? "—"}. Género guardado en respuestas:{" "}
              {genderLabel(String(editing.answers?.[GENDER_ANSWER_KEY] ?? editing.gender ?? ""))}.
            </p>

            <div className="inline-actions">
              <button type="submit">Guardar cambios</button>
              <Link href={`/admin/events/${id}/participantes`} className="ghost">
                Cancelar
              </Link>
              <button type="submit" formAction={resendMail} className="mail" formNoValidate>
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 7L2 7" />
                </svg>
                Reenviar correo
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
