import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createReplicaOrganization,
  inviteToChildOrganization,
  listChildOrganizations,
} from "@/modules/access/replica-orgs";
import { listPendingInvitations } from "@/modules/access/invitations";
import { EmptyTable, PageIntro } from "../listing";

export default async function AdminPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  if (session.role !== "owner") redirect("/admin");
  const query = await searchParams;
  const children = await listChildOrganizations(session.organizationId);

  async function createOrg(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    const result = await createReplicaOrganization({
      parentOrganizationId: current.organizationId,
      actorRole: "owner",
      name: String(formData.get("name") ?? ""),
      subdomain: String(formData.get("subdomain") ?? ""),
      ownerEmail: String(formData.get("ownerEmail") ?? ""),
    });
    if (!result.ok) redirect(`/admin/panel?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/panel?saved=1");
  }

  async function invite(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    const role = String(formData.get("role") ?? "admin") === "owner" ? "owner" : "admin";
    const result = await inviteToChildOrganization({
      parentOrganizationId: current.organizationId,
      childOrganizationId: String(formData.get("childOrganizationId") ?? ""),
      actorRole: "owner",
      email: String(formData.get("email") ?? ""),
      role,
    });
    if (!result.ok) redirect(`/admin/panel?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/panel?saved=1");
  }

  const pendingByChild = await Promise.all(
    children.map(async (child) => ({
      childId: child.id,
      invites: await listPendingInvitations(child.id),
    })),
  );
  const pendingMap = new Map(pendingByChild.map((row) => [row.childId, row.invites]));

  return (
    <div className="stack">
      <PageIntro
        title="Panel de administración"
        lede="Crea organizaciones réplica (solo Eventos y Cupones) e invita a sus usuarias por correo."
      />
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Cambios guardados. Revisa el correo de invitación.</p> : null}

      <section className="card stack">
        <h2>Nueva organización réplica</h2>
        <p className="lede">
          La nueva organización solo verá Eventos y Cupones. La propietaria entra por invitación.
        </p>
        <form action={createOrg} className="stack">
          <label>
            Nombre
            <input name="name" required />
          </label>
          <label>
            Subdominio
            <input name="subdomain" required placeholder="mi-org" />
          </label>
          <label>
            Correo de la propietaria
            <input name="ownerEmail" type="email" required />
          </label>
          <button type="submit">Crear e invitar</button>
        </form>
      </section>

      <section className="card stack">
        <h2>Organizaciones creadas</h2>
        {children.length === 0 ? (
          <EmptyTable
            columns={["Nombre", "Subdominio", "Invitaciones", "Invitar"]}
            message="Todavía no hay organizaciones réplica."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Subdominio</th>
                  <th scope="col">Invitaciones pendientes</th>
                  <th scope="col">Invitar</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id}>
                    <td>{child.name}</td>
                    <td>{child.subdomain}</td>
                    <td>
                      {(pendingMap.get(child.id) ?? [])
                        .map((invite) => `${invite.email} (${invite.role})`)
                        .join(", ") || "—"}
                    </td>
                    <td>
                      <form action={invite} className="inline-actions">
                        <input type="hidden" name="childOrganizationId" value={child.id} />
                        <input name="email" type="email" required placeholder="correo@" />
                        <select name="role" defaultValue="admin">
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit">Invitar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
