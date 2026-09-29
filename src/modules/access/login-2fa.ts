import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessTokens, users } from "@/db/schema/access";
import { expiresInMs, hashSecret, LOGIN_2FA_TTL_MS, newSecret } from "@/modules/access/tokens";

export async function userRequiresTotp(userId: string): Promise<boolean> {
  const db = getDb();
  const [user] = await db
    .select({ totpEnabledAt: users.totpEnabledAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.totpEnabledAt != null;
}

export async function createLogin2faToken(userId: string, email: string): Promise<string> {
  const db = getDb();
  const secret = newSecret();
  await db.insert(accessTokens).values({
    purpose: "login_2fa",
    tokenHash: secret.hash,
    email,
    userId,
    expiresAt: expiresInMs(LOGIN_2FA_TTL_MS),
  });
  return secret.secret;
}

export async function consumeLogin2faToken(
  token: string,
): Promise<{ ok: true; userId: string; email: string; name: string } | { ok: false }> {
  const db = getDb();
  const now = new Date();
  const [row] = await db
    .update(accessTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(accessTokens.tokenHash, hashSecret(token)),
        eq(accessTokens.purpose, "login_2fa"),
        isNull(accessTokens.usedAt),
        gt(accessTokens.expiresAt, now),
      ),
    )
    .returning();
  if (!row?.userId) return { ok: false };
  const [user] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
  if (!user) return { ok: false };
  return { ok: true, userId: user.id, email: user.email, name: user.name };
}
