const MAX_BYTES = 3 * 1024 * 1024;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 630;
const TARGET_RATIO = MIN_WIDTH / MIN_HEIGHT;
const RATIO_TOLERANCE = 0.1;

const MIME_BY_EXT = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
} as const;

export type EventImageCheck =
  | { ok: true; ext: "png" | "jpg" | "gif"; width: number; height: number }
  | { ok: false; message: string };

/** Guarda la imagen embebida para que sobreviva en Vercel (sin disco persistente). */
export function toEventImageDataUrl(bytes: Uint8Array, ext: keyof typeof MIME_BY_EXT): string {
  return `data:${MIME_BY_EXT[ext]};base64,${Buffer.from(bytes).toString("base64")}`;
}

export function parseEventImageDataUrl(
  imageKey: string,
): { contentType: string; bytes: Buffer } | null {
  const match = /^data:(image\/(?:png|jpeg|gif));base64,([A-Za-z0-9+/=\s]+)$/i.exec(imageKey.trim());
  if (!match) return null;
  return {
    contentType: match[1]!.toLowerCase(),
    bytes: Buffer.from(match[2]!.replace(/\s+/g, ""), "base64"),
  };
}

export function eventBannerPath(eventId: string, imageKey: string | null | undefined): string | null {
  if (!imageKey) return null;
  const version = encodeURIComponent(imageKey.slice(-24));
  return `/eventos/${eventId}/banner?v=${version}`;
}

export function validateEventImage(bytes: Uint8Array): EventImageCheck {
  if (bytes.byteLength === 0) {
    return { ok: false, message: "Selecciona una imagen." };
  }
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, message: "La imagen no puede superar 3 MB." };
  }

  const size = readImageSize(bytes);
  if (!size) {
    return { ok: false, message: "La imagen debe ser PNG, JPG o GIF." };
  }

  if (size.width < MIN_WIDTH || size.height < MIN_HEIGHT) {
    return {
      ok: false,
      message: `La imagen debe medir al menos ${MIN_WIDTH}×${MIN_HEIGHT} px. Esta mide ${size.width}×${size.height} px.`,
    };
  }

  const ratio = size.width / size.height;
  if (Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO > RATIO_TOLERANCE) {
    return {
      ok: false,
      message: `La imagen debe conservar una proporción cercana a 1.91:1 (1200×630). Esta mide ${size.width}×${size.height} px.`,
    };
  }

  return { ok: true, ext: size.ext, width: size.width, height: size.height };
}

function readImageSize(
  bytes: Uint8Array,
): { width: number; height: number; ext: "png" | "jpg" | "gif" } | null {
  return readPngSize(bytes) ?? readGifSize(bytes) ?? readJpegSize(bytes);
}

function readPngSize(bytes: Uint8Array): { width: number; height: number; ext: "png" } | null {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 24) return null;
  for (let index = 0; index < signature.length; index += 1) {
    if (bytes[index] !== signature[index]) return null;
  }
  const width = readU32(bytes, 16);
  const height = readU32(bytes, 20);
  if (width <= 0 || height <= 0) return null;
  return { width, height, ext: "png" };
}

function readGifSize(bytes: Uint8Array): { width: number; height: number; ext: "gif" } | null {
  if (bytes.length < 10) return null;
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]);
  if (header !== "GIF87a" && header !== "GIF89a") return null;
  const width = bytes[6] | (bytes[7] << 8);
  const height = bytes[8] | (bytes[9] << 8);
  if (width <= 0 || height <= 0) return null;
  return { width, height, ext: "gif" };
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number; ext: "jpg" } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0);
    if (length < 2 || offset + 2 + length > bytes.length) return null;
    if (marker >= 0xc0 && marker <= 0xc2) {
      const height = ((bytes[offset + 5] ?? 0) << 8) + (bytes[offset + 6] ?? 0);
      const width = ((bytes[offset + 7] ?? 0) << 8) + (bytes[offset + 8] ?? 0);
      if (width <= 0 || height <= 0) return null;
      return { width, height, ext: "jpg" };
    }
    offset += 2 + length;
  }
  return null;
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  ) >>> 0;
}
