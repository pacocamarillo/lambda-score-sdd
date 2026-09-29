import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/access";
import { INVALID_CREDENTIALS } from "@/modules/access/rules";
import { normalizeEmail } from "@/modules/access/tokens";

export { INVALID_CREDENTIALS };

let dummyHash: string | null = null;

async function placeholderHash(): Promise<string> {
  if (!dummyHash) {
    dummyHash = await hash("placeholder-not-a-user");
  }
  return dummyHash;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyLogin(
  email: string,
  password: string,
): Promise<{ ok: true; userId: string; email: string; name: string } | { ok: false; message: string }> {
  const db = getDb();
  const normalized = normalizeEmail(email);
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  const passwordHash = user?.passwordHash ?? (await placeholderHash());
  const matches = await verify(passwordHash, password).catch(() => false);
  if (!user || !user.passwordHash || !matches) {
    return { ok: false, message: INVALID_CREDENTIALS };
  }
  return { ok: true, userId: user.id, email: user.email, name: user.name };
}
