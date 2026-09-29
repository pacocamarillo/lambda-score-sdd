import { createHash, randomBytes } from "node:crypto";

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type TokenPurpose = "magic" | "reset" | "invite" | "login_2fa";

export const LOGIN_2FA_TTL_MS = 5 * 60 * 1000;

export function expiresInMs(ms: number, from = new Date()): Date {
  return new Date(from.getTime() + ms);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function newSecret(): { secret: string; hash: string } {
  const secret = randomBytes(32).toString("base64url");
  return { secret, hash: hashSecret(secret) };
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function expiresIn24Hours(from = new Date()): Date {
  return new Date(from.getTime() + TOKEN_TTL_MS);
}

export function tokenUsable(token: { usedAt: Date | null; expiresAt: Date }, now = new Date()): boolean {
  return token.usedAt === null && token.expiresAt.getTime() > now.getTime();
}
