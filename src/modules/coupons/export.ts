import { couponStatus, formatCouponDiscount } from "@/modules/coupons/parse";
import { listOrganizationCoupons } from "@/modules/coupons/crud";
import { listOrganizationEvents } from "@/modules/events/crud";

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

function statusLabel(status: "active" | "exhausted" | "expired") {
  if (status === "exhausted") return "Agotado";
  if (status === "expired") return "Vencido";
  return "Disponible";
}

function appliesLabel(registration: boolean, addOns: boolean) {
  if (registration && addOns) return "Inscripción y adicionales";
  if (registration) return "Inscripción";
  if (addOns) return "Adicionales";
  return "—";
}

/** Genera un libro Excel 2003 XML (.xls) con los cupones de la organización. */
export async function buildCouponsExcel(
  organizationId: string,
): Promise<{ ok: true; filename: string; body: string } | { ok: false; message: string }> {
  const [rows, events] = await Promise.all([
    listOrganizationCoupons(organizationId),
    listOrganizationEvents(organizationId),
  ]);
  const eventName = new Map(events.map((event) => [event.id, event.name]));

  const headers = [
    "Código",
    "Descuento",
    "Descripción",
    "Aplica a",
    "Eventos",
    "Usos",
    "Límite",
    "Vence",
    "Estado",
  ];

  const dataRows = rows.map((row) => [
    row.code,
    formatCouponDiscount(row),
    row.description,
    appliesLabel(row.appliesToRegistration, row.appliesToAddOns),
    row.allEvents
      ? "Todos los eventos"
      : row.eventIds.map((id) => eventName.get(id) ?? id).join(", ") || "—",
    String(row.useCount),
    row.usageLimit == null ? "" : String(row.usageLimit),
    row.expiresAt
      ? row.expiresAt.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })
      : "Sin vencimiento",
    statusLabel(couponStatus(row)),
  ]);

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
 <Worksheet ss:Name="Cupones">
  <Table>
${sheetRows}
  </Table>
 </Worksheet>
</Workbook>
`;

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    filename: `cupones-${stamp}.xls`,
    body,
  };
}
