/**
 * Aplica migraciones Drizzle antes del build (Vercel) o a mano: npm run db:migrate
 *
 * En Neon/Vercel usa DATABASE_URL_UNPOOLED si existe (conexión directa).
 * La URL con -pooler suele fallar o colgarse en migraciones.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL (o DATABASE_URL_UNPOOLED) no está configurada.");
    process.exit(1);
  }

  console.log("Aplicando migraciones Drizzle…");
  const client = postgres(url, { max: 1 });
  try {
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
