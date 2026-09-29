import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PasswordField } from "@/app/password-field";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/access";
import { auth } from "@/lib/auth";
import { changePassword } from "@/modules/access/change-password";
import { updateDisplayName } from "@/modules/access/profile";
import {
  beginTotpSetup,
  cancelTotpSetup,
  confirmTotpSetup,
  disableTotp,
  getPendingTotpSetup,
  getTotpStatus,
} from "@/modules/access/two-factor";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; twofa_backup?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const params = await searchParams;
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) redirect("/login");

  const totpStatus = await getTotpStatus(user.id);
  const pendingSetup = totpStatus.pending ? await getPendingTotpSetup(user.id) : null;

  let backupCodesToShow: string[] | null = null;
  if (params.twofa_backup) {
    const jar = await cookies();
    const raw = jar.get("twofa_backup")?.value;
    jar.delete("twofa_backup");
    if (raw) {
      backupCodesToShow = raw.split("|").filter(Boolean);
    }
  }

  async function saveName(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    const result = await updateDisplayName({ userId: current.user.id, name: String(formData.get("name") ?? "") });
    if (!result.ok) redirect(`/admin/profile?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/profile?saved=nombre");
  }

  async function savePassword(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    const result = await changePassword({
      userId: current.user.id,
      currentPassword: String(formData.get("current") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
    });
    if (!result.ok) redirect(`/admin/profile?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/profile?saved=clave");
  }

  async function start2fa() {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    const result = await beginTotpSetup(current.user.id);
    if (!result.ok) redirect(`/admin/profile?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/profile?saved=2fa-setup");
  }

  async function confirm2fa(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    const result = await confirmTotpSetup(current.user.id, String(formData.get("code") ?? ""));
    if (!result.ok) redirect(`/admin/profile?error=${encodeURIComponent(result.message)}`);
    const jar = await cookies();
    jar.set("twofa_backup", result.backupCodes.join("|"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
      path: "/admin/profile",
      sameSite: "lax",
    });
    redirect("/admin/profile?twofa_backup=1");
  }

  async function cancel2fa() {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    await cancelTotpSetup(current.user.id);
    redirect("/admin/profile?saved=2fa-cancel");
  }

  async function turnOff2fa(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.user?.id) redirect("/login");
    const result = await disableTotp(
      current.user.id,
      String(formData.get("current") ?? ""),
      String(formData.get("code") ?? ""),
    );
    if (!result.ok) redirect(`/admin/profile?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/profile?saved=2fa-off");
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>Perfil</h1>
          <p className="lede">Tu nombre, contraseña y seguridad de la cuenta. El correo identifica la cuenta y no cambia aquí.</p>
        </div>
      </header>
      {params.error ? <p className="error">{params.error}</p> : null}
      {params.saved === "nombre" ? <p className="notice">El nombre quedó actualizado.</p> : null}
      {params.saved === "clave" ? <p className="notice">La contraseña quedó actualizada.</p> : null}
      {params.saved === "2fa-setup" ? <p className="notice">Escanea el código con tu app de autenticación y confirma con un código.</p> : null}
      {params.saved === "2fa-cancel" ? <p className="notice">Se canceló la configuración de verificación en dos pasos.</p> : null}
      {params.saved === "2fa-off" ? <p className="notice">La verificación en dos pasos quedó desactivada.</p> : null}
      {backupCodesToShow ? (
        <section className="card">
          <h2>Códigos de respaldo</h2>
          <p className="lede">Guárdalos en un lugar seguro. Cada uno solo sirve una vez.</p>
          <ul className="backup-codes">
            {backupCodesToShow.map((code) => (
              <li key={code}>
                <code>{code}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="card">
        <h2>Información del perfil</h2>
        <form action={saveName}>
          <label>
            Nombre
            <input name="name" defaultValue={user.name} required minLength={2} maxLength={120} />
          </label>
          <label>
            Correo
            <input value={user.email} disabled readOnly />
          </label>
          <p className="hint">El correo no se puede modificar.</p>
          <button type="submit">Actualizar perfil</button>
        </form>
      </section>
      <section className="card">
        <h2>Actualizar contraseña</h2>
        <form action={savePassword}>
          <PasswordField name="current" label="Contraseña actual" autoComplete="current-password" />
          <PasswordField name="password" label="Contraseña nueva" autoComplete="new-password" minLength={8} />
          <PasswordField name="confirmation" label="Confirmar contraseña nueva" autoComplete="new-password" minLength={8} />
          <button type="submit">Actualizar contraseña</button>
        </form>
      </section>
      <section className="card">
        <h2>Verificación en dos pasos</h2>
        {totpStatus.enabled ? (
          <>
            <p className="notice">Activa. Al entrar con contraseña se pedirá un código TOTP o de respaldo.</p>
            <form action={turnOff2fa} className="stack">
              <PasswordField name="current" label="Contraseña actual" autoComplete="current-password" />
              <label>
                Código TOTP o de respaldo
                <input name="code" autoComplete="one-time-code" required minLength={6} maxLength={16} />
              </label>
              <button type="submit" className="ghost">
                Desactivar verificación en dos pasos
              </button>
            </form>
          </>
        ) : pendingSetup ? (
          <>
            <p className="lede">Añade esta cuenta a Google Authenticator, 1Password u otra app compatible.</p>
            <p className="hint">
              Clave manual: <code>{pendingSetup.secretBase32}</code>
            </p>
            <p className="hint">
              URI: <code className="break-all">{pendingSetup.uri}</code>
            </p>
            <form action={confirm2fa}>
              <label>
                Código de 6 dígitos
                <input name="code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={6} />
              </label>
              <div className="actions">
                <button type="submit">Confirmar y activar</button>
              </div>
            </form>
            <form action={cancel2fa}>
              <button type="submit" className="ghost">
                Cancelar configuración
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="lede">Opcional. Protege el panel con un segundo paso al usar contraseña. El enlace por correo no lo exige.</p>
            <form action={start2fa}>
              <button type="submit">Activar verificación en dos pasos</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
