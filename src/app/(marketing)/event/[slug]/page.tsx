import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormattedDate } from "@/marketing/components/formatted-date";
import { T } from "@/marketing/components/t";
import { getEvents } from "@/marketing/lib/cms";
import { buildMetadata } from "@/marketing/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((item) => item.slug === slug);
  if (!event) return {};
  return buildMetadata({
    title: `${event.name} | LambdaScore`,
    description: event.summary,
    path: `/event/${event.slug}`,
  });
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((item) => item.slug === slug);
  if (!event) notFound();

  return (
    <section className="section">
      <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] muted">
            <T id="event.kicker" />
          </p>
          <h1 className="display section-title mt-2">{event.name}</h1>
          <p className="text-lg muted">
            <FormattedDate value={event.startsAt} /> · {event.place}
          </p>
          <p className="mt-6 text-lg">{event.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <T id="event.register" />
              </a>
            ) : null}
            <Link href="/events" className="btn btn-ghost-dark">
              <T id="event.all" />
            </Link>
          </div>
        </div>
        <div className="relative min-h-72 overflow-hidden">
          <Image
            src={event.image}
            alt={event.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </div>
    </section>
  );
}
