import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: process.env.APP_URL ?? "http://localhost:3000" },
  webServer: process.env.DATABASE_URL
    ? {
        command: "npm run dev",
        url: "http://localhost:3000/login",
        reuseExistingServer: true,
      }
    : undefined,
});
