import { describe, expect, it } from "vitest";
import * as OTPAuth from "otpauth";
import { encryptTotpSecret, decryptTotpSecret } from "@/modules/access/totp-crypto";
import { hashBackupCode, newTotpSecretBase32, normalizeBackupCode, verifyTotpCode } from "@/modules/access/totp";

describe("TOTP y respaldo", () => {
  it("valida un código TOTP con ventana de reloj", () => {
    const secret = newTotpSecretBase32();
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });
    const token = totp.generate();
    expect(verifyTotpCode(secret, token)).toBe(true);
    expect(verifyTotpCode(secret, "000000")).toBe(false);
  });

  it("cifra y descifra el secreto TOTP", () => {
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long";
    const plain = newTotpSecretBase32();
    const enc = encryptTotpSecret(plain);
    expect(decryptTotpSecret(enc)).toBe(plain);
  });

  it("normaliza códigos de respaldo para el hash", () => {
    const a = hashBackupCode("abcd-efgh");
    const b = hashBackupCode("ABCD EFGH");
    expect(a).toBe(b);
    expect(normalizeBackupCode(" ab-cd ")).toBe("ABCD");
  });
});
