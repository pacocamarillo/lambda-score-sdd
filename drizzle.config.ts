import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/access.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/lambda_score",
  },
});
