import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listMemberships, chooseMembership } from "@/modules/access/session-store";

export default async function ChooseOrganizationPage() {
  const session = await auth();
  if (!session?.user?.id || !session.sessionId) redirect("/login");
  const options = await listMemberships(session.user.id);

  async function choose(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.user?.id || !current.sessionId) redirect("/login");
    const membershipId = String(formData.get("membershipId") ?? "");
    const ok = await chooseMembership(current.sessionId, membershipId, current.user.id);
    if (!ok) redirect("/admin/elegir");
    redirect("/admin");
  }

  return (
    <main>
      <h1>Elige organización</h1>
      <form action={choose}>
        <label>
          Organización
          <select name="membershipId" required>
            {options.map((option) => (
              <option key={option.membershipId} value={option.membershipId}>
                {option.organizationName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Continuar</button>
      </form>
    </main>
  );
}
