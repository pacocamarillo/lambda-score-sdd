import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  accessTokens,
  eventPermissions,
  invitations,
  memberships,
  organizations,
  sessions,
  staffAssignments,
  users,
} from "@/db/schema/access";
import { appUrl, sendAccessEmail } from "@/lib/email";
import { hashPassword } from "@/modules/access/login";
import { canRemoveOwner, canSaveStaff, type EventLevel, type OrgRole, type StaffMode, validateNewPassword } from "@/modules/access/rules";
import { expiresIn24Hours, hashSecret, newSecret, normalizeEmail } from "@/modules/access/tokens";

export async function listTeam(organizationId: string) {
  const db = getDb();
  return db
    .select({
      membershipId: memberships.id,
      name: users.name,
      email: users.email,
      role: memberships.role,
      status: memberships.status,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.organizationId, organizationId));
}

export async function listPendingInvitations(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(invitations)
    .where(and(eq(invitations.organizationId, organizationId), eq(invitations.status, "pending")));
}

export async function inviteMember(input: {
  organizationId: string;
  email: string;
  role: OrgRole;
  actorRole: OrgRole;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (input.actorRole !== "owner") {
    return { ok: false, message: "Solo la propietaria administra al equipo." };
  }
  const db = getDb();
  const [organization] = await db.select().from(organizations).where(eq(organizations.id, input.organizationId)).limit(1);
  if (!organization) return { ok: false, message: "No encontramos la organización." };
  const staff = canSaveStaff(organization.advancedRolesEnabled, input.role);
  if (!staff.ok) return staff;

  const email = normalizeEmail(input.email);
  const [existing] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.organizationId, input.organizationId), eq(users.email, email), eq(memberships.status, "active")))
    .limit(1);
  if (existing) {
    return { ok: false, message: "Esa persona ya pertenece a la organización." };
  }

  const expiresAt = expiresIn24Hours();
  const [invitation] = await db
    .insert(invitations)
    .values({ organizationId: input.organizationId, email, role: input.role, status: "pending", expiresAt })
    .returning();
  if (!invitation) return { ok: false, message: "No se pudo crear la invitación." };
  const secret = newSecret();
  await db.insert(accessTokens).values({
    purpose: "invite",
    tokenHash: secret.hash,
    email,
    organizationId: input.organizationId,
    invitationId: invitation.id,
    expiresAt,
  });
  await sendAccessEmail({ to: email, kind: "invite", url: appUrl(`/invite/${secret.secret}`) });
  return { ok: true };
}

export async function revokeInvitation(input: { organizationId: string; invitationId: string; actorRole: OrgRole }) {
  if (input.actorRole !== "owner") return { ok: false as const, message: "Solo la propietaria administra al equipo." };
  const db = getDb();
  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(and(eq(invitations.id, input.invitationId), eq(invitations.organizationId, input.organizationId)));
  await db
    .update(accessTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(accessTokens.invitationId, input.invitationId), isNull(accessTokens.usedAt)));
  return { ok: true as const };
}

export async function removeMember(input: { organizationId: string; membershipId: string; actorRole: OrgRole }) {
  if (input.actorRole !== "owner") return { ok: false as const, message: "Solo la propietaria administra al equipo." };
  const db = getDb();
  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, input.membershipId), eq(memberships.organizationId, input.organizationId)))
    .limit(1);
  if (!target) return { ok: false as const, message: "No encontramos a esa persona." };
  if (target.role === "owner") {
    const owners = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.organizationId, input.organizationId), eq(memberships.role, "owner"), eq(memberships.status, "active")));
    if (!canRemoveOwner(owners.length)) {
      return { ok: false as const, message: "La organización debe conservar una propietaria." };
    }
  }
  await db.delete(sessions).where(eq(sessions.membershipId, target.id));
  await db.delete(eventPermissions).where(eq(eventPermissions.membershipId, target.id));
  await db.delete(staffAssignments).where(eq(staffAssignments.membershipId, target.id));
  await db.delete(memberships).where(eq(memberships.id, target.id));
  return { ok: true as const };
}

