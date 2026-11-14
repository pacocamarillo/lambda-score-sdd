import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/db/client";
import { newsPosts } from "@/db/schema/news";
import type { ActionResult } from "@/modules/events/types";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const TARGET_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.12;
const MIN_WIDTH = 1366;
const MIN_HEIGHT = 768;

function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function isPngOrJpeg(bytes: Uint8Array): "png" | "jpg" | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71
  ) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  return null;
}

function readPngSize(bytes: Uint8Array) {
  if (bytes.length < 24) return null;
  const width =
    ((bytes[16] ?? 0) << 24) | ((bytes[17] ?? 0) << 16) | ((bytes[18] ?? 0) << 8) | (bytes[19] ?? 0);
  const height =
    ((bytes[20] ?? 0) << 24) | ((bytes[21] ?? 0) << 16) | ((bytes[22] ?? 0) << 8) | (bytes[23] ?? 0);
  return { width: width >>> 0, height: height >>> 0 };
}

function readJpegSize(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    const length = ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0);
    if (marker >= 0xc0 && marker <= 0xc2) {
      const height = ((bytes[offset + 5] ?? 0) << 8) + (bytes[offset + 6] ?? 0);
      const width = ((bytes[offset + 7] ?? 0) << 8) + (bytes[offset + 8] ?? 0);
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

export function validateNewsImage(bytes: Uint8Array): ActionResult {
  if (bytes.byteLength === 0) return { ok: false, message: "Selecciona una imagen principal." };
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, message: "La imagen no puede superar 3 MB." };
  }
  const kind = isPngOrJpeg(bytes);
  if (!kind) return { ok: false, message: "La imagen debe ser PNG o JPG." };
  const size = kind === "png" ? readPngSize(bytes) : readJpegSize(bytes);
  if (!size || size.width <= 0 || size.height <= 0) {
    return { ok: false, message: "No se pudo leer el tamaño de la imagen." };
  }
  const ratio = size.width / size.height;
  const ratioOk = Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO <= RATIO_TOLERANCE;
  const sizeOk = size.width >= MIN_WIDTH && size.height >= MIN_HEIGHT;
  if (!ratioOk && !sizeOk) {
    return {
      ok: false,
      message: `La imagen debe ser 16:9 o al menos ${MIN_WIDTH}×${MIN_HEIGHT} px. Esta mide ${size.width}×${size.height} px.`,
    };
  }
  return { ok: true };
}

function toDataUrl(bytes: Uint8Array, kind: "png" | "jpg") {
  const mime = kind === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function listNewsPosts(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(newsPosts)
    .where(eq(newsPosts.organizationId, organizationId))
    .orderBy(desc(newsPosts.publishedAt), desc(newsPosts.createdAt));
}

export async function listPublishedNews(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.organizationId, organizationId), eq(newsPosts.status, "published")))
    .orderBy(desc(newsPosts.publishedAt), desc(newsPosts.createdAt));
}

export async function getPublishedNewsBySlug(organizationId: string, slug: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(newsPosts)
    .where(
      and(
        eq(newsPosts.organizationId, organizationId),
        eq(newsPosts.slug, slug),
        eq(newsPosts.status, "published"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createNewsPost(
  organizationId: string,
  input: {
    title: string;
    contentHtml: string;
    imageBytes: Uint8Array;
    publish: boolean;
  },
): Promise<ActionResult<{ id: string }>> {
  const title = input.title.trim();
  if (!title) return { ok: false, message: "El artículo necesita un título." };
  if (!input.contentHtml.trim()) return { ok: false, message: "Escribe el contenido del artículo." };
  const imageCheck = validateNewsImage(input.imageBytes);
  if (!imageCheck.ok) return imageCheck;
  const kind = isPngOrJpeg(input.imageBytes)!;

  let slug = slugify(title) || `articulo-${randomUUID().slice(0, 8)}`;
  const db = getDb();
  const [clash] = await db
    .select({ id: newsPosts.id })
    .from(newsPosts)
    .where(and(eq(newsPosts.organizationId, organizationId), eq(newsPosts.slug, slug)))
    .limit(1);
  if (clash) slug = `${slug}-${randomUUID().slice(0, 6)}`;

  const excerpt = input.contentHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  const [created] = await db
    .insert(newsPosts)
    .values({
      organizationId,
      title,
      slug,
      excerpt,
      contentHtml: input.contentHtml,
      imageDataUrl: toDataUrl(input.imageBytes, kind),
      status: input.publish ? "published" : "draft",
      publishedAt: input.publish ? new Date() : null,
    })
    .returning({ id: newsPosts.id });
  if (!created) return { ok: false, message: "No se pudo guardar el artículo." };
  return { ok: true, id: created.id };
}
