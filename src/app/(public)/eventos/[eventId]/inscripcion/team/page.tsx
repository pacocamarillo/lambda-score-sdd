import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listCompetitionsWithAvailability } from "@/modules/events/competitions";
import { getPublicEvent, registrationIsOpen } from "@/modules/events/crud";
import { registerTeam } from "@/modules/events/teams";
import type { ParticipantGender, ParticipantInput } from "@/modules/events/types";

function memberFromForm(formData: FormData, index: number): ParticipantInput {
  return {
    email: String(formData.get(`email_${index}`) ?? ""),
    firstName: String(formData.get(`firstName_${index}`) ?? ""),
    lastName: String(formData.get(`lastName_${index}`) ?? ""),
    birthDate: String(formData.get(`birthDate_${index}`) ?? ""),
    gender: String(formData.get(`gender_${index}`) ?? "") as ParticipantGender,
    documentType: "other",
    documentNumber: "",
  };
}

export default async function TeamInscripcionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ competitionId?: string; error?: string; ok?: string; status?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getPublicEvent(eventId);
  if (!event) notFound();
  if (!registrationIsOpen(event)) {
    return (
      <div className="stack auth-card">
        <h1>Inscripción cerrada</h1>
        <Link href={`/eventos/${eventId}`}>Volver al evento</Link>
      </div>
    );
  }

  const comps = (await listCompetitionsWithAvailability(eventId)).filter((c) => c.mode === "team");
  const selectedId = query.competitionId ?? comps[0]?.id ?? "";
  const selected = comps.find((c) => c.id === selectedId) ?? null;
  const slots = selected?.teamMinSize ?? 2;

  async function submit(formData: FormData) {
    "use server";
    const competitionId = String(formData.get("competitionId") ?? "");
    const memberCount = Number(formData.get("memberCount") ?? slots);
    const members = Array.from({ length: memberCount }, (_, index) => memberFromForm(formData, index));
    const result = await registerTeam({
      eventId,
      competitionId,
      teamName: String(formData.get("teamName") ?? ""),
      members,
      acceptedTerms: formData.get("acceptedTerms") === "on",
      acceptedWaiver: formData.get("acceptedWaiver") === "on",
    });
    if (!result.ok) {
      redirect(
        `/eventos/${eventId}/inscripcion/team?competitionId=${encodeURIComponent(competitionId)}&error=${encodeURIComponent(result.message)}`,
      );
    }
    redirect(
      `/eventos/${eventId}/inscripcion/team?ok=1&status=${encodeURIComponent(result.status)}`,
    );
  }

  if (query.ok) {
    return (
      <div className="stack auth-card">
        <h1>Equipo inscrito</h1>
        <p className="lede">
          {query.status === "confirmed"
            ? "El equipo quedó confirmado."
            : "El equipo quedó pendiente de pago."}
        </p>
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
        <h1>Inscripción de equipo</h1>
        <p className="lede">
          {selected
            ? `Mínimo ${selected.teamMinSize ?? 2} integrantes${selected.teamNameRequired ? " y nombre de equipo" : ""}.`
            : "Elige una competencia de equipo."}
        </p>
      </header>
      {query.error ? <p className="error">{query.error}</p> : null}

      {comps.length === 0 ? (
        <p className="empty">No hay competencias de equipo en este evento.</p>
      ) : (
        <form action={submit} className="stack card">
          <label>
            Competencia
            <select name="competitionId" defaultValue={selectedId} required>
              {comps.map((competition) => (
                <option key={competition.id} value={competition.id} disabled={competition.full}>
                  {competition.name}
                  {competition.full ? " (sin cupo)" : ""}
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="memberCount" value={slots} />
          <label>
            Nombre del equipo
            <input name="teamName" required={Boolean(selected?.teamNameRequired)} />
          </label>

          {Array.from({ length: slots }, (_, index) => (
            <fieldset key={index} className="stack">
              <legend>Integrante {index + 1}</legend>
              <label>
                Nombre
                <input name={`firstName_${index}`} required />
              </label>
              <label>
                Apellido
                <input name={`lastName_${index}`} required />
              </label>
              <label>
                Género
                <select name={`gender_${index}`} required defaultValue="">
                  <option value="" disabled>
                    Elige
                  </option>
                  <option value="male">Varonil</option>
                  <option value="female">Femenil</option>
                </select>
              </label>
              <label>
                Fecha de nacimiento
                <input name={`birthDate_${index}`} type="date" required />
              </label>
              <label>
                Correo
                <input name={`email_${index}`} type="email" required />
              </label>
            </fieldset>
          ))}

          <label className="switch-row">
            <input name="acceptedTerms" type="checkbox" required />
            Acepto los términos
          </label>
          <label className="switch-row">
            <input name="acceptedWaiver" type="checkbox" required />
            Acepto la renuncia de responsabilidad
          </label>
          <button type="submit">Inscribir equipo</button>
        </form>
      )}
    </div>
  );
}