export async function peekInvite(secret: string) {
  const db = getDb();
  const [token] = await db.select().from(accessTokens).where(eq(accessTokens.tokenHash, hashSecret(secret))).limit(1);
  if (!token || token.purpose !== "invite" || token.usedAt || token.expiresAt.getTime() <= Date.now() || !token.invitationId) {
    return null;
  }
  const [invitation] = await db.select().from(invitations).where(eq(invitations.id, token.invitationId)).limit(1);
  if (!invitation || invitation.status !== "pending") return null;
  return { email: token.email, role: invitation.role };
}

export async function acceptInvite(input: {
  secret: string;
  name: string;
  password: string;
  confirmation: string;
}): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  const password = validateNewPassword(input.password, input.confirmation);
  if (!password.ok) return password;
  if (!input.name.trim()) return { ok: false, message: "El nombre es obligatorio." };
  const db = getDb();
  const now = new Date();
  const [token] = await db
    .update(accessTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(accessTokens.tokenHash, hashSecret(input.secret)),
        eq(accessTokens.purpose, "invite"),
        isNull(accessTokens.usedAt),
        gt(accessTokens.expiresAt, now),
      ),
    )
    .returning();
  if (!token?.invitationId || !token.organizationId) {
    return { ok: false, message: "El enlace no es válido. Pide otra invitación." };
  }
  const [invitation] = await db.select().from(invitations).where(eq(invitations.id, token.invitationId)).limit(1);
  if (!invitation || invitation.status !== "pending") {
    return { ok: false, message: "El enlace no es válido. Pide otra invitación." };
  }
  const email = normalizeEmail(token.email);
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const passwordHash = await hashPassword(input.password);
  if (!user) {
    const inserted = await db
      .insert(users)
      .values({ email, name: input.name.trim(), passwordHash })
      .returning();
    user = inserted[0];
  } else {
    await db.update(users).set({ passwordHash, name: input.name.trim() }).where(eq(users.id, user.id));
  }
  if (!user) return { ok: false, message: "No se pudo crear la cuenta." };
  const [already] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.organizationId, token.organizationId)))
    .limit(1);
  if (!already) {
    await db.insert(memberships).values({
      userId: user.id,
      organizationId: token.organizationId,
      role: invitation.role,
      status: "active",
    });
  }
  await db.update(invitations).set({ status: "revoked" }).where(eq(invitations.id, invitation.id));
  return { ok: true, email };
}

export async function saveStaffAssignment(input: {
  organizationId: string;
  membershipId: string;
  actorRole: OrgRole;
  mode: StaffMode;
  eventId?: string;
  level?: EventLevel;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (input.actorRole !== "owner") return { ok: false, message: "Solo la propietaria administra al equipo." };
  const db = getDb();
  const [organization] = await db.select().from(organizations).where(eq(organizations.id, input.organizationId)).limit(1);
  const allowed = canSaveStaff(Boolean(organization?.advancedRolesEnabled), "staff");
  if (!allowed.ok) return allowed;
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, input.membershipId), eq(memberships.organizationId, input.organizationId), eq(memberships.role, "staff")))
    .limit(1);
  if (!membership) return { ok: false, message: "Esa persona no es staff de esta organización." };
  await db
    .insert(staffAssignments)
    .values({ membershipId: membership.id, mode: input.mode })
    .onConflictDoUpdate({ target: staffAssignments.membershipId, set: { mode: input.mode } });
  if (input.eventId && input.level && (input.mode === "specific" || input.mode === "all_except")) {
    await db
      .insert(eventPermissions)
      .values({
        membershipId: membership.id,
        eventId: input.eventId,
        level: input.level,
        excluded: input.mode === "all_except",
      })
      .onConflictDoUpdate({
        target: [eventPermissions.membershipId, eventPermissions.eventId],
        set: { level: input.level, excluded: input.mode === "all_except" },
      });
  }
  return { ok: true };
}
