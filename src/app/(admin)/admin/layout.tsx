import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { organizations } from "@/db/schema/access";
import { auth, signOut } from "@/lib/auth";
import { isStaffBlockedSection } from "@/modules/access/event-guard";
import { isNavBlockedForProfile, type NavProfile } from "@/modules/access/rules";
import { getSiteSettings } from "@/modules/site/settings";
import { AdminNav } from "./nav";
import { AppShell } from "./shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || !session.sessionId) {
    redirect("/login");
  }
  const path = (await headers()).get("x-pathname") ?? "";
  const choosing = path === "/admin/elegir";
  if (!choosing && (!session.membershipId || !session.organizationId || !session.role)) {
    redirect("/admin/elegir");
  }
  if (session.role === "staff" && isStaffBlockedSection(path)) {
    redirect("/admin");
  }

  let navProfile: NavProfile = "full";
  let logoUrl: string | null = null;
  if (session.organizationId && hasDatabase()) {
    try {
      const db = getDb();
      const [org] = await db
        .select({ navProfile: organizations.navProfile })
        .from(organizations)
        .where(eq(organizations.id, session.organizationId))
        .limit(1);
      navProfile = org?.navProfile === "events_coupons" ? "events_coupons" : "full";
      if (isNavBlockedForProfile(navProfile, path)) {
        redirect("/admin/events");
      }
      const settings = await getSiteSettings(session.organizationId);
      logoUrl = settings.coverImage;
    } catch {
      navProfile = "full";
    }
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  if (!session.role) {
    return <main>{children}</main>;
  }

  return (
    <AppShell
      organizationName={session.organizationName}
      userName={session.user.name ?? session.user.email ?? ""}
      logoUrl={logoUrl}
      nav={<AdminNav role={session.role} navProfile={navProfile} />}
      logout={
        <form action={logout}>
          <button className="ghost" type="submit">
            Cerrar sesión
          </button>
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
