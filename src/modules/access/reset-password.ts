import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessTokens, users } from "@/db/schema/access";
import { appUrl, sendAccessEmail } from "@/lib/email";
import { hashPassword } from "@/modules/access/login";
import { validateNewPassword } from "@/modules/access/rules";
import { expiresIn24Hours, hashSecret, newSecret, normalizeEmail } from "@/modules/access/tokens";

const SENT = "Si el correo está registrado, enviamos un enlace para restablecer la contraseña.";

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const db = getDb();
  const normalized = normalizeEmail(email);
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (user) {
    const secret = newSecret();
    await db.insert(accessTokens).values({
      purpose: "reset",
      tokenHash: secret.hash,
      email: normalized,
      userId: user.id,
      expiresAt: expiresIn24Hours(),
    });
    await sendAccessEmail({ to: normalized, kind: "reset", url: appUrl(`/reset/${secret.secret}`) });
  }
  return { message: SENT };
}

export async function resetPassword(input: {
  secret: string;
  password: string;
  confirmation: string;
}): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  const check = validateNewPassword(input.password, input.confirmation);
  if (!check.ok) return check;
  const db = getDb();
  const now = new Date();
  const [token] = await db
    .update(accessTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(accessTokens.tokenHash, hashSecret(input.secret)),
        eq(accessTokens.purpose, "reset"),
        isNull(accessTokens.usedAt),
        gt(accessTokens.expiresAt, now),
      ),
    )
    .returning();
  if (!token?.userId) {
    return { ok: false, message: "El enlace no es válido. Pide otro." };
  }
  await db.update(users).set({ passwordHash: await hashPassword(input.password) }).where(eq(users.id, token.userId));
  return { ok: true, email: token.email };
}
