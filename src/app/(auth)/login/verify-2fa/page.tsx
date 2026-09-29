import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/app/auth-brand";
import { signIn } from "@/lib/auth";
import { INVALID_2FA_CODE } from "@/modules/access/totp";
import { safeNextPath } from "@/modules/access/paths";

export default async function Verify2faPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = String(params.token ?? "");
  const next = safeNextPath(params.next);
  if (!token) redirect("/login");

  async function verify(formData: FormData) {
    "use server";
    const ticket = String(formData.get("token") ?? "");
    const code = String(formData.get("code") ?? "");
    const destination = safeNextPath(String(formData.get("next") ?? ""));
    if (!ticket) redirect("/login");
    try {
      await signIn("credentials", { login2faToken: ticket, totpCode: code, redirectTo: destination });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") {
        redirect(
          `/login/verify-2fa?token=${encodeURIComponent(ticket)}&next=${encodeURIComponent(destination)}&error=1`,
        );
      }
      throw error;
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-card">
        <AuthBrand />
        <h1>Verificación en dos pasos</h1>
        <p className="lede">Introduce el código de 6 dígitos de tu app de autenticación o un código de respaldo.</p>
        {params.error ? <p className="error">{INVALID_2FA_CODE}</p> : null}
        <form action={verify}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="next" value={next} />
          <label>
            Código
            <input name="code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={16} />
          </label>
          <div className="actions">
            <button className="full" type="submit">
              Continuar
            </button>
          </div>
        </form>
        <p>
          <Link href="/login">Volver al acceso</Link>
        </p>
      </main>
    </div>
  );
}
