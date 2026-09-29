import { createHash, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";

export const INVALID_2FA_CODE = "Código incorrecto o caducado.";

export function newTotpSecretBase32(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function totpProvisioningUri(email: string, secretBase32: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: "Lambda Score",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  return totp.toString();
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secretBase32),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
  return totp.validate({ token: normalized, window: 1 }) !== null;
}

export function newBackupCodePlain(): string {
  const part = (n: number) => randomBytes(n).toString("hex").slice(0, 4).toUpperCase();
  return `${part(2)}-${part(2)}`;
}

export function normalizeBackupCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(normalizeBackupCode(code)).digest("hex");
}
