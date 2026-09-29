import Link from "next/link";
import { requestMagicLink } from "@/modules/access/magic-link";

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  async function requestLink(formData: FormData) {
    "use server";
    await requestMagicLink(String(formData.get("email") ?? ""));
    const { redirect } = await import("next/navigation");
    redirect("/login/magic?sent=1");
  }

  return (
    <main className="auth-card">
      <h1>Enlace de acceso</h1>
      {params.sent ? <p className="notice">Si el correo está registrado, enviamos un enlace de acceso.</p> : null}
      {params.error ? (
        <p className="error">
          El enlace no es válido o ya se usó. <Link href="/login">Pide otro</Link>.
        </p>
      ) : null}
      <form action={requestLink}>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <button type="submit">Enviar enlace</button>
      </form>
    </main>
  );
}
