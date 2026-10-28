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
    "CARTA DE CONSENTIMIENTO Y EXONERACIÓN DE RESPONSABILIDAD",
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
    "En pleno uso de mis facultades físicas y mentales, DECLARO Y ACEPTO lo siguiente:",
    "",
    "Asunción de Riesgos: Reconozco que participar en este evento deportivo implica riesgos inherentes (lesiones físicas, caídas, accidentes, condiciones climáticas o del terreno), los cuales asumo de manera consciente y voluntaria antes, durante y después de la competencia.",
    "",
    "Exoneración: Eximo expresamente de cualquier responsabilidad civil, penal o de otra índole a los organizadores, patrocinadores, colaboradores, voluntarios y administradores de la plataforma por cualquier daño, lesión, pérdida material o accidente que pudiera sufrir.",
    "",
    "Derechos de Imagen y Video: Autorizo y cedo de manera irrevocable a los organizadores el uso libre de mi imagen, voz y video capturados durante el evento, a través de cualquier medio de comunicación o difusión, sin derecho a compensación económica o contraprestación alguna.",
    "",
    "Condiciones Físicas y Reglamento: Certifico que me encuentro en óptimas condiciones físicas para participar, asumo los gastos médicos por cualquier emergencia y me comprometo a cumplir con las normas del evento y las indicaciones del staff.",
    "",
    "HE LEÍDO Y COMPRENDIDO ESTE DOCUMENTO EN SU TOTALIDAD, ACEPTANDO SUS TÉRMINOS DE FORMA VOLUNTARIA.",
    "",
    `Fecha de emisión: ${shown(data.issuedAt)}`,
    "",
    "NOMBRE Y FIRMA DE CONFORMIDAD",
    participant,
  ];
}

export function buildWaiverPdf(lines: string[]): Uint8Array {
  const wrapped = lines.flatMap((line) => wrapLine(line, 92));
  const lineHeight = 13;
  const top = 750;
  const bottom = 54;
  const linesPerPage = Math.max(1, Math.floor((top - bottom) / lineHeight));
  const pages: string[][] = [];
  for (let index = 0; index < wrapped.length; index += linesPerPage) {
    pages.push(wrapped.slice(index, index + linesPerPage));
  }
  if (pages.length === 0) pages.push([""]);

  const contentStreams = pages.map((pageLines, pageIndex) => {
    const commands = ["BT", "/F1 10 Tf", `72 ${top} Td`];
    pageLines.forEach((line, index) => {
      if (index === 0 && pageIndex === 0) {
        commands.push("/F1 13 Tf", `(${pdfText(line)}) Tj`, "/F1 10 Tf");
        return;
      }
      if (index === 0) {
        commands.push(`(${pdfText(line)}) Tj`);
        return;
      }
      commands.push(`0 -${lineHeight} Td`, `(${pdfText(line)}) Tj`);
    });
    commands.push("ET");
    return commands.join("\n");
  });

  // Objects: 1 catalog, 2 pages, then pairs of page/content, then font.
  const objects: string[] = [];
  const pageRefs: number[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(""); // placeholder for pages tree
  pages.forEach((pageLines, index) => {
    const pageObject = objects.length + 1;
    const contentObject = objects.length + 2;
    pageRefs.push(pageObject);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObject} 0 R /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> >>`,
    );
    const stream = contentStreams[index]!;
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    void pageLines;
  });
  const fontObject = objects.length + 1;
  objects[1] =
    `<< /Type /Pages /Kids [${pageRefs.map((n) => `${n} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  // Fix font refs now that we know font object number
  for (let index = 0; index < pages.length; index += 1) {
    const pageObjectIndex = 2 + index * 2;
    objects[pageObjectIndex] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${pageObjectIndex + 2} 0 R /Resources << /Font << /F1 ${fontObject} 0 R >> >> >>`;
  }
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

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
