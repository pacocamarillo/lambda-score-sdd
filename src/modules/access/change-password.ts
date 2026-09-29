import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/access";
import { hashPassword } from "@/modules/access/login";
import { validateNewPassword } from "@/modules/access/rules";

export async function changePassword(input: {
  userId: string;
  currentPassword: string;
  password: string;
  confirmation: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const next = validateNewPassword(input.password, input.confirmation);
  if (!next.ok) return next;
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user?.passwordHash) return { ok: false, message: "La contraseña actual no es correcta." };
  const matches = await verify(user.passwordHash, input.currentPassword).catch(() => false);
  if (!matches) return { ok: false, message: "La contraseña actual no es correcta." };
  await db.update(users).set({ passwordHash: await hashPassword(input.password) }).where(eq(users.id, user.id));
  return { ok: true };
}
