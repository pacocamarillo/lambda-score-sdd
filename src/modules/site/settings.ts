import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/db/client";
import { sites, type SiteSponsor } from "@/db/schema/site";
import type { ActionResult } from "@/modules/events/types";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const MAX_SPONSORS = 100;
const MAX_COVER_DESC = 2000;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type SiteSettings = {
  organizationId: string;
  active: boolean;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorSuccess: string;
  colorWarning: string;
  coverEnabled: boolean;
  coverImage: string | null;
  coverTitle: string;
  coverDescription: string;
  sponsors: SiteSponsor[];
  facebookUrl: string;
  xUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  contactPhone: string;
  contactEmail: string;
};

const DEFAULTS = {
  active: false,
  colorPrimary: "#1e4d5c",
  colorSecondary: "#5f6b76",
  colorAccent: "#1d7a46",
  colorSuccess: "#1d7a46",
  colorWarning: "#7a4e12",
  coverEnabled: true,
  coverImage: null as string | null,
  coverTitle: "",
  coverDescription: "",
  sponsors: [] as SiteSponsor[],
  facebookUrl: "",
  xUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  contactPhone: "",
  contactEmail: "",
};

function asSettings(organizationId: string, row: typeof sites.$inferSelect | undefined): SiteSettings {
  if (!row) return { organizationId, ...DEFAULTS };
  return {
    organizationId: row.organizationId,
    active: row.active,
    colorPrimary: row.colorPrimary,
    colorSecondary: row.colorSecondary,
    colorAccent: row.colorAccent,
    colorSuccess: row.colorSuccess,
    colorWarning: row.colorWarning,
    coverEnabled: row.coverEnabled,
    coverImage: row.coverImage,
    coverTitle: row.coverTitle,
    coverDescription: row.coverDescription,
    sponsors: row.sponsors ?? [],
    facebookUrl: row.facebookUrl,
    xUrl: row.xUrl,
    instagramUrl: row.instagramUrl,
    youtubeUrl: row.youtubeUrl,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
  };
}

export async function getSiteSettings(organizationId: string): Promise<SiteSettings> {
  const db = getDb();
  const [row] = await db.select().from(sites).where(eq(sites.organizationId, organizationId)).limit(1);
  return asSettings(organizationId, row);
}

async function ensureSiteRow(organizationId: string) {
  const db = getDb();
  const [existing] = await db.select().from(sites).where(eq(sites.organizationId, organizationId)).limit(1);
  if (existing) return existing;
  try {
    const [created] = await db.insert(sites).values({ organizationId }).returning();
    if (created) return created;
  } catch {
    // concurrent create
  }
  const [again] = await db.select().from(sites).where(eq(sites.organizationId, organizationId)).limit(1);
  return again!;
}

function parseHex(value: string, label: string): ActionResult<{ color: string }> {
  const color = value.trim();
  if (!HEX.test(color)) return { ok: false, message: `${label} debe ser un color hex (#RRGGBB).` };
  return { ok: true, color: color.toLowerCase() };
}

function isPng(bytes: Uint8Array) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 8) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

