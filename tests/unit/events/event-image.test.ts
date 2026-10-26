import { describe, expect, it } from "vitest";
import { validateEventImage } from "@/modules/events/event-image";

function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  bytes[16] = (width >>> 24) & 255;
  bytes[17] = (width >>> 16) & 255;
  bytes[18] = (width >>> 8) & 255;
  bytes[19] = width & 255;
  bytes[20] = (height >>> 24) & 255;
  bytes[21] = (height >>> 16) & 255;
  bytes[22] = (height >>> 8) & 255;
  bytes[23] = height & 255;
  return bytes;
}

describe("imagen del evento", () => {
  it("acepta 1200×630 y un tamaño mayor con la misma proporción", () => {
    expect(validateEventImage(png(1200, 630)).ok).toBe(true);
    expect(validateEventImage(png(2400, 1260)).ok).toBe(true);
  });

  it("rechaza medidas menores o una proporción distinta", () => {
    const small = validateEventImage(png(800, 420));
    const wide = validateEventImage(png(2000, 630));
    expect(small.ok).toBe(false);
    expect(wide.ok).toBe(false);
  });

  it("rechaza archivos que no son PNG, JPG o GIF", () => {
    const result = validateEventImage(new Uint8Array([1, 2, 3, 4]));
    expect(result.ok).toBe(false);
  });

  it("rechaza más de 3 MB", () => {
    const bytes = new Uint8Array(3 * 1024 * 1024 + 1);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
    const result = validateEventImage(bytes);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("3 MB");
  });
});
