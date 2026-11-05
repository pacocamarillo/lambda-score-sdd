import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations } from "@/db/schema/events";

export type OrganizationContact = {
  email: string;
  firstName: string;
  lastName: string;
  events: Array<{ id: string; name: string }>;
};

export async function listOrganizationContacts(
  organizationId: string,
  filters: { q?: string; eventId?: string } = {},
): Promise<OrganizationContact[]> {
  const db = getDb();
  const rows = await db
    .select({
      email: registrations.email,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      createdAt: registrations.createdAt,
      eventId: events.id,
      eventName: events.name,
    })
    .from(registrations)
    .innerJoin(competitions, eq(competitions.id, registrations.competitionId))
    .innerJoin(events, eq(events.id, competitions.eventId))
    .where(and(eq(events.organizationId, organizationId), ne(registrations.status, "cancelled")));

  const byEmail = new Map<
    string,
    OrganizationContact & { seen: Set<string>; latest: number }
  >();

  for (const row of rows) {
    const key = row.email.trim().toLowerCase();
    const current = byEmail.get(key) ?? {
      email: row.email.trim().toLowerCase(),
      firstName: row.firstName,
      lastName: row.lastName,
      events: [],
      seen: new Set<string>(),
      latest: 0,
    };
    const created = row.createdAt.getTime();
    if (created >= current.latest) {
      current.latest = created;
      current.firstName = row.firstName;
      current.lastName = row.lastName;
      current.email = row.email.trim().toLowerCase();
    }
    if (!current.seen.has(row.eventId)) {
      current.seen.add(row.eventId);
      current.events.push({ id: row.eventId, name: row.eventName });
    }
    byEmail.set(key, current);
  }

  const q = filters.q?.trim().toLowerCase() ?? "";
  const eventId = filters.eventId && filters.eventId !== "all" ? filters.eventId : "";

  return [...byEmail.values()]
    .filter((contact) => {
      if (eventId && !contact.seen.has(eventId)) return false;
      if (!q) return true;
      const name = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      return name.includes(q) || contact.email.includes(q);
    })
    .map(({ seen: _seen, latest: _latest, ...contact }) => ({
      ...contact,
      events: contact.events.sort((a, b) => a.name.localeCompare(b.name, "es")),
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "es") || a.firstName.localeCompare(b.firstName, "es"));
}
