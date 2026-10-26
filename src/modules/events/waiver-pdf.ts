export type WaiverData = {
  eventName: string;
  eventDate: string;
  venue: string;
  competitionName: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email: string;
  category: string;
  issuedAt: string;
};

const WIN_ANSI: Record<string, number> = {
  "¡": 0xa1,
  "¿": 0xbf,
  Á: 0xc1,
  É: 0xc9,
  Í: 0xcd,
  Ñ: 0xd1,
  Ó: 0xd3,
  Ú: 0xda,
  Ü: 0xdc,
  á: 0xe1,
  é: 0xe9,
  í: 0xed,
  ñ: 0xf1,
  ó: 0xf3,
  ú: 0xfa,
  ü: 0xfc,
};

export function buildWaiverLines(data: WaiverData): string[] {
  const participant = [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || "No indicado";
  return [
    "CARTA DE EXONERACIÓN DE RESPONSABILIDAD",
    "",
    `Evento: ${shown(data.eventName)}`,
    `Fecha del evento: ${shown(data.eventDate)}`,
    `Lugar: ${shown(data.venue)}`,
    `Competencia: ${shown(data.competitionName)}`,
    "",
    `Participante: ${participant}`,
    `Género: ${shown(data.gender)}`,
    `Fecha de nacimiento: ${shown(data.birthDate)}`,
    `Correo: ${shown(data.email)}`,
    `Categoría: ${shown(data.category)}`,
    "",
    "El participante declara que conoce los riesgos propios de la actividad deportiva, que su participación es voluntaria y que cuenta con las condiciones de salud necesarias para tomar parte.",
    "",
    "Con la aceptación de esta carta, el participante libera al organizador, a su personal y a los colaboradores del evento de reclamaciones por lesiones, daños o pérdidas derivados de su participación, en la medida en que la ley aplicable lo permita.",
    "",
    "Esta carta se genera con la información del evento y del participante al momento de la descarga.",
    "",
    `Fecha de emisión: ${shown(data.issuedAt)}`,
  ];
}

export function buildWaiverPdf(lines: string[]): Uint8Array {
  const wrapped = lines.flatMap((line) => wrapLine(line, 88));
  const commands = ["BT", "/F1 11 Tf", "72 750 Td"];
  wrapped.forEach((line, index) => {
    if (index === 0) {
      commands.push("/F1 16 Tf", `(${pdfText(line)}) Tj`, "/F1 11 Tf");
      return;
    }
    commands.push("0 -16 Td", `(${pdfText(line)}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}

function shown(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean || "No indicado";
}

function wrapLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const words = line.split(" ");
  const rows: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      rows.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows;
}

function pdfText(value: string): string {
  let encoded = "";
  for (const char of value) {
    if (char === "\\") {
      encoded += "\\\\";
      continue;
    }
    if (char === "(" || char === ")") {
      encoded += `\\${char}`;
      continue;
    }
    const code = WIN_ANSI[char];
    if (code != null) {
      encoded += `\\${code.toString(8).padStart(3, "0")}`;
      continue;
    }
    encoded += char.charCodeAt(0) < 128 ? char : "?";
  }
  return encoded;
}
