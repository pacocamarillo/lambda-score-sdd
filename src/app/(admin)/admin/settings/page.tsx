import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { organizations } from "@/db/schema/access";
import { auth } from "@/lib/auth";
import { updateOrganizationDetails } from "@/modules/access/create-organization";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.organizationId || session.role !== "owner") redirect("/admin");
  const db = getDb();
  const [organization] = await db.select().from(organizations).where(eq(organizations.id, session.organizationId)).limit(1);
  if (!organization) redirect("/admin");

  async function save(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    await updateOrganizationDetails({
      organizationId: current.organizationId,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
    });
    redirect("/admin/settings?saved=1");
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Detalles de la organización</h2>
        <p className="lede">Este nombre es el que ve el equipo en el panel.</p>
        <form action={save}>
          <label>
            Nombre de la organización
            <input name="name" defaultValue={organization.name} required />
          </label>
          <p className="hint">Es el nombre que se muestra a tu equipo.</p>
          <label>
            Subdominio
            <input value={organization.subdomain} disabled />
          </label>
          <p className="hint">El sitio queda en el subdominio de la plataforma. No se puede cambiar.</p>
          <label id="dominio">
            Dominio propio
            <input value={organization.customDomain ?? ""} disabled placeholder="Función de pago" />
          </label>
          <p className="hint">Sigue en el subdominio mientras la función de dominio propio no esté habilitada.</p>
          <label>
            Descripción
            <textarea name="description" defaultValue={organization.description ?? ""} placeholder="Breve descripción de la organización" />
          </label>
          <label>
            País
            <input value={organization.country === "MX" ? "México" : organization.country} disabled />
          </label>
          <p className="hint">El país no se puede cambiar después del alta.</p>
          <label>
            Moneda
            <input value={organization.currency === "MXN" ? "Peso mexicano (MXN)" : organization.currency} disabled />
          </label>
          <p className="hint">La moneda no se puede cambiar después del alta.</p>
          <button type="submit">Guardar</button>
        </form>
      </section>
      <section className="card">
        <h2>Logo</h2>
        <p className="lede">Imagen de la organización en el sitio y en el panel.</p>
        <p className="empty">Todavía no hay logo. Sin archivo, el sitio usa el nombre de la organización.</p>
        <div className="inline-actions">
          <button type="button" disabled>
            Reemplazar
          </button>
          <button type="button" className="ghost" disabled>
            Eliminar
          </button>
        </div>
        <p className="hint">El archivo se guarda fuera de la base, cuando la organización ya puede subir imágenes.</p>
      </section>
    </div>
  );
}
