import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { PasswordField } from "@/app/password-field";
import { signIn } from "@/lib/auth";
import { resetPassword } from "@/modules/access/reset-password";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  async function save(formData: FormData) {
    "use server";
    const secret = String(formData.get("token") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    const result = await resetPassword({ secret, password, confirmation });
    if (!result.ok) {
      redirect(`/reset/${secret}?error=${encodeURIComponent(result.message)}`);
    }
    try {
      await signIn("credentials", { email: result.email, password, redirectTo: "/admin" });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") {
        redirect("/login?error=1");
      }
      throw error;
    }
  }

  return (
    <main className="shell">
      <h1>Nueva contraseña</h1>
      {query.error ? <p className="error">{query.error}</p> : null}
      <form action={save}>
        <input type="hidden" name="token" value={token} />
        <PasswordField name="password" label="Contraseña nueva" autoComplete="new-password" minLength={8} />
        <PasswordField name="confirmation" label="Confirmar contraseña" autoComplete="new-password" minLength={8} />
        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}
