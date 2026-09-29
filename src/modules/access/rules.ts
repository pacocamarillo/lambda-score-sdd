export const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

export type PasswordCheck =
  | { ok: true }
  | { ok: false; message: string };

export function validateNewPassword(password: string, confirmation: string): PasswordCheck {
  if (password.length < 8) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmation) {
    return { ok: false, message: "Las contraseñas no coinciden." };
  }
  return { ok: true };
}

export function canRemoveOwner(activeOwnerCount: number): boolean {
  return activeOwnerCount > 1;
}

export type OrgRole = "owner" | "admin" | "staff";
export type StaffMode = "none" | "all" | "specific" | "all_except";
export type EventLevel = "viewer" | "operator" | "event_admin";

export function canSaveStaff(advancedRolesEnabled: boolean, role: OrgRole): PasswordCheck {
  if (role === "staff" && !advancedRolesEnabled) {
    return { ok: false, message: "Los roles avanzados no están habilitados para esta organización." };
  }
  return { ok: true };
}

const STAFF_BLOCKED = [
  "/admin/billing",
  "/admin/settings",
  "/admin/website",
  "/admin/analytics",
  "/admin/communications",
  "/admin/contacts",
  "/admin/coupons",
];

export function isStaffBlockedSection(pathname: string): boolean {
  return STAFF_BLOCKED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function staffSeesEvent(input: {
  mode: StaffMode;
  eventId: string;
  assignedEventIds: string[];
  excludedEventIds: string[];
}): boolean {
  if (input.mode === "none") return false;
  if (input.mode === "all") return true;
  if (input.mode === "specific") return input.assignedEventIds.includes(input.eventId);
  return !input.excludedEventIds.includes(input.eventId);
}

export function allowsEventAction(level: EventLevel | null, action: "view" | "operate" | "configure"): boolean {
  if (!level) return false;
  if (action === "view") return true;
  if (action === "operate") return level === "operator" || level === "event_admin";
  return level === "event_admin";
}
