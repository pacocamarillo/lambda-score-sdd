import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { memberships, organizations, users } from "@/db/schema/access";
import { inviteMember } from "@/modules/access/invitations";
import type { OrgRole } from "@/modules/access/rules";
import { validateSubdomain } from "@/modules/access/subdomain";
import { normalizeEmail } from "@/modules/access/tokens";
import type { ActionResult } from "@/modules/events/types";

export async function listChildOrganizations(parentOrganizationId: string) {
  const db = getDb();
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      subdomain: organizations.subdomain,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.parentOrganizationId, parentOrganizationId))
    .orderBy(desc(organizations.createdAt));
}

export async function createReplicaOrganization(input: {
  parentOrganizationId: string;
  actorRole: OrgRole;
  name: string;
  subdomain: string;
  ownerEmail: string;
}): Promise<ActionResult<{ organizationId: string }>> {
  if (input.actorRole !== "owner") {
    return { ok: false, message: "Solo la propietaria puede crear organizaciones réplica." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, message: "El nombre de la organización es obligatorio." };

  const subdomain = validateSubdomain(input.subdomain);
  if (!subdomain.ok) return subdomain;

  const email = normalizeEmail(input.ownerEmail);
  if (!email) return { ok: false, message: "Indica el correo de la persona propietaria a invitar." };

  const db = getDb();
  const [parent] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, input.parentOrganizationId))
    .limit(1);
  if (!parent) return { ok: false, message: "No se encontró la organización actual." };
  if (parent.navProfile === "events_coupons") {
    return { ok: false, message: "Una organización limitada no puede crear otras réplicas." };
  }

  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.subdomain, subdomain.subdomain))
    .limit(1);
  if (existing) return { ok: false, message: "Ese subdominio no está disponible. Elige otro." };

  const [created] = await db
    .insert(organizations)
    .values({
      name,
      subdomain: subdomain.subdomain,
      country: parent.country,
      currency: parent.currency,
      navProfile: "events_coupons",
      parentOrganizationId: parent.id,
    })
    .returning({ id: organizations.id });
  if (!created) return { ok: false, message: "No se pudo crear la organización." };

  const invite = await inviteMember({
    organizationId: created.id,
    email,
    role: "owner",
    actorRole: "owner",
  });
  if (!invite.ok) {
    await db.delete(organizations).where(eq(organizations.id, created.id));
    return invite;
  }

  return { ok: true, organizationId: created.id };
}

export async function inviteToChildOrganization(input: {
  parentOrganizationId: string;
  childOrganizationId: string;
  actorRole: OrgRole;
  email: string;
  role: OrgRole;
}): Promise<ActionResult> {
  if (input.actorRole !== "owner") {
    return { ok: false, message: "Solo la propietaria puede invitar." };
  }
  const db = getDb();
  const [child] = await db
    .select()
    .from(organizations)
    .where(
      and(
        eq(organizations.id, input.childOrganizationId),
        eq(organizations.parentOrganizationId, input.parentOrganizationId),
      ),
    )
    .limit(1);
  if (!child) return { ok: false, message: "No se encontró la organización réplica." };

  return inviteMember({
    organizationId: child.id,
    email: input.email,
    role: input.role === "admin" ? "admin" : "owner",
    actorRole: "owner",
  });
}

export async function listChildTeam(childOrganizationId: string, parentOrganizationId: string) {
  const db = getDb();
  const [child] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(
      and(
        eq(organizations.id, childOrganizationId),
        eq(organizations.parentOrganizationId, parentOrganizationId),
      ),
    )
    .limit(1);
  if (!child) return [];
  return db
    .select({
      name: users.name,
      email: users.email,
      role: memberships.role,
      status: memberships.status,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.organizationId, child.id));
}
