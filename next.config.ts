import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);

function git(command: string): string {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const packageJson = require("./package.json") as { version?: string };
const sha =
  (process.env.VERCEL_GIT_COMMIT_SHA || git("git rev-parse HEAD")).slice(0, 7) || "dev";
const changedAt = git("git log -1 --format=%cI") || new Date().toISOString();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version ?? "0.0.0",
    NEXT_PUBLIC_APP_SHA: sha,
    NEXT_PUBLIC_APP_CHANGED_AT: changedAt,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
