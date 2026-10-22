import { and, eq, ne, sql } from "drizzle-orm";
import type { getDb } from "@/db/client";
import { registrations } from "@/db/schema/events";

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export async function countActiveRegistrations(
  db: Db | Tx,
  competitionId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrations)
    .where(and(eq(registrations.competitionId, competitionId), ne(registrations.status, "cancelled")));
  return row?.count ?? 0;
}

export function capacityAvailable(capacity: number | null, used: number): boolean {
  if (capacity == null) return true;
  return used < capacity;
}

export function capacityFull(capacity: number | null, used: number): boolean {
  return !capacityAvailable(capacity, used);
}
