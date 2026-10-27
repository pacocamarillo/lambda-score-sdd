import { describe, expect, it } from "vitest";
import {
  ageOnDate,
  filterCategoryOptions,
  optionEligibleForAge,
} from "@/modules/events/category-eligibility";

describe("elegibilidad de categorías", () => {
  it("calcula la edad al día del evento", () => {
    expect(ageOnDate("2010-06-15", new Date("2026-06-14T12:00:00"))).toBe(15);
    expect(ageOnDate("2010-06-15", new Date("2026-06-15T12:00:00"))).toBe(16);
  });

  it("filtra MTB por edad", () => {
    expect(optionEligibleForAge("INFANTIL A", 9, "mtb")).toBe(true);
    expect(optionEligibleForAge("INFANTIL A", 8, "mtb")).toBe(false);
    expect(optionEligibleForAge("JUVENIL B", 15, "mtb")).toBe(true);
    expect(optionEligibleForAge("JUVENIL B", 17, "mtb")).toBe(false);
    expect(optionEligibleForAge("JUVENIL C", 19, "mtb")).toBe(true);
    expect(optionEligibleForAge("MASTER 20", 19, "mtb")).toBe(false);
    expect(optionEligibleForAge("MASTER 20", 20, "mtb")).toBe(true);
    expect(optionEligibleForAge("MASTER 40", 42, "mtb")).toBe(true);
    expect(optionEligibleForAge("MASTER 70", 72, "mtb")).toBe(true);
    expect(optionEligibleForAge("ELITE", 12, "mtb")).toBe(true);
    expect(optionEligibleForAge("PRINCIPIANTES", 40, "mtb")).toBe(true);
    expect(optionEligibleForAge("PRINCIPAINTE", 40, "mtb")).toBe(true);
  });

  it("filtra running por edad", () => {
    expect(optionEligibleForAge("JUVENIL", 16, "running")).toBe(true);
    expect(optionEligibleForAge("LIBRE", 25, "running")).toBe(true);
    expect(optionEligibleForAge("MASTER", 41, "running")).toBe(true);
    expect(optionEligibleForAge("MASTER", 30, "running")).toBe(false);
  });

  it("oculta categorías varoniles a una mujer", () => {
    const options = filterCategoryOptions({
      label: "Categoría MTB Varonil",
      options: ["JUVENIL B", "MASTER 30"],
      gender: "female",
      birthDate: "1995-01-01",
      eventDate: new Date("2026-10-01"),
    });
    expect(options).toEqual([]);
  });

  it("deja solo la categoría de edad correcta para un hombre", () => {
    const options = filterCategoryOptions({
      label: "Categoría MTB Varonil",
      options: ["JUVENIL B", "MASTER 30", "ELITE"],
      gender: "male",
      birthDate: "1995-01-01",
      eventDate: new Date("2026-10-01"),
    });
    expect(options).toEqual(["MASTER 30", "ELITE"]);
  });
});
