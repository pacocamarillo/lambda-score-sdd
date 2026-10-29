import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/modules/events/crud";
import { waiverDataFromRegistration } from "@/modules/events/waiver-data";

export default async function RegistrationConfirmationPage({
  params,
}: {
  params: Promise<{ eventId: string; registrationId: string }>;
}) {
  const { eventId, registrationId } = await params;
  const event = await getPublicEvent(eventId);
  if (!event) notFound();
  const data = await waiverDataFromRegistration(eventId, registrationId, event);
  if (!data) notFound();

  const confirmed = data.status === "confirmed";
  const pending = data.status === "pending_payment";
  const participant = [data.firstName, data.lastName].filter(Boolean).join(" ");

  return (
    <div className="stack auth-card">
      <img className="brand-banner" src="/brand/tempozero.jpg" alt="Tempozero" />
      <header>
        <h1>{confirmed ? "Participación confirmada" : pending ? "Inscripción recibida" : "Estado de inscripción"}</h1>
        <p className="lede">
          {confirmed
            ? "Este participante ya está confirmado para el evento."
            : pending
              ? "La inscripción quedó registrada y sigue pendiente de pago."
              : `Estado actual: ${data.status}.`}
        </p>
      </header>
      <section className="card">
        <ul className="feature-list">
          <li>
            <span>Participante</span>
            <span>{participant || "No indicado"}</span>
          </li>
          <li>
            <span>Correo</span>
            <span>{data.email}</span>
          </li>
          <li>
            <span>Categoría</span>
            <span>{data.category || "No indicada"}</span>
          </li>
          <li>
            <span>Evento</span>
            <span>{data.eventName}</span>
          </li>
          <li>
            <span>Competencia</span>
            <span>{data.competitionName}</span>
          </li>
          <li>
            <span>Fecha</span>
            <span>{data.eventDate}</span>
          </li>
          <li>
            <span>Lugar</span>
            <span>{data.venue}</span>
          </li>
        </ul>
      </section>
      <p>
        <Link href={`/eventos/${eventId}`}>Volver al evento</Link>
      </p>
    </div>
  );
}
