import { describe, expect, it } from "vitest";
import { buildWaiverLines, buildWaiverPdf } from "@/modules/events/waiver-pdf";

describe("carta de exoneración", () => {
  it("incluye evento y participante", () => {
    const lines = buildWaiverLines({
      eventName: "Carrera Norte",
      eventDate: "26 de octubre de 2026",
      venue: "Bosque",
      competitionName: "10K",
      firstName: "Ana",
      lastName: "López",
      gender: "Femenil",
      birthDate: "1 de enero de 1990",
      email: "ana@example.com",
      category: "LIBRE",
      issuedAt: "26 de octubre de 2026",
    });
    expect(lines.join("\n")).toContain("Carrera Norte");
    expect(lines.join("\n")).toContain("Ana López");
    expect(lines.join("\n")).toContain("CARTA DE EXONERACIÓN");
  });

  it("genera un PDF descargable", () => {
    const pdf = buildWaiverPdf(buildWaiverLines({
      eventName: "Carrera Norte",
      eventDate: "26 de octubre de 2026",
      venue: "Bosque",
      competitionName: "10K",
      firstName: "Ana",
      lastName: "Lopez",
      gender: "Femenil",
      birthDate: "1 de enero de 1990",
      email: "ana@example.com",
      category: "LIBRE",
      issuedAt: "26 de octubre de 2026",
    }));
    const header = new TextDecoder().decode(pdf.slice(0, 8));
    expect(header).toBe("%PDF-1.4");
    expect(new TextDecoder().decode(pdf)).toContain("Carrera Norte");
  });
});
