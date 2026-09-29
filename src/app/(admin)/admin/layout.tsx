import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { isStaffBlockedSection } from "@/modules/access/event-guard";
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
      nav={<AdminNav role={session.role} />}
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
