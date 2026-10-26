import { describe, expect, it } from "vitest";
import { mergeCategoryOptions, parseCustomCategoryNames } from "@/modules/events/custom-categories";
import { MTB_CATEGORY_NAMES } from "@/modules/events/category-catalog";

describe("categorías propias", () => {
  it("separa nombres escritos por línea o por coma", () => {
    expect(parseCustomCategoryNames("Elite local\nParejas,  elite local")).toEqual([
      "Elite local",
      "Parejas",
    ]);
  });

  it("conserva el catálogo marcado y agrega las categorías nuevas", () => {
    expect(mergeCategoryOptions(["ELITE"], "Parejas\nELITE", MTB_CATEGORY_NAMES)).toEqual([
      "ELITE",
      "Parejas",
    ]);
  });

  it("acepta una categoría del catálogo escrita a mano", () => {
    expect(mergeCategoryOptions([], "master 40", MTB_CATEGORY_NAMES)).toEqual(["MASTER 40"]);
  });
});
