import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { PasswordField } from "@/app/password-field";
import { signIn } from "@/lib/auth";
import { acceptInvite, peekInvite } from "@/modules/access/invitations";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const invite = await peekInvite(token);
  if (!invite) {
    return (
      <main className="shell">
        <h1>Invitación</h1>
        <p className="error">El enlace no es válido.</p>
      </main>
    );
  }

  async function accept(formData: FormData) {
    "use server";
    const secret = String(formData.get("token") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await acceptInvite({
      secret,
      name: String(formData.get("name") ?? ""),
      password,
      confirmation: String(formData.get("confirmation") ?? ""),
    });
    if (!result.ok) redirect(`/invite/${secret}?error=${encodeURIComponent(result.message)}`);
    try {
      await signIn("credentials", { email: result.email, password, redirectTo: "/admin" });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") redirect("/login?error=1");
      throw error;
    }
  }

  return (
    <main className="shell">
      <h1>Únete al equipo</h1>
      <p>
        {invite.email} entra como {invite.role}.
      </p>
      {query.error ? <p className="error">{query.error}</p> : null}
      <form action={accept}>
        <input type="hidden" name="token" value={token} />
        <label>
          Nombre
          <input name="name" required />
        </label>
        <PasswordField name="password" label="Contraseña" autoComplete="new-password" minLength={8} />
        <PasswordField name="confirmation" label="Confirmar contraseña" autoComplete="new-password" minLength={8} />
        <button type="submit">Aceptar</button>
      </form>
    </main>
  );
}
