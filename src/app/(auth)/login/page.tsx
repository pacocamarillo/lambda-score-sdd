import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/app/auth-brand";
import { PasswordField } from "@/app/password-field";
import { signIn } from "@/lib/auth";
import { INVALID_CREDENTIALS, verifyLogin } from "@/modules/access/login";
import { createLogin2faToken, userRequiresTotp } from "@/modules/access/login-2fa";
import { requestMagicLink } from "@/modules/access/magic-link";
import { safeNextPath } from "@/modules/access/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const destination = safeNextPath(String(formData.get("next") ?? ""));
    const verified = await verifyLogin(email, password);
    if (!verified.ok) {
      redirect(`/login?next=${encodeURIComponent(destination)}&error=1`);
    }
    if (await userRequiresTotp(verified.userId)) {
      const ticket = await createLogin2faToken(verified.userId, verified.email);
      redirect(
        `/login/verify-2fa?token=${encodeURIComponent(ticket)}&next=${encodeURIComponent(destination)}`,
      );
    }
    try {
      await signIn("credentials", { email, password, redirectTo: destination });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") {
        redirect(`/login?next=${encodeURIComponent(destination)}&error=1`);
      }
      throw error;
    }
  }

  async function sendLink(formData: FormData) {
    "use server";
    await requestMagicLink(String(formData.get("email") ?? ""));
    redirect("/login?sent=1");
  }

  return (
    <div className="auth-page">
      <main className="auth-card">
      <AuthBrand />
      <h1>Entrar</h1>
      <p className="lede">Usa el correo de tu organización.</p>
      {params.error ? <p className="error">{INVALID_CREDENTIALS}</p> : null}
      {params.sent ? (
        <p className="notice">Si el correo está registrado, enviamos un enlace de acceso. Caduca en 24 horas y solo sirve una vez.</p>
      ) : null}
      <form action={login}>
        <input type="hidden" name="next" value={next} />
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <PasswordField name="password" label="Contraseña" autoComplete="current-password" />
        <div className="actions">
          <button className="full" type="submit">
            Entrar con contraseña
          </button>
        </div>
      </form>
      <div className="divider">o</div>
      <form action={sendLink}>
        <label>
          Correo para el enlace
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <button className="ghost full" type="submit">
          Enviarme un enlace por correo
        </button>
      </form>
      <p>
        <Link href="/reset">¿Olvidaste tu contraseña?</Link>
      </p>
      <p>
        ¿Aún no tienes organización? <Link href="/signup">Crear organización</Link>
      </p>
      </main>
    </div>
  );
}
