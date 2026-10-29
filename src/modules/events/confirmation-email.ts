import QRCode from "qrcode";
import { appUrl, sendHtmlEmail } from "@/lib/email";
import { buildWaiverLines, type WaiverData } from "@/modules/events/waiver-pdf";

export async function sendRegistrationConfirmationEmail(input: {
  to: string;
  eventId: string;
  registrationId: string;
  status: string;
  bib: string | null;
  waiver: WaiverData;
}): Promise<void> {
  const confirmUrl = appUrl(`/eventos/${input.eventId}/confirmacion/${input.registrationId}`);
  const logoUrl = appUrl("/brand/tempozero.jpg");
  const qrDataUrl = await QRCode.toDataURL(confirmUrl, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
  });
  const waiverText = buildWaiverLines(input.waiver).join("\n");
  const statusLabel =
    input.status === "confirmed"
      ? "Inscripción confirmada"
      : input.status === "pending_payment"
        ? "Inscripción recibida · pendiente de pago"
        : `Estado: ${input.status}`;

  const subject = `${statusLabel}: ${input.waiver.eventName}`;
  const text = [
    "TEMPOZERO",
    statusLabel,
    "",
    waiverText,
    "",
    `Ver confirmación: ${confirmUrl}`,
    input.bib ? `Folio: ${input.bib}` : "",
    "",
    `Evento: ${input.waiver.eventName}`,
    `Competencia: ${input.waiver.competitionName}`,
    `Fecha: ${input.waiver.eventDate}`,
    `Lugar: ${input.waiver.venue}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="margin:0;padding:0;background:#0b1220;font-family:Segoe UI,Arial,sans-serif;color:#e8eef7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#101a2e;">
      <tr>
        <td style="padding:20px 20px 8px;text-align:center;">
          <img src="${escapeHtml(logoUrl)}" alt="Tempozero" width="520" style="max-width:100%;height:auto;border:0;display:block;margin:0 auto;" />
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px 4px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#7dffb3;">${escapeHtml(statusLabel)}</p>
          <p style="margin:8px 0 0;color:#9db0c7;font-size:14px;">Escanea el código o abre el enlace para verificar tu participación.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 24px;">
          <div style="background:#0b1220;border:1px solid #24324a;border-radius:12px;padding:16px;">
            <pre style="margin:0;white-space:pre-wrap;font-family:Segoe UI,Arial,sans-serif;font-size:13px;line-height:1.45;color:#d7e2f0;">${escapeHtml(waiverText)}</pre>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px 20px;text-align:center;">
          <img src="${qrDataUrl}" alt="QR de confirmación" width="220" height="220" style="border:0;background:#fff;border-radius:8px;padding:8px;" />
          <p style="margin:12px 0 0;">
            <a href="${escapeHtml(confirmUrl)}" style="color:#5ad0ff;font-size:14px;">${escapeHtml(confirmUrl)}</a>
          </p>
          ${input.bib ? `<p style="margin:8px 0 0;color:#7dffb3;font-weight:700;">Folio: ${escapeHtml(input.bib)}</p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 28px;">
          <div style="border-top:1px solid #24324a;padding-top:16px;color:#9db0c7;font-size:13px;line-height:1.5;">
            <strong style="color:#e8eef7;">${escapeHtml(input.waiver.eventName)}</strong><br />
            Competencia: ${escapeHtml(input.waiver.competitionName)}<br />
            Fecha: ${escapeHtml(input.waiver.eventDate)}<br />
            Lugar: ${escapeHtml(input.waiver.venue)}
          </div>
        </td>
      </tr>
    </table>
  </div>`;

  await sendHtmlEmail({ to: input.to, subject, text, html });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
