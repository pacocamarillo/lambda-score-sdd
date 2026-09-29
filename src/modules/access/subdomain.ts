const RESERVED = new Set(["www", "admin", "api", "app"]);

export type SubdomainResult =
  | { ok: true; subdomain: string }
  | { ok: false; message: string };

export function validateSubdomain(value: string): SubdomainResult {
  const subdomain = value.trim().toLowerCase();
  if (subdomain.length < 3 || subdomain.length > 63) {
    return { ok: false, message: "El subdominio debe tener entre 3 y 63 caracteres." };
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
    return { ok: false, message: "El subdominio solo puede usar letras, números y guiones." };
  }
  if (RESERVED.has(subdomain)) {
    return { ok: false, message: "Ese subdominio no está disponible. Elige otro." };
  }
  return { ok: true, subdomain };
}

export function belongsToOrganization(resourceOrganizationId: string, activeOrganizationId: string): boolean {
  return resourceOrganizationId === activeOrganizationId;
}

export function subdomainFromHost(host: string | null, rootDomain = "localhost"): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (hostname === rootDomain || hostname === "localhost") return null;
  const suffix = `.${rootDomain}`;
  if (!hostname.endsWith(suffix)) return null;
  const label = hostname.slice(0, -suffix.length);
  if (!label || label.includes(".")) return null;
  return label;
}
