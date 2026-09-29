import { describe, expect, it } from "vitest";
import { INVALID_CREDENTIALS } from "@/modules/access/login";
import { allowsEventAction, canRemoveOwner, canSaveStaff, isStaffBlockedSection, staffSeesEvent, validateNewPassword } from "@/modules/access/rules";
import { ROLE_COLUMNS, ROLES_MATRIX } from "@/modules/access/roles-matrix";
import { belongsToOrganization, validateSubdomain } from "@/modules/access/subdomain";
import { tokenUsable } from "@/modules/access/tokens";

describe("aislamiento y acceso", () => {
  it("no mezcla dos organizaciones", () => {
    expect(belongsToOrganization("org-a", "org-b")).toBe(false);
    expect(belongsToOrganization("org-a", "org-a")).toBe(true);
  });

  it("rechaza subdominios reservados o cortos", () => {
    expect(validateSubdomain("admin").ok).toBe(false);
    expect(validateSubdomain("ab").ok).toBe(false);
    expect(validateSubdomain("carrera-norte")).toEqual({ ok: true, subdomain: "carrera-norte" });
  });

  it("usa un solo mensaje de credenciales", () => {
    expect(INVALID_CREDENTIALS).toBe("Correo o contraseña incorrectos");
  });

  it("exige contraseña de 8 caracteres repetida", () => {
    expect(validateNewPassword("corta", "corta").ok).toBe(false);
    expect(validateNewPassword("12345678", "otra-clave").ok).toBe(false);
    expect(validateNewPassword("12345678", "12345678").ok).toBe(true);
  });

  it("no guarda staff sin la función de roles avanzados", () => {
    expect(canSaveStaff(false, "staff").ok).toBe(false);
    expect(canSaveStaff(true, "staff").ok).toBe(true);
    expect(canSaveStaff(false, "admin").ok).toBe(true);
  });

  it("impide borrar a la última propietaria", () => {
    expect(canRemoveOwner(1)).toBe(false);
    expect(canRemoveOwner(2)).toBe(true);
  });

  it("un enlace usado o vencido no sirve", () => {
    const future = new Date(Date.now() + 60_000);
    const past = new Date(Date.now() - 60_000);
    expect(tokenUsable({ usedAt: null, expiresAt: future })).toBe(true);
    expect(tokenUsable({ usedAt: new Date(), expiresAt: future })).toBe(false);
    expect(tokenUsable({ usedAt: null, expiresAt: past })).toBe(false);
  });

  it("el staff de solo lectura no abre facturación ni opera un evento ajeno", () => {
    expect(isStaffBlockedSection("/admin/billing")).toBe(true);
    expect(isStaffBlockedSection("/admin/contacts")).toBe(true);
    expect(isStaffBlockedSection("/admin/coupons")).toBe(true);
    expect(isStaffBlockedSection("/admin/settings/team")).toBe(true);
    expect(isStaffBlockedSection("/admin/events")).toBe(false);
    expect(staffSeesEvent({ mode: "specific", eventId: "otro", assignedEventIds: ["mio"], excludedEventIds: [] })).toBe(false);
    expect(staffSeesEvent({ mode: "all", eventId: "futuro", assignedEventIds: [], excludedEventIds: [] })).toBe(true);
    expect(allowsEventAction("viewer", "operate")).toBe(false);
    expect(allowsEventAction("viewer", "view")).toBe(true);
  });

  it("la tabla de roles cubre propietaria y staff", () => {
    expect(ROLE_COLUMNS).toContain("Propietaria");
    expect(ROLE_COLUMNS).toContain("Staff solo lectura");
    const team = ROLES_MATRIX.find((item) => item.access.startsWith("Invitar"));
    expect(team?.cells.Propietaria).toBe("Sí");
    expect(team?.cells.Administrador).toBe("No");
  });
});
