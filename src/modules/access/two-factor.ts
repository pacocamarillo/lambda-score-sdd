import { and, eq, isNull } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { getDb } from "@/db/client";
import { backupCodes, users } from "@/db/schema/access";
import { decryptTotpSecret, encryptTotpSecret } from "@/modules/access/totp-crypto";
import {
  hashBackupCode,
  INVALID_2FA_CODE,
  newBackupCodePlain,
  newTotpSecretBase32,
  totpProvisioningUri,
  verifyTotpCode,
} from "@/modules/access/totp";

const BACKUP_CODE_COUNT = 8;

export type TotpStatus = { enabled: false; pending: false } | { enabled: true; pending: false } | { enabled: false; pending: true };

export async function getPendingTotpSetup(
  userId: string,
): Promise<{ uri: string; secretBase32: string } | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.totpSecretEnc || user.totpEnabledAt) return null;
  const secretBase32 = decryptTotpSecret(user.totpSecretEnc);
  return { uri: totpProvisioningUri(user.email, secretBase32), secretBase32 };
}

export async function getTotpStatus(userId: string): Promise<TotpStatus> {
  const db = getDb();
  const [user] = await db
    .select({ totpSecretEnc: users.totpSecretEnc, totpEnabledAt: users.totpEnabledAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return { enabled: false, pending: false };
  if (user.totpEnabledAt) return { enabled: true, pending: false };
  if (user.totpSecretEnc) return { enabled: false, pending: true };
  return { enabled: false, pending: false };
}

export async function beginTotpSetup(
  userId: string,
): Promise<{ ok: true; secretBase32: string; uri: string } | { ok: false; message: string }> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { ok: false, message: "No se encontró la cuenta." };
  if (user.totpEnabledAt) return { ok: false, message: "La verificación en dos pasos ya está activa." };
  const secretBase32 = newTotpSecretBase32();
  await db
    .update(users)
    .set({ totpSecretEnc: encryptTotpSecret(secretBase32), totpEnabledAt: null })
    .where(eq(users.id, userId));
  return { ok: true, secretBase32, uri: totpProvisioningUri(user.email, secretBase32) };
}

export async function confirmTotpSetup(
  userId: string,
  code: string,
): Promise<{ ok: true; backupCodes: string[] } | { ok: false; message: string }> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.totpSecretEnc || user.totpEnabledAt) {
    return { ok: false, message: "No hay una configuración pendiente." };
  }
  const secretBase32 = decryptTotpSecret(user.totpSecretEnc);
  if (!verifyTotpCode(secretBase32, code)) {
    return { ok: false, message: INVALID_2FA_CODE };
  }
  const now = new Date();
  const plainCodes = Array.from({ length: BACKUP_CODE_COUNT }, () => newBackupCodePlain());
  await db.transaction(async (tx) => {
    await tx.update(users).set({ totpEnabledAt: now }).where(eq(users.id, userId));
    await tx.delete(backupCodes).where(eq(backupCodes.userId, userId));
    await tx.insert(backupCodes).values(
      plainCodes.map((plain) => ({
        userId,
        codeHash: hashBackupCode(plain),
      })),
    );
  });
  return { ok: true, backupCodes: plainCodes };
}

export async function cancelTotpSetup(userId: string): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ totpSecretEnc: null, totpEnabledAt: null })
    .where(and(eq(users.id, userId), isNull(users.totpEnabledAt)));
}

export async function disableTotp(
  userId: string,
  currentPassword: string,
  code: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.totpEnabledAt || !user.totpSecretEnc || !user.passwordHash) {
    return { ok: false, message: "La verificación en dos pasos no está activa." };
  }
  const matches = await verify(user.passwordHash, currentPassword).catch(() => false);
  if (!matches) return { ok: false, message: "La contraseña actual no es correcta." };
  const valid = await verifySecondFactorForUser(userId, code);
  if (!valid) return { ok: false, message: INVALID_2FA_CODE };
  await db.transaction(async (tx) => {
    await tx.update(users).set({ totpSecretEnc: null, totpEnabledAt: null }).where(eq(users.id, userId));
    await tx.delete(backupCodes).where(eq(backupCodes.userId, userId));
  });
  return { ok: true };
}

export async function verifySecondFactorForUser(userId: string, code: string): Promise<boolean> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.totpEnabledAt || !user.totpSecretEnc) return false;
  const secretBase32 = decryptTotpSecret(user.totpSecretEnc);
  if (verifyTotpCode(secretBase32, code)) return true;
  return consumeBackupCode(userId, code);
}

async function consumeBackupCode(userId: string, code: string): Promise<boolean> {
  const db = getDb();
  const hash = hashBackupCode(code);
  const now = new Date();
  const [row] = await db
    .update(backupCodes)
    .set({ usedAt: now })
    .where(and(eq(backupCodes.userId, userId), eq(backupCodes.codeHash, hash), isNull(backupCodes.usedAt)))
    .returning();
  return Boolean(row);
}
