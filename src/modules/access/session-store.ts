import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { memberships, organizations, sessions, users } from "@/db/schema/access";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function openSession(userId: string): Promise<{ sessionId: string; membershipId?: string }> {
  const db = getDb();
  const active = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "active")));
  const membershipId = active.length === 1 ? active[0]?.id : null;
  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      membershipId,
      expiresAt: new Date(Date.now() + WEEK_MS),
    })
    .returning();
  if (!session) throw new Error("No se pudo abrir la sesión");
  return { sessionId: session.id, membershipId: membershipId ?? undefined };
}

export async function readSession(sessionId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      membershipId: memberships.id,
      role: memberships.role,
      status: memberships.status,
      organizationId: organizations.id,
      organizationName: organizations.name,
      email: users.email,
      name: users.name,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(memberships, eq(memberships.id, sessions.membershipId))
    .leftJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  if (row.membershipId && row.status !== "active") return null;
  return row;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function chooseMembership(sessionId: string, membershipId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.userId, userId), eq(memberships.status, "active")))
    .limit(1);
  if (!membership) return false;
  await db.update(sessions).set({ membershipId }).where(eq(sessions.id, sessionId));
  return true;
}

export async function listMemberships(userId: string) {
  const db = getDb();
  return db
    .select({
      membershipId: memberships.id,
      role: memberships.role,
      organizationName: organizations.name,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "active")));
}
