import { describe, expect, it } from "vitest";
import { couponStatus, parseCouponForm } from "@/modules/coupons/parse";

const base = {
  code: "verano",
  discountType: "percent",
  percent: "15",
  amount: "",
  description: "Temporada",
  appliesToRegistration: true,
  appliesToAddOns: false,
  allEvents: true,
  eventIds: [] as string[],
  includeFutureCompetitions: false,
  limitUses: false,
  usageLimit: "",
  hasExpiry: false,
  expiresOn: "",
  knownEventIds: ["event-1"],
};

describe("cupones", () => {
  it("exige código, descuento y alcance", () => {
    expect(parseCouponForm({ ...base, code: " " }).ok).toBe(false);
    expect(parseCouponForm({ ...base, percent: "0" }).ok).toBe(false);
    expect(parseCouponForm({ ...base, percent: "101" }).ok).toBe(false);
    expect(parseCouponForm({ ...base, appliesToRegistration: false }).ok).toBe(false);
    const specific = parseCouponForm({ ...base, allEvents: false, eventIds: [] });
    expect(specific.ok).toBe(false);
  });

  it("guarda porcentaje o monto fijo y eventos elegidos", () => {
    const percent = parseCouponForm(base);
    expect(percent.ok && percent.percent).toBe(15);
    const fixed = parseCouponForm({
      ...base,
      discountType: "fixed",
      amount: "250.5",
      allEvents: false,
      eventIds: ["event-1", "missing"],
      limitUses: true,
      usageLimit: "40",
    });
    expect(fixed.ok).toBe(true);
    if (!fixed.ok) return;
    expect(fixed.amountCents).toBe(25050);
    expect(fixed.eventIds).toEqual(["event-1"]);
    expect(fixed.usageLimit).toBe(40);
  });

  it("marca agotado o vencido", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    expect(couponStatus({ useCount: 2, usageLimit: 2, expiresAt: null, now })).toBe("exhausted");
    expect(
      couponStatus({
        useCount: 0,
        usageLimit: null,
        expiresAt: new Date("2026-11-01T00:00:00Z"),
        now,
      }),
    ).toBe("expired");
    expect(couponStatus({ useCount: 0, usageLimit: 5, expiresAt: null, now })).toBe("active");
  });
});
