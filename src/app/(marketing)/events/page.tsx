import Link from "next/link";
import { EventCard } from "@/marketing/components/event-card";
import { T } from "@/marketing/components/t";
import { homeCopy } from "@/marketing/content/site";
import { getEvents } from "@/marketing/lib/cms";
import { upcomingEvents } from "@/marketing/lib/content";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Eventos | LambdaScore",
  description:
    "Próximas carreras con cronometraje e inscripción LambdaScore en el centro de México.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = upcomingEvents(events, 20);

  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">
          <T id="events.title" />
        </h1>
        <p className="muted text-lg">
          <T id="events.lead" />{" "}
          <Link href="/resultados-eventos-lambdascore" className="underline">
            <T id="events.results" />
          </Link>
          .
        </p>
        {upcoming.length === 0 ? (
          <p className="mt-8 muted">{homeCopy.emptyEvents}</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
