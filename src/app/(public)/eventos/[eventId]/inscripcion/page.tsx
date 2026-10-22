import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listAddOns, visibleAddOnsForCompetition } from "@/modules/events/add-ons";
import { listCompetitionsWithAvailability } from "@/modules/events/competitions";
import { getPublicEvent, registrationIsOpen } from "@/modules/events/crud";
import { fieldsForCompetition, listFormFields } from "@/modules/events/form";
import { registerParticipant } from "@/modules/events/register";
import type { DocumentType } from "@/modules/events/types";

export default async function InscripcionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ competitionId?: string; error?: string; ok?: string; status?: string; bib?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getPublicEvent(eventId);
  if (!event) notFound();
  if (!registrationIsOpen(event)) {
    return (
      <div className="stack auth-card">
        <h1>Inscripción cerrada</h1>
        <p className="lede">Puedes ver la ficha del evento, pero ya no se aceptan registros.</p>
        <Link href={`/eventos/${eventId}`}>Volver al evento</Link>
      </div>
    );
  }

  const comps = (await listCompetitionsWithAvailability(eventId)).filter((c) => c.mode === "individual");
  const selectedId = query.competitionId ?? comps[0]?.id ?? "";
  const selected = comps.find((c) => c.id === selectedId) ?? null;
  const fields = selected ? fieldsForCompetition(await listFormFields(eventId), selected.id) : [];
  const addOns = selected
    ? visibleAddOnsForCompetition(await listAddOns(eventId), selected.id)
    : [];

  async function submit(formData: FormData) {
    "use server";
    const competitionId = String(formData.get("competitionId") ?? "");
    const answers: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("field_")) answers[key.slice(6)] = String(value);
    }

    const currentAddOns = visibleAddOnsForCompetition(await listAddOns(eventId), competitionId);
    const selections = currentAddOns.flatMap((addOn) => {
      const chosen = formData.get(`addon_${addOn.id}`);
      if (!chosen || chosen === "") return [];
      const option = addOn.options.length > 0 ? String(chosen) : undefined;
      return [{ addOnId: addOn.id, option: option === "on" ? undefined : option }];
    });

    const published = await getPublicEvent(eventId);
    const result = await registerParticipant({
      eventId,
      competitionId,
      acceptedTerms: formData.get("acceptedTerms") === "on",
      acceptedWaiver: formData.get("acceptedWaiver") === "on",
      addOnSelections: selections,
      participant: {
        email: String(formData.get("email") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        birthDate: String(formData.get("birthDate") ?? ""),
        documentType: String(formData.get("documentType") ?? "ine") as DocumentType,
        documentNumber: String(formData.get("documentNumber") ?? ""),
        answers,
      },
    });

    if (!result.ok) {
      redirect(
        `/eventos/${eventId}/inscripcion?competitionId=${encodeURIComponent(competitionId)}&error=${encodeURIComponent(result.message)}`,
      );
    }
    const bib =
      result.bib && published?.showBibOnConfirmation ? `&bib=${encodeURIComponent(result.bib)}` : "";
    redirect(
      `/eventos/${eventId}/inscripcion?ok=1&status=${encodeURIComponent(result.status)}${bib}`,
    );
  }

  if (query.ok) {
    return (
      <div className="stack auth-card">
        <h1>Inscripción recibida</h1>
        <p className="lede">
          {query.status === "confirmed"
            ? "Tu inscripción quedó confirmada."
            : "Tu inscripción quedó pendiente de pago."}
        </p>
        {query.bib ? <p>Folio: {query.bib}</p> : null}
        <Link href={`/eventos/${eventId}`}>Volver al evento</Link>
      </div>
    );
  }

  return (
    <div className="stack auth-card">
      <header>
        <p className="hint">
          <Link href={`/eventos/${eventId}`}>{event.name}</Link>
        </p>
        <h1>Inscripción</h1>
        <p className="lede">Completa tus datos, elige competencia y acepta términos y renuncia.</p>
      </header>
      {query.error ? <p className="error">{query.error}</p> : null}
      {event.noticeHtml ? (
        <section className="card" dangerouslySetInnerHTML={{ __html: event.noticeHtml }} />
      ) : null}

      {comps.length === 0 ? (
        <p className="empty">No hay competencias individuales abiertas. Si es por equipo, usa el enlace de equipo.</p>
      ) : (
        <form action={submit} className="stack card">
          <label>
            Competencia
            <select name="competitionId" defaultValue={selectedId} required>
              {comps.map((competition) => (
                <option key={competition.id} value={competition.id} disabled={competition.full}>
                  {competition.name}
                  {competition.full ? " (sin cupo)" : ` · $${(competition.priceCents / 100).toFixed(2)}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nombre
            <input name="firstName" required />
          </label>
          <label>
            Apellido
            <input name="lastName" required />
          </label>
          <label>
            Fecha de nacimiento
            <input name="birthDate" type="date" required />
          </label>
          <label>
            Tipo de documento
            <select name="documentType" defaultValue="ine">
              <option value="ine">Identificación oficial</option>
              <option value="curp">CURP</option>
              <option value="rfc">RFC</option>
              <option value="other">Otro</option>
            </select>
          </label>
          <label>
            Número de documento
            <input name="documentNumber" required />
          </label>
          <label>
            Correo
            <input name="email" type="email" required />
          </label>

          {fields.map((field) =>
            field.fieldType === "heading" ? (
              <h3 key={field.id}>{field.label}</h3>
            ) : (
              <label key={field.id}>
                {field.label}
                {field.fieldType === "textarea" ? (
                  <textarea name={`field_${field.id}`} required={field.required} />
                ) : field.fieldType === "select" || field.fieldType === "radio" ? (
                  <select name={`field_${field.id}`} required={field.required} defaultValue="">
                    <option value="" disabled>
                      Elige
                    </option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={`field_${field.id}`}
                    type={field.fieldType === "number" ? "number" : field.fieldType === "file" ? "text" : "text"}
                    required={field.required}
                    placeholder={field.fieldType === "file" ? "Clave del archivo" : undefined}
                  />
                )}
              </label>
            ),
          )}

          {addOns.map((addOn) => (
            <label key={addOn.id} className={addOn.options.length === 0 ? "switch-row" : undefined}>
              {addOn.options.length === 0 ? (
                <>
                  <input name={`addon_${addOn.id}`} type="checkbox" required={addOn.required} />
                  {addOn.name} (+${(addOn.priceCents / 100).toFixed(2)})
                </>
              ) : (
                <>
                  {addOn.name} (+${(addOn.priceCents / 100).toFixed(2)})
                  <select name={`addon_${addOn.id}`} required={addOn.required} defaultValue="">
                    <option value="">{addOn.required ? "Elige" : "Sin adicional"}</option>
                    {addOn.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </label>
          ))}

          <label className="switch-row">
            <input name="acceptedTerms" type="checkbox" required />
            Acepto los términos
          </label>
          <label className="switch-row">
            <input name="acceptedWaiver" type="checkbox" required />
            Acepto la renuncia de responsabilidad
          </label>
          <button type="submit">Enviar inscripción</button>
        </form>
      )}
    </div>
  );
}
