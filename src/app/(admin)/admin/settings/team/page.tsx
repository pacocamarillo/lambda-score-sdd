import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLE_COLUMNS, ROLES_MATRIX } from "@/modules/access/roles-matrix";
import {
  inviteMember,
  listPendingInvitations,
  listTeam,
  removeMember,
  revokeInvitation,
  saveStaffAssignment,
} from "@/modules/access/invitations";
import type { EventLevel, OrgRole, StaffMode } from "@/modules/access/rules";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.organizationId || session.role !== "owner") redirect("/admin");
  const organizationId = session.organizationId;
  const actorRole = session.role;
  const params = await searchParams;
  const team = await listTeam(organizationId);
  const pending = await listPendingInvitations(organizationId);

  async function invite(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    const result = await inviteMember({
      organizationId: current.organizationId,
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "admin") as OrgRole,
      actorRole: "owner",
    });
    if (!result.ok) redirect(`/admin/settings/team?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/settings/team");
  }

  async function revoke(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    await revokeInvitation({
      organizationId: current.organizationId,
      invitationId: String(formData.get("invitationId") ?? ""),
      actorRole: "owner",
    });
    redirect("/admin/settings/team");
  }

  async function remove(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    const result = await removeMember({
      organizationId: current.organizationId,
      membershipId: String(formData.get("membershipId") ?? ""),
      actorRole: "owner",
    });
    if (!result.ok) redirect(`/admin/settings/team?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/settings/team");
  }

  async function assign(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || current.role !== "owner") redirect("/admin");
    const result = await saveStaffAssignment({
      organizationId: current.organizationId,
      membershipId: String(formData.get("membershipId") ?? ""),
      actorRole: "owner",
      mode: String(formData.get("mode") ?? "none") as StaffMode,
      eventId: String(formData.get("eventId") ?? "") || undefined,
      level: (String(formData.get("level") ?? "") || undefined) as EventLevel | undefined,
    });
    if (!result.ok) redirect(`/admin/settings/team?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/settings/team");
  }

  return (
    <>
      <h2>Usuarios</h2>
      {params.error ? <p className="error">{params.error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {team.map((member) => (
            <tr key={member.membershipId}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
              <td>{member.status}</td>
              <td>
                {actorRole === "owner" ? (
                  <form action={remove}>
                    <input type="hidden" name="membershipId" value={member.membershipId} />
                    <button type="submit">Quitar</button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Invitar</h2>
      <form action={invite}>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <label>
          Rol
          <select name="role">
            <option value="admin">Administrador</option>
            <option value="staff">Staff</option>
            <option value="owner">Propietaria</option>
          </select>
        </label>
        <button type="submit">Invitar</button>
      </form>
      <h2>Invitaciones pendientes</h2>
      <ul>
        {pending.map((invitation) => (
          <li key={invitation.id}>
            {invitation.email} ({invitation.role})
            <form action={revoke}>
              <input type="hidden" name="invitationId" value={invitation.id} />
              <button type="submit">Revocar</button>
            </form>
          </li>
        ))}
      </ul>
      <h2>Asignación de staff</h2>
      <form action={assign}>
        <label>
          Miembro
          <select name="membershipId">
            {team
              .filter((member) => member.role === "staff")
              .map((member) => (
                <option key={member.membershipId} value={member.membershipId}>
                  {member.email}
                </option>
              ))}
          </select>
        </label>
        <label>
          Modo
          <select name="mode">
            <option value="none">Ningún evento</option>
            <option value="all">Todos, incluidos los futuros</option>
            <option value="specific">Eventos específicos</option>
            <option value="all_except">Todos con excepciones</option>
          </select>
        </label>
        <label>
          Evento
          <input name="eventId" placeholder="Identificador del evento" />
        </label>
        <label>
          Nivel
          <select name="level">
            <option value="viewer">Solo lectura</option>
            <option value="operator">Operador</option>
            <option value="event_admin">Administrador de evento</option>
          </select>
        </label>
        <button type="submit">Guardar staff</button>
      </form>
      <h2>Roles, permisos y accesos</h2>
      <table>
        <thead>
          <tr>
            <th>Acceso</th>
            {ROLE_COLUMNS.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES_MATRIX.map((item) => (
            <tr key={item.access}>
              <td>{item.access}</td>
              {ROLE_COLUMNS.map((column) => (
                <td key={column}>{item.cells[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
