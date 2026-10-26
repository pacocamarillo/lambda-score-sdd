import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listAddOns, visibleAddOnsForCompetition } from "@/modules/events/add-ons";
import { listCompetitionsWithAvailability } from "@/modules/events/competitions";
import { getPublicEvent, registrationIsOpen } from "@/modules/events/crud";
import { fieldsForCompetition, listFormFields } from "@/modules/events/form";
import { registerParticipant } from "@/modules/events/register";
import type { ParticipantGender } from "@/modules/events/types";
import { RegistrationForm } from "../../registration-form";

export default async function InscripcionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    competitionId?: string;
    error?: string;
    ok?: string;
    status?: string;
    bib?: string;
    registrationId?: string;
  }>;
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
        gender: String(formData.get("gender") ?? "") as ParticipantGender,
        documentType: "other",
        documentNumber: "",
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
      `/eventos/${eventId}/inscripcion?ok=1&status=${encodeURIComponent(result.status)}&registrationId=${encodeURIComponent(result.registrationId)}${bib}`,
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
        {query.registrationId ? (
          <a className="button" href={`/eventos/${eventId}/carta?registrationId=${encodeURIComponent(query.registrationId)}`}>
            Descargar carta de exoneración (PDF)
          </a>
        ) : null}
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
        <RegistrationForm
          eventId={eventId}
          eventDateIso={event.eventDate.toISOString()}
          selectedCompetitionId={selectedId}
          competitions={comps.map((competition) => ({
            id: competition.id,
            name: competition.name,
            priceCents: competition.priceCents,
            full: competition.full,
          }))}
          fields={fields.map((field) => ({
            id: field.id,
            label: field.label,
            fieldType: field.fieldType,
            required: field.required,
            options: field.options,
          }))}
          addOns={addOns.map((addOn) => ({
            id: addOn.id,
            name: addOn.name,
            priceCents: addOn.priceCents,
            required: addOn.required,
            options: addOn.options,
          }))}
          action={submit}
        />
      )}
    </div>
  );
}
