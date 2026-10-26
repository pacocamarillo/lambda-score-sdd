export type BuildInfo = {
  version: string;
  sha: string;
  changedAt: Date | null;
};

export function getBuildInfo(): BuildInfo {
  const version = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "0.0.0";
  const sha = process.env.NEXT_PUBLIC_APP_SHA?.trim() || "dev";
  const raw = process.env.NEXT_PUBLIC_APP_CHANGED_AT?.trim() || "";
  const changedAt = raw ? new Date(raw) : null;
  return {
    version,
    sha,
    changedAt: changedAt && !Number.isNaN(changedAt.getTime()) ? changedAt : null,
  };
}

export function formatBuildChangedAt(value: Date): string {
  return value.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
