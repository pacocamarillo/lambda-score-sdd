import { z } from "zod";
import { Resend } from "resend";
import type { ServiceId } from "@/marketing/lib/content";

const serviceIds = [
  "asesoria",
  "cronometraje",
  "arco",
  "vallas",
  "marketing",
] as const satisfies readonly ServiceId[];

export const quoteSchema = z
  .object({
    firstName: z.string().trim().min(1, "El nombre es obligatorio"),
    lastName: z.string().trim().min(1, "Los apellidos son obligatorios"),
    phone: z.string().trim().min(7, "El teléfono es obligatorio"),
    email: z.string().trim().email("Correo inválido"),
    emailConfirm: z.string().trim().email("Confirmación inválida"),
    firstRace: z.boolean({ error: "Indica si es tu primera carrera" }),
    eventType: z.enum(["running", "mtb", "triathlon", "swim", "other"], {
      error: "Elige el tipo de evento",
    }),
    services: z
      .array(z.enum(serviceIds))
      .min(1, "Selecciona al menos un servicio"),
    street: z.string().trim().min(1, "La dirección es obligatoria"),
    city: z.string().trim().min(1, "La ciudad es obligatoria"),
    state: z.string().trim().min(1, "El estado es obligatorio"),
    postalCode: z.string().trim().min(1, "El código postal es obligatorio"),
    tentativeDate: z.string().optional(),
    estimatedParticipants: z.number().positive().optional(),
    message: z.string().optional(),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: "Los correos no coinciden",
    path: ["emailConfirm"],
  });

export const surveySchema = z.object({
  organizer: z.string().trim().min(1, "El organizador es obligatorio"),
  eventName: z.string().trim().min(1, "El evento es obligatorio"),
  eventDate: z.string().trim().min(1, "La fecha es obligatoria"),
  scores: z
    .array(z.number().int().min(1).max(5))
    .length(10, "Responde las diez preguntas"),
  comment: z.string().optional(),
});

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendQuoteEmail(
  data: z.infer<typeof quoteSchema>,
): Promise<{ ok: true } | { ok: false; error: "unavailable" }> {
  const resend = getResend();
  const to = process.env.QUOTE_TO_EMAIL || "contacto@lambdascore.com.mx";
  if (!resend) {
    console.error("RESEND_API_KEY missing");
    return { ok: false, error: "unavailable" };
  }

  const firstRaceLabel = data.firstRace ? "SÍ — primera carrera" : "No";
  const subject = data.firstRace
    ? `[Primera carrera] Cotización LambdaScore — ${data.firstName} ${data.lastName}`
    : `Cotización LambdaScore — ${data.firstName} ${data.lastName}`;

  const text = [
    `Fecha de envío: ${new Date().toISOString()}`,
    `Nombre: ${data.firstName} ${data.lastName}`,
    `Teléfono: ${data.phone}`,
    `Correo: ${data.email}`,
    `Primera carrera: ${firstRaceLabel}`,
    `Tipo de evento: ${data.eventType}`,
    `Servicios: ${data.services.join(", ")}`,
    `Dirección: ${data.street}, ${data.city}, ${data.state}, CP ${data.postalCode}`,
    `Fecha tentativa: ${data.tentativeDate || "—"}`,
    `Participantes estimados: ${data.estimatedParticipants ?? "—"}`,
    `Mensaje: ${data.message || "—"}`,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: "LambdaScore Web <onboarding@resend.dev>",
      to: [to],
      replyTo: data.email,
      subject,
      text,
    });
    if (result.error) {
      console.error(result.error);
      return { ok: false, error: "unavailable" };
    }
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "unavailable" };
  }
}

export async function sendSurveyEmail(
  data: z.infer<typeof surveySchema>,
): Promise<{ ok: true } | { ok: false; error: "unavailable" }> {
  const resend = getResend();
  const to = process.env.QUOTE_TO_EMAIL || "contacto@lambdascore.com.mx";
  if (!resend) {
    console.error("RESEND_API_KEY missing");
    return { ok: false, error: "unavailable" };
  }

  const labels = [
    "Experiencia general",
    "Cotización y contratación",
    "Comunicación previa",
    "Puntualidad y montaje",
    "Desempeño RFID",
    "Precisión de resultados",
    "Rapidez de resultados y certificados",
    "Trato del personal",
    "Relación calidad-precio",
    "Soporte ante imprevistos",
  ];

  const text = [
    `Fecha de envío: ${new Date().toISOString()}`,
    `Organizador: ${data.organizer}`,
    `Evento: ${data.eventName}`,
    `Fecha del evento: ${data.eventDate}`,
    ...data.scores.map((score, index) => `${labels[index]}: ${score}/5`),
    `Comentario: ${data.comment || "—"}`,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: "LambdaScore Web <onboarding@resend.dev>",
      to: [to],
      subject: `Encuesta LambdaScore — ${data.eventName}`,
      text,
    });
    if (result.error) {
      console.error(result.error);
      return { ok: false, error: "unavailable" };
    }
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "unavailable" };
  }
}
