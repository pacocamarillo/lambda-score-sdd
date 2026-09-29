import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/access";

export async function updateDisplayName(input: {
  userId: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) {
    return { ok: false, message: "Escribe un nombre de 2 a 120 caracteres." };
  }
  await getDb().update(users).set({ name }).where(eq(users.id, input.userId));
  return { ok: true };
}
