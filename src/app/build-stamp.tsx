import { formatBuildChangedAt, getBuildInfo } from "@/lib/build-info";

export function BuildStamp() {
  const info = getBuildInfo();
  const changed = info.changedAt ? formatBuildChangedAt(info.changedAt) : "fecha no disponible";
  return (
    <p className="build-stamp" title={`Commit ${info.sha}`}>
      Versión {info.version} · Último cambio: {changed}
    </p>
  );
}
