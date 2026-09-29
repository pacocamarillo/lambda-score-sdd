import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/app/auth-brand";
import { PasswordField } from "@/app/password-field";
import { signIn } from "@/lib/auth";
import { createOrganization } from "@/modules/access/create-organization";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  async function signup(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    const result = await createOrganization({
      organizationName: String(formData.get("organizationName") ?? ""),
      subdomain: String(formData.get("subdomain") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password,
      confirmation: String(formData.get("confirmation") ?? ""),
    });
    if (!result.ok) {
      redirect(`/signup?error=${encodeURIComponent(result.message)}`);
    }
    try {
      await signIn("credentials", { email: result.email, password, redirectTo: "/admin" });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") redirect("/login?error=1");
      throw error;
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-card">
      <AuthBrand />
      <h1>Crear organización</h1>
      <p className="lede">Registra tu organización y entra al panel.</p>
      {params.error ? <p className="error">{params.error}</p> : null}
      <form action={signup}>
        <label>
          Nombre de la organización
          <input name="organizationName" required />
        </label>
        <label>
          Subdominio
          <input name="subdomain" required minLength={3} maxLength={63} />
        </label>
        <label>
          Tu nombre
          <input name="name" required />
        </label>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <PasswordField name="password" label="Contraseña" autoComplete="new-password" minLength={8} />
        <PasswordField name="confirmation" label="Confirmar contraseña" autoComplete="new-password" minLength={8} />
        <button className="full" type="submit">Crear organización</button>
      </form>
      </main>
    </div>
  );
}
