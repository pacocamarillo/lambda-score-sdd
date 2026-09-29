import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { organizations } from "@/db/schema/access";
import { belongsToOrganization, subdomainFromHost } from "@/modules/access/subdomain";

export { belongsToOrganization };

export async function organizationFromRequestHost(): Promise<{ id: string; name: string; subdomain: string } | null> {
  if (!hasDatabase()) return null;
  const host = (await headers()).get("host");
  const subdomain = subdomainFromHost(host, process.env.APP_ROOT_DOMAIN ?? "localhost");
  if (!subdomain) return null;
  const db = getDb();
  const [organization] = await db
    .select({ id: organizations.id, name: organizations.name, subdomain: organizations.subdomain })
    .from(organizations)
    .where(eq(organizations.subdomain, subdomain))
    .limit(1);
  return organization ?? null;
}
