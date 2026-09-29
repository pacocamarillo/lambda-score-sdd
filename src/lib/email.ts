import { Resend } from "resend";

type MailKind = "magic" | "reset" | "invite";

const subjects: Record<MailKind, string> = {
  magic: "Tu enlace de acceso",
  reset: "Restablece tu contraseña",
  invite: "Invitación al equipo",
};

export async function sendAccessEmail(input: { to: string; kind: MailKind; url: string }): Promise<void> {
  const subject = subjects[input.kind];
  const text = [
    "Hola.",
    "",
    input.kind === "invite"
      ? "Te invitaron a un equipo. Abre este enlace para crear tu contraseña. Caduca en 24 horas y solo puede usarse una vez."
      : "Abre este enlace para continuar. Caduca en 24 horas y solo puede usarse una vez.",
    "",
    input.url,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[correo:${input.kind}] para ${input.to}\n${text}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "avisos@example.com",
    to: input.to,
    subject,
    text,
  });
}

export function appUrl(path: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
