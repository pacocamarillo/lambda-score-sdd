import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/access";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | null = null;

export function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está configurada");
  }
  if (!database) {
    const client = postgres(url, { max: 1 });
    database = drizzle(client, { schema });
  }
  return database;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
