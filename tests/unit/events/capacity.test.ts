import { describe, expect, it } from "vitest";
import { formatBib } from "@/modules/events/bib";
import { capacityAvailable, capacityFull } from "@/modules/events/capacity";
import {
  canPublish,
  describePublishBlockers,
  type PublishBlockers,
} from "@/modules/events/publish";
import { registrationIsOpen } from "@/modules/events/crud";

describe("cupo y publicación", () => {
  it("rechaza la inscripción N+1 cuando el cupo es N", () => {
    const capacity = 1;
    expect(capacityAvailable(capacity, 0)).toBe(true);
    expect(capacityAvailable(capacity, 1)).toBe(false);
    expect(capacityFull(capacity, 1)).toBe(true);
    expect(capacityAvailable(null, 1000)).toBe(true);
  });

  it("no publica un borrador incompleto", () => {
    const blockers: PublishBlockers = {
      missingName: false,
      missingDate: false,
      missingVenue: true,
      missingCompetition: true,
      competitionWithoutPrice: false,
    };
    expect(canPublish(blockers)).toBe(false);
    expect(describePublishBlockers(blockers).join(" ")).toMatch(/lugar/i);
    expect(describePublishBlockers(blockers).join(" ")).toMatch(/competencia/i);
  });

  it("formatea el folio con prefijo", () => {
    expect(formatBib("A-", 12)).toBe("A-12");
    expect(formatBib("", 1)).toBe("1");
  });

  it("un evento publicado con inscripción cerrada no acepta registros", () => {
    expect(
      registrationIsOpen({
        status: "published",
        registrationOpen: false,
        registrationDeadline: null,
      }),
    ).toBe(false);
    expect(
      registrationIsOpen({
        status: "published",
        registrationOpen: true,
        registrationDeadline: null,
      }),
    ).toBe(true);
    expect(
      registrationIsOpen({
        status: "draft",
        registrationOpen: true,
        registrationDeadline: null,
      }),
    ).toBe(false);
  });
});

describe("folio único (secuencias)", () => {
  it("dos números consecutivos no comparten el mismo folio formateado", () => {
    const first = formatBib("X", 1);
    const second = formatBib("X", 2);
    expect(first).not.toBe(second);
  });
});
