import type { ActionResult } from "@/modules/events/types";

export type CouponDiscountType = "percent" | "fixed";

export type ParsedCoupon = {
  code: string;
  discountType: CouponDiscountType;
  percent: number | null;
  amountCents: number | null;
  description: string;
  appliesToRegistration: boolean;
  appliesToAddOns: boolean;
  allEvents: boolean;
  eventIds: string[];
  includeFutureCompetitions: boolean;
  usageLimit: number | null;
  expiresAt: Date | null;
};

export function parseCouponForm(input: {
  code: string;
  discountType: string;
  percent: string;
  amount: string;
  description: string;
  appliesToRegistration: boolean;
  appliesToAddOns: boolean;
  allEvents: boolean;
  eventIds: string[];
  includeFutureCompetitions: boolean;
  limitUses: boolean;
  usageLimit: string;
  hasExpiry: boolean;
  expiresOn: string;
  knownEventIds: string[];
}): ActionResult<ParsedCoupon> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "El código del cupón es obligatorio." };
  if (!/^[A-Z0-9-]{3,32}$/.test(code)) {
    return { ok: false, message: "El código usa de 3 a 32 letras, números o guiones." };
  }

  const discountType = input.discountType === "fixed" ? "fixed" : input.discountType === "percent" ? "percent" : null;
  if (!discountType) return { ok: false, message: "Elige porcentaje o monto fijo." };

  let percent: number | null = null;
  let amountCents: number | null = null;
  if (discountType === "percent") {
    const value = Number(input.percent);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      return { ok: false, message: "El porcentaje debe ser un número entero del 1 al 100." };
    }
    percent = value;
  } else {
    const value = Number(input.amount);
    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false, message: "El monto fijo debe ser un número mayor a 0." };
    }
    amountCents = Math.round(value * 100);
    if (amountCents < 1) return { ok: false, message: "El monto fijo debe ser un número mayor a 0." };
  }

  if (!input.appliesToRegistration && !input.appliesToAddOns) {
    return { ok: false, message: "Indica si el cupón aplica a inscripción, adicionales o ambos." };
  }

  const known = new Set(input.knownEventIds);
  const eventIds = [...new Set(input.eventIds.filter((id) => known.has(id)))];
  if (!input.allEvents && eventIds.length === 0) {
    return { ok: false, message: "Selecciona al menos un evento." };
  }

  let usageLimit: number | null = null;
  if (input.limitUses) {
    const value = Number(input.usageLimit);
    if (!Number.isInteger(value) || value < 1) {
      return { ok: false, message: "El límite de usos debe ser un número entero de 1 en adelante." };
    }
    usageLimit = value;
  }

  let expiresAt: Date | null = null;
  if (input.hasExpiry) {
    if (!input.expiresOn) return { ok: false, message: "Selecciona la fecha de vencimiento." };
    const date = new Date(`${input.expiresOn}T23:59:59-06:00`);
    if (Number.isNaN(date.getTime())) return { ok: false, message: "La fecha de vencimiento no es válida." };
    expiresAt = date;
  }

  return {
    ok: true,
    code,
    discountType,
    percent,
    amountCents,
    description: input.description.trim(),
    appliesToRegistration: input.appliesToRegistration,
    appliesToAddOns: input.appliesToAddOns,
    allEvents: input.allEvents,
    eventIds: input.allEvents ? [] : eventIds,
    includeFutureCompetitions: input.includeFutureCompetitions,
    usageLimit,
    expiresAt,
  };
}

export function couponStatus(input: {
  useCount: number;
  usageLimit: number | null;
  expiresAt: Date | null;
  now?: Date;
}): "active" | "exhausted" | "expired" {
  const now = input.now ?? new Date();
  if (input.expiresAt && input.expiresAt.getTime() < now.getTime()) return "expired";
  if (input.usageLimit != null && input.useCount >= input.usageLimit) return "exhausted";
  return "active";
}

export function formatCouponDiscount(input: {
  discountType: string;
  percent: number | null;
  amountCents: number | null;
}): string {
  if (input.discountType === "percent" && input.percent != null) return `${input.percent}%`;
  if (input.amountCents != null) return `$${(input.amountCents / 100).toFixed(2)}`;
  return "—";
}
