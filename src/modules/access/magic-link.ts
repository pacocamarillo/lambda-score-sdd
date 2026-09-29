import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessTokens, users } from "@/db/schema/access";
import { appUrl, sendAccessEmail } from "@/lib/email";
import { expiresIn24Hours, hashSecret, newSecret, normalizeEmail } from "@/modules/access/tokens";

const SENT = "Si el correo está registrado, enviamos un enlace de acceso.";

export async function requestMagicLink(email: string): Promise<{ message: string }> {
  const db = getDb();
  const normalized = normalizeEmail(email);
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (user) {
    const secret = newSecret();
    await db.insert(accessTokens).values({
      purpose: "magic",
      tokenHash: secret.hash,
      email: normalized,
      userId: user.id,
      expiresAt: expiresIn24Hours(),
    });
    await sendAccessEmail({ to: normalized, kind: "magic", url: appUrl(`/auth/magic/${secret.secret}`) });
  }
  return { message: SENT };
}

export async function consumeMagicToken(
  secret: string,
): Promise<{ ok: true; userId: string; email: string; name: string } | { ok: false }> {
  const db = getDb();
  const now = new Date();
  const [token] = await db
    .update(accessTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(accessTokens.tokenHash, hashSecret(secret)),
        eq(accessTokens.purpose, "magic"),
        isNull(accessTokens.usedAt),
        gt(accessTokens.expiresAt, now),
      ),
    )
    .returning();
  if (!token?.userId) return { ok: false };
  const [user] = await db.select().from(users).where(eq(users.id, token.userId)).limit(1);
  if (!user) return { ok: false };
  return { ok: true, userId: user.id, email: user.email, name: user.name };
}
