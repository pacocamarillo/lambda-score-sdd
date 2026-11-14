import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { coupons } from "@/db/schema/events";
import { parseCouponForm, type ParsedCoupon } from "@/modules/coupons/parse";
import type { ActionResult } from "@/modules/events/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCouponCode(length = 8) {
  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function existingCodesForOrg(organizationId: string, candidates: string[]) {
  if (candidates.length === 0) return new Set<string>();
  const db = getDb();
  const rows = await db
    .select({ code: coupons.code })
    .from(coupons)
    .where(and(eq(coupons.organizationId, organizationId), inArray(coupons.code, candidates)));
  return new Set(rows.map((row) => row.code));
}

export async function createCoupon(
  organizationId: string,
  raw: Parameters<typeof parseCouponForm>[0],
): Promise<ActionResult> {
  const parsed = parseCouponForm(raw);
  if (!parsed.ok) return parsed;

  const db = getDb();
  const [existing] = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(and(eq(coupons.organizationId, organizationId), eq(coupons.code, parsed.code)))
    .limit(1);
  if (existing) return { ok: false, message: "Ya existe un cupón con ese código." };

  await db.insert(coupons).values({
    organizationId,
    code: parsed.code,
    discountType: parsed.discountType,
    percent: parsed.percent,
    amountCents: parsed.amountCents,
    description: parsed.description,
    appliesToRegistration: parsed.appliesToRegistration,
    appliesToAddOns: parsed.appliesToAddOns,
    allEvents: parsed.allEvents,
    eventIds: parsed.eventIds,
    includeFutureCompetitions: parsed.includeFutureCompetitions,
    usageLimit: parsed.usageLimit,
    expiresAt: parsed.expiresAt,
  });

  return { ok: true };
}

export async function createBulkCoupons(
  organizationId: string,
  raw: Parameters<typeof parseCouponForm>[0],
  quantity: number,
): Promise<ActionResult<{ codes: string[] }>> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return { ok: false, message: "Elige entre 1 y 100 cupones para el lote masivo." };
  }

  const template = parseCouponForm({ ...raw, code: "BULKCODE" });
  if (!template.ok) return template;

  const uniqueCodes: string[] = [];
  const reserved = new Set<string>();
  let attempts = 0;
  while (uniqueCodes.length < quantity && attempts < quantity * 50) {
    attempts += 1;
    const batch: string[] = [];
    while (batch.length + uniqueCodes.length < quantity && batch.length < 25) {
      const code = randomCouponCode();
      if (reserved.has(code)) continue;
      reserved.add(code);
      batch.push(code);
    }
    const conflicts = await existingCodesForOrg(organizationId, batch);
    for (const code of batch) {
      if (conflicts.has(code)) continue;
      uniqueCodes.push(code);
      if (uniqueCodes.length >= quantity) break;
    }
  }
  if (uniqueCodes.length < quantity) {
    return { ok: false, message: "No se pudieron generar códigos únicos. Intenta de nuevo." };
  }

  const db = getDb();
  await db.insert(coupons).values(
    uniqueCodes.map((code) => ({
      organizationId,
      code,
      discountType: template.discountType,
      percent: template.percent,
      amountCents: template.amountCents,
      description: template.description,
      appliesToRegistration: template.appliesToRegistration,
      appliesToAddOns: template.appliesToAddOns,
      allEvents: template.allEvents,
      eventIds: template.eventIds,
      includeFutureCompetitions: template.includeFutureCompetitions,
      usageLimit: template.usageLimit,
      expiresAt: template.expiresAt,
    })),
  );

  return { ok: true, codes: uniqueCodes };
}

export async function listOrganizationCoupons(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(coupons)
    .where(eq(coupons.organizationId, organizationId))
    .orderBy(desc(coupons.createdAt));
}

export async function deleteCoupon(
  organizationId: string,
  couponId: string,
): Promise<ActionResult> {
  const db = getDb();
  const [row] = await db
    .select({ id: coupons.id, organizationId: coupons.organizationId })
    .from(coupons)
    .where(and(eq(coupons.id, couponId), eq(coupons.organizationId, organizationId)))
    .limit(1);
  if (!row) return { ok: false, message: "No se encontró el cupón." };
  await db.delete(coupons).where(and(eq(coupons.id, couponId), eq(coupons.organizationId, organizationId)));
  return { ok: true };
}

export type { ParsedCoupon };
