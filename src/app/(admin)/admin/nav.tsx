"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavProfile, OrgRole } from "@/modules/access/rules";

const items: Array<{ href: string; label: string; paid?: boolean; roles: OrgRole[]; profiles: NavProfile[] }> = [
  { href: "/admin", label: "Panel", roles: ["owner", "admin", "staff"], profiles: ["full", "events_coupons"] },
  { href: "/admin/contacts", label: "Contactos", roles: ["owner", "admin"], profiles: ["full"] },
  { href: "/admin/events", label: "Eventos", roles: ["owner", "admin", "staff"], profiles: ["full", "events_coupons"] },
  { href: "/admin/coupons", label: "Cupones", roles: ["owner", "admin"], profiles: ["full", "events_coupons"] },
  { href: "/admin/website", label: "Página web", roles: ["owner", "admin"], profiles: ["full"] },
  { href: "/admin/panel", label: "Panel de administración", roles: ["owner"], profiles: ["full"] },
  { href: "/admin/communications", label: "Comunicaciones", paid: true, roles: ["owner", "admin"], profiles: ["full"] },
  { href: "/admin/analytics", label: "Analítica", paid: true, roles: ["owner", "admin"], profiles: ["full"] },
  { href: "/admin/billing", label: "Facturación", roles: ["owner"], profiles: ["full"] },
  { href: "/admin/settings", label: "Configuración", roles: ["owner"], profiles: ["full"] },
  { href: "/admin/profile", label: "Perfil", roles: ["owner", "admin", "staff"], profiles: ["full", "events_coupons"] },
];

export function AdminNav({ role, navProfile = "full" }: { role: OrgRole; navProfile?: NavProfile }) {
  const pathname = usePathname();
  return (
    <nav>
      {items
        .filter((item) => item.roles.includes(role) && item.profiles.includes(navProfile))
        .map((item) => {
          const current = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
              <span>{item.label}</span>
              {item.paid ? <span className="badge">De pago</span> : null}
            </Link>
          );
        })}
    </nav>
  );
}
