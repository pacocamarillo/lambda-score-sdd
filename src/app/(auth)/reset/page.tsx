import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/modules/access/reset-password";

export default async function ResetRequestPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;
  async function requestReset(formData: FormData) {
    "use server";
    await requestPasswordReset(String(formData.get("email") ?? ""));
    redirect("/reset?sent=1");
  }

  return (
    <main className="shell">
      <h1>Restablecer contraseña</h1>
      {params.sent ? <p>Si el correo está registrado, enviamos un enlace para restablecer la contraseña.</p> : null}
      <form action={requestReset}>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <button type="submit">Enviar enlace</button>
      </form>
    </main>
  );
}
