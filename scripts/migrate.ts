/**
 * Aplica migraciones Drizzle antes del build (Vercel) o a mano: npm run db:migrate
 *
 * En Neon/Vercel usa DATABASE_URL_UNPOOLED si existe (conexión directa).
 * Si la base ya tenía tablas creadas fuera de Drizzle, registra esas migraciones
 * como aplicadas (baseline) y solo ejecuta las pendientes.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

type Journal = {
  entries: Array<{ tag: string; when: number }>;
};

const DETECTORS: Record<string, string> = {
  "0000_access": `select to_regclass('public.user') is not null as present`,
  "0001_two_factor": `select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user' and column_name = 'totp_secret_enc'
    ) as present`,
  "0002_events": `select to_regclass('public.event') is not null as present`,
};

async function baselineExistingMigrations(client: postgres.Sql) {
  await client`create schema if not exists drizzle`;
  await client`
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )
  `;

  const journal = JSON.parse(
    readFileSync(join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
  ) as Journal;

  const applied = await client<{ hash: string }[]>`
    select hash from drizzle.__drizzle_migrations
  `;
  const appliedHashes = new Set(applied.map((row) => row.hash));

  for (const entry of journal.entries) {
    const sqlPath = join(process.cwd(), "drizzle", `${entry.tag}.sql`);
    const contents = readFileSync(sqlPath, "utf8");
    const hash = createHash("sha256").update(contents).digest("hex");
    if (appliedHashes.has(hash)) continue;

    const detector = DETECTORS[entry.tag];
    if (!detector) continue;

    const rows = await client.unsafe(detector);
    const present = Boolean(rows[0]?.present);
    if (!present) continue;

    await client`
      insert into drizzle.__drizzle_migrations ("hash", "created_at")
      values (${hash}, ${entry.when})
    `;
    console.log(`Baseline: ${entry.tag} (ya existía en la base).`);
    appliedHashes.add(hash);
  }
}

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL (o DATABASE_URL_UNPOOLED) no está configurada.");
    process.exit(1);
  }

  console.log("Aplicando migraciones Drizzle…");
  const client = postgres(url, { max: 1 });
  try {
    await baselineExistingMigrations(client);
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    console.log("Migraciones aplicadas.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
