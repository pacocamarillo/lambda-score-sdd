"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/settings", label: "Detalles", current: (path: string) => path === "/admin/settings" || path.startsWith("/admin/settings/details") },
  { href: "/admin/settings/team", label: "Usuarios", current: (path: string) => path.startsWith("/admin/settings/team") },
  { href: "/admin/settings/measurement", label: "Medición", current: (path: string) => path.startsWith("/admin/settings/measurement") },
  { href: "/admin/settings/payments", label: "Pagos", current: (path: string) => path.startsWith("/admin/settings/payments") },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Secciones de configuración">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={tab.current(pathname) ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
