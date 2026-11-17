import Image from "next/image";
import Link from "next/link";
import { FormattedDate } from "@/marketing/components/formatted-date";
import { T } from "@/marketing/components/t";
import type { Event } from "@/marketing/lib/content";

export function EventCard({ event }: { event: Event }) {
  return (
    <article className="overflow-hidden surface">
      <div className="relative aspect-[16/10]">
        <Image
          src={event.image}
          alt={event.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-5">
        <h3 className="display text-2xl">
          <Link href={`/event/${event.slug}`}>{event.name}</Link>
        </h3>
        <p className="muted mt-2">
          <FormattedDate value={event.startsAt} /> · {event.place}
        </p>
        {event.registrationUrl ? (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4 !py-2 text-sm"
          >
            <T id="card.register" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
