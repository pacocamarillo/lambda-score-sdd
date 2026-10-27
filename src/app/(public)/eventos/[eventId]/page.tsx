import Link from "next/link";
import { notFound } from "next/navigation";
import { listCompetitionsWithAvailability } from "@/modules/events/competitions";
import { getPublicEvent, registrationIsOpen } from "@/modules/events/crud";

export default async function PublicEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getPublicEvent(eventId);
  if (!event) notFound();
  const comps = await listCompetitionsWithAvailability(eventId);
  const open = registrationIsOpen(event);

  return (
    <div className="stack auth-card">
      <header>
        <h1>{event.name}</h1>
        <p className="lede">{event.description || "Evento publicado."}</p>
      </header>
      {event.imageKey ? <img className="event-cover" src={event.imageKey} alt={event.name} /> : null}
      <section className="card">
        <p>
          <strong>Fecha:</strong>{" "}
          {event.eventDate.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
        </p>
        <p>
          <strong>Lugar:</strong> {event.venue}
        </p>
        {event.registrationDeadline ? (
          <p>
            <strong>Cierre de inscripción:</strong>{" "}
            {event.registrationDeadline.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
          </p>
        ) : null}
        <p className="hint">
          {open
            ? "La inscripción está abierta."
            : "La ficha sigue visible, pero la inscripción está cerrada."}
        </p>
      </section>

      <section className="card">
        <h2>Competencias</h2>
        {comps.length === 0 ? (
          <p className="empty">Sin competencias publicadas.</p>
        ) : (
          <ul className="feature-list">
            {comps.map((competition) => (
              <li key={competition.id}>
                <span>
                  {competition.name}
                  <span className="detail">
                    ${(competition.priceCents / 100).toFixed(2)} MXN
                    {competition.full ? " · Sin cupo" : ""}
                    {competition.mode === "team" ? " · Equipo" : ""}
                  </span>
                </span>
                {open && !competition.full ? (
                  <Link
                    href={
                      competition.mode === "team"
                        ? `/eventos/${eventId}/inscripcion/team?competitionId=${competition.id}`
                        : `/eventos/${eventId}/inscripcion?competitionId=${competition.id}`
                    }
                  >
                    Inscribirse
                  </Link>
                ) : (
                  <span className="badge">{competition.full ? "Llena" : "Cerrada"}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {open ? (
        <p>
          <Link
            className="button"
            href={
              comps.some((competition) => competition.mode === "individual") || comps.length === 0
                ? `/eventos/${eventId}/inscripcion`
                : `/eventos/${eventId}/inscripcion/team`
            }
          >
            Ir a inscripción
          </Link>
        </p>
      ) : null}
    </div>
  );
}
