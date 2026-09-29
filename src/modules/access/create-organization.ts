import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { memberships, organizations, users } from "@/db/schema/access";
import { hashPassword } from "@/modules/access/login";
import { validateNewPassword } from "@/modules/access/rules";
import { validateSubdomain } from "@/modules/access/subdomain";
import { normalizeEmail } from "@/modules/access/tokens";

export async function createOrganization(input: {
  organizationName: string;
  subdomain: string;
  name: string;
  email: string;
  password: string;
  confirmation: string;
}): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  const subdomain = validateSubdomain(input.subdomain);
  if (!subdomain.ok) return subdomain;
  if (!input.organizationName.trim() || !input.name.trim()) {
    return { ok: false, message: "El nombre de la organización y el tuyo son obligatorios." };
  }
  const password = validateNewPassword(input.password, input.confirmation);
  if (!password.ok) return password;

  const db = getDb();
  const email = normalizeEmail(input.email);
  const [existingOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.subdomain, subdomain.subdomain))
    .limit(1);
  if (existingOrg) {
    return { ok: false, message: "Ese subdominio no está disponible. Elige otro." };
  }
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    return { ok: false, message: "Ese correo ya tiene cuenta. Entra o restablece la contraseña." };
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db.insert(users).values({ email, name: input.name.trim(), passwordHash }).returning();
  const [organization] = await db
    .insert(organizations)
    .values({
      name: input.organizationName.trim(),
      subdomain: subdomain.subdomain,
      country: "MX",
      currency: "MXN",
    })
    .returning();
  if (!user || !organization) {
    return { ok: false, message: "No se pudo crear la organización." };
  }
  await db.insert(memberships).values({
    userId: user.id,
    organizationId: organization.id,
    role: "owner",
    status: "active",
  });
  return { ok: true, email };
}

export async function updateOrganizationDetails(input: {
  organizationId: string;
  name: string;
  description: string;
}): Promise<void> {
  const db = getDb();
  await db
    .update(organizations)
    .set({ name: input.name.trim(), description: input.description.trim() })
    .where(eq(organizations.id, input.organizationId));
}
