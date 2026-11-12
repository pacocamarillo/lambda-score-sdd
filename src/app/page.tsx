import { redirect } from "next/navigation";
import { hasDatabase } from "@/db/client";
import { organizationFromRequestHost } from "@/lib/tenant";
import { getSiteSettings } from "@/modules/site/settings";
import { PublicHomePage } from "./(public)/home-page";
import { PublicFooter } from "./(public)/footer";

export default async function HomePage() {
  if (!hasDatabase()) redirect("/login");
  const organization = await organizationFromRequestHost();
  if (!organization) redirect("/login");

  const settings = await getSiteSettings(organization.id);
  if (!settings.active) {
    return (
      <div className="public-shell">
        <main className="auth-shell">
          <div className="stack auth-card">
            <h1>{organization.name}</h1>
            <p className="lede">El sitio público está apagado por ahora.</p>
            <a className="button" href="/login">
              Ir al acceso
            </a>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="public-shell">
      <main className="auth-shell">
        <PublicHomePage organizationName={organization.name} settings={settings} />
      </main>
      <PublicFooter />
    </div>
  );
}