export function toPngDataUrl(bytes: Uint8Array) {
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

export function validatePngLogo(bytes: Uint8Array): ActionResult {
  if (bytes.byteLength === 0) return { ok: false, message: "Selecciona un logo PNG." };
  if (bytes.byteLength > MAX_LOGO_BYTES) return { ok: false, message: "El logo no puede superar 2 MB." };
  if (!isPng(bytes)) return { ok: false, message: "El logo debe ser PNG." };
  return { ok: true };
}

export async function setSiteActive(organizationId: string, active: boolean): Promise<ActionResult> {
  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({ active, updatedAt: new Date() })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function saveThemeColors(
  organizationId: string,
  input: {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSuccess: string;
    colorWarning: string;
  },
): Promise<ActionResult> {
  const primary = parseHex(input.colorPrimary, "Primario");
  if (!primary.ok) return primary;
  const secondary = parseHex(input.colorSecondary, "Secundario");
  if (!secondary.ok) return secondary;
  const accent = parseHex(input.colorAccent, "Acento");
  if (!accent.ok) return accent;
  const success = parseHex(input.colorSuccess, "Éxito");
  if (!success.ok) return success;
  const warning = parseHex(input.colorWarning, "Advertencia");
  if (!warning.ok) return warning;

  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({
      colorPrimary: primary.color,
      colorSecondary: secondary.color,
      colorAccent: accent.color,
      colorSuccess: success.color,
      colorWarning: warning.color,
      updatedAt: new Date(),
    })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function saveCover(
  organizationId: string,
  input: {
    coverEnabled: boolean;
    coverTitle: string;
    coverDescription: string;
    coverImageBytes?: Uint8Array | null;
    clearImage?: boolean;
  },
): Promise<ActionResult> {
  const coverTitle = input.coverTitle.trim();
  const coverDescription = input.coverDescription.trim();
  if (coverDescription.length > MAX_COVER_DESC) {
    return { ok: false, message: `La descripción admite hasta ${MAX_COVER_DESC} caracteres.` };
  }

  let coverImage: string | null | undefined;
  if (input.clearImage) coverImage = null;
  if (input.coverImageBytes && input.coverImageBytes.byteLength > 0) {
    const check = validatePngLogo(input.coverImageBytes);
    if (!check.ok) return check;
    coverImage = toPngDataUrl(input.coverImageBytes);
  }

  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({
      coverEnabled: input.coverEnabled,
      coverTitle,
      coverDescription,
      ...(coverImage !== undefined ? { coverImage } : {}),
      updatedAt: new Date(),
    })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function saveNetworks(
  organizationId: string,
  input: { facebookUrl: string; xUrl: string; instagramUrl: string; youtubeUrl: string },
): Promise<ActionResult> {
  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({
      facebookUrl: input.facebookUrl.trim(),
      xUrl: input.xUrl.trim(),
      instagramUrl: input.instagramUrl.trim(),
      youtubeUrl: input.youtubeUrl.trim(),
      updatedAt: new Date(),
    })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function saveContact(
  organizationId: string,
  input: { contactPhone: string; contactEmail: string },
): Promise<ActionResult> {
  const contactEmail = input.contactEmail.trim();
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { ok: false, message: "El correo de contacto no es válido." };
  }
  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({
      contactPhone: input.contactPhone.trim(),
      contactEmail,
      updatedAt: new Date(),
    })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function addSponsor(
  organizationId: string,
  input: { name: string; siteUrl: string; logoBytes: Uint8Array },
): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, message: "El patrocinador necesita un nombre." };
  const check = validatePngLogo(input.logoBytes);
  if (!check.ok) return check;

  const current = await getSiteSettings(organizationId);
  if (current.sponsors.length >= MAX_SPONSORS) {
    return { ok: false, message: `Solo se pueden agregar hasta ${MAX_SPONSORS} patrocinadores.` };
  }

  const sponsors: SiteSponsor[] = [
    ...current.sponsors,
    {
      id: randomUUID(),
      name,
      siteUrl: input.siteUrl.trim(),
      logoDataUrl: toPngDataUrl(input.logoBytes),
    },
  ];

  await ensureSiteRow(organizationId);
  const db = getDb();
  await db
    .update(sites)
    .set({ sponsors, updatedAt: new Date() })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function updateSponsor(
  organizationId: string,
  sponsorId: string,
  input: { name: string; siteUrl: string; logoBytes?: Uint8Array | null },
): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, message: "El patrocinador necesita un nombre." };
  const current = await getSiteSettings(organizationId);
  const index = current.sponsors.findIndex((item) => item.id === sponsorId);
  if (index < 0) return { ok: false, message: "No se encontró el patrocinador." };

  let logoDataUrl = current.sponsors[index]!.logoDataUrl;
  if (input.logoBytes && input.logoBytes.byteLength > 0) {
    const check = validatePngLogo(input.logoBytes);
    if (!check.ok) return check;
    logoDataUrl = toPngDataUrl(input.logoBytes);
  }

  const sponsors = current.sponsors.map((item, idx) =>
    idx === index ? { ...item, name, siteUrl: input.siteUrl.trim(), logoDataUrl } : item,
  );

  const db = getDb();
  await db
    .update(sites)
    .set({ sponsors, updatedAt: new Date() })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export async function deleteSponsor(organizationId: string, sponsorId: string): Promise<ActionResult> {
  const current = await getSiteSettings(organizationId);
  const sponsors = current.sponsors.filter((item) => item.id !== sponsorId);
  const db = getDb();
  await db
    .update(sites)
    .set({ sponsors, updatedAt: new Date() })
    .where(eq(sites.organizationId, organizationId));
  return { ok: true };
}

export function themeStyleVars(settings: SiteSettings): Record<string, string> {
  return {
    "--brand": settings.colorPrimary,
    "--brand-hover": settings.colorSecondary,
    "--accent": settings.colorAccent,
    "--ok": settings.colorSuccess,
    "--danger": settings.colorWarning,
    "--focus": `0 0 0 3px ${settings.colorPrimary}40`,
  };
}
