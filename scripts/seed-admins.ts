/**
 * Crea o actualiza dos cuentas de panel en la misma organización.
 * Uso: npm run db:seed-admins
 * Requiere DATABASE_URL (p. ej. en .env.local).
 */
import { eq } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { memberships, organizations, users } from "../src/db/schema/access";
import { hashPassword } from "../src/modules/access/login";
import { normalizeEmail } from "../src/modules/access/tokens";

const ORGANIZATION = {
  name: "Lambda Score",
  subdomain: "lambda-score",
};

const ACCOUNTS = [
  {
    email: "paco.camarillo@gmail.com",
    name: "Paco Camarillo",
    password: "clave-segura-paco",
    role: "owner" as const,
  },
  {
    email: "rodrigo.pablo77@gmail.com",
    name: "Rodrigo Pablo",
    password: "clave-segura-rodrigo",
    role: "admin" as const,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL no está configurada.");
    process.exit(1);
  }
  const db = getDb();

  let [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.subdomain, ORGANIZATION.subdomain))
    .limit(1);

  if (!organization) {
    [organization] = await db
      .insert(organizations)
      .values({
        name: ORGANIZATION.name,
        subdomain: ORGANIZATION.subdomain,
        country: "MX",
        currency: "MXN",
        description: "Organización de desarrollo local",
      })
      .returning();
  } else if (organization.name !== ORGANIZATION.name) {
    await db.update(organizations).set({ name: ORGANIZATION.name }).where(eq(organizations.id, organization.id));
  }

  if (!organization) {
    console.error("No se pudo crear la organización.");
    process.exit(1);
  }

  console.log(`Organización: ${organization.name} (${organization.subdomain})`);

  for (const account of ACCOUNTS) {
    const email = normalizeEmail(account.email);
    const passwordHash = await hashPassword(account.password);
    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      [user] = await db.insert(users).values({ email, name: account.name, passwordHash }).returning();
      console.log(`Usuario creado: ${email}`);
    } else {
      await db.update(users).set({ name: account.name, passwordHash }).where(eq(users.id, user.id));
      console.log(`Usuario actualizado: ${email}`);
    }

    if (!user) continue;

    const [membership] = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, user.id))
      .limit(1);

    if (!membership) {
      await db.insert(memberships).values({
        userId: user.id,
        organizationId: organization.id,
        role: account.role,
        status: "active",
      });
      console.log(`  Rol: ${account.role} (nueva membresía)`);
    } else if (membership.organizationId !== organization.id || membership.role !== account.role) {
      await db
        .update(memberships)
        .set({ organizationId: organization.id, role: account.role, status: "active" })
        .where(eq(memberships.id, membership.id));
      console.log(`  Rol: ${account.role} (membresía actualizada)`);
    } else {
      console.log(`  Rol: ${account.role} (sin cambios)`);
    }

    console.log(`  Entrada: ${email} / ${account.password}`);
  }

  console.log("\nPanel: http://localhost:3000/login");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
