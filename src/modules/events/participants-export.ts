import { GENDER_ANSWER_KEY, parseGender } from "@/modules/events/category-eligibility";
import { listFormFields } from "@/modules/events/form";
import { listEventRegistrations } from "@/modules/events/register";

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  return "Pendiente de pago";
}

function genderLabel(value: unknown) {
  const gender = parseGender(value);
  if (gender === "male") return "Varonil";
  if (gender === "female") return "Femenil";
  return "";
}

function toDateCell(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cellXml(value: string) {
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

/** Genera un libro Excel 2003 XML (.xls) con las inscripciones del evento. */
export async function buildParticipantsExcel(
  eventId: string,
  organizationId: string,
): Promise<{ ok: true; filename: string; body: string } | { ok: false; message: string }> {
  const rows = await listEventRegistrations(eventId, organizationId);
  const fields = (await listFormFields(eventId)).filter((field) => field.fieldType !== "heading");

  const headers = [
    "Folio",
    "Nombre",
    "Apellido",
    "Correo",
    "Género",
    "Fecha de nacimiento",
    "Tipo de documento",
    "Número de documento",
    "Competencia",
    "Estado",
    "Fecha de inscripción",
    ...fields.map((field) => field.label),
  ];

  const dataRows = rows.map((row) => {
    const answers = row.answers ?? {};
    return [
      row.bib ?? "",
      row.firstName,
      row.lastName,
      row.email,
      genderLabel(answers[GENDER_ANSWER_KEY]),
      toDateCell(row.birthDate),
      row.documentType.toUpperCase(),
      row.documentNumber,
      row.competitionName,
      statusLabel(row.status),
      toDateCell(row.createdAt),
      ...fields.map((field) => String(answers[field.id] ?? "")),
    ];
  });

  const sheetRows = [headers, ...dataRows]
    .map((cells) => `<Row>${cells.map((cell) => cellXml(cell)).join("")}</Row>`)
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Participantes">
  <Table>
${sheetRows}
  </Table>
 </Worksheet>
</Workbook>
`;

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    filename: `participantes-${eventId.slice(0, 8)}-${stamp}.xls`,
    body,
  };
}
