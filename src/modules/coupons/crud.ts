import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { coupons } from "@/db/schema/events";
import { parseCouponForm, type ParsedCoupon } from "@/modules/coupons/parse";
import type { ActionResult } from "@/modules/events/types";

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

export async function listOrganizationCoupons(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(coupons)
    .where(eq(coupons.organizationId, organizationId))
    .orderBy(desc(coupons.createdAt));
}

export type { ParsedCoupon };
