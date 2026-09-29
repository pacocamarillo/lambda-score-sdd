"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrgRole } from "@/modules/access/rules";

const items: Array<{ href: string; label: string; paid?: boolean; roles: OrgRole[] }> = [
  { href: "/admin", label: "Panel", roles: ["owner", "admin", "staff"] },
  { href: "/admin/contacts", label: "Contactos", roles: ["owner", "admin"] },
  { href: "/admin/events", label: "Eventos", roles: ["owner", "admin", "staff"] },
  { href: "/admin/coupons", label: "Cupones", roles: ["owner", "admin"] },
  { href: "/admin/website", label: "Página web", roles: ["owner", "admin"] },
  { href: "/admin/communications", label: "Comunicaciones", paid: true, roles: ["owner", "admin"] },
  { href: "/admin/analytics", label: "Analítica", paid: true, roles: ["owner", "admin"] },
  { href: "/admin/billing", label: "Facturación", roles: ["owner"] },
  { href: "/admin/settings", label: "Configuración", roles: ["owner"] },
  { href: "/admin/profile", label: "Perfil", roles: ["owner", "admin", "staff"] },
];

export function AdminNav({ role }: { role: OrgRole }) {
  const pathname = usePathname();
  return (
    <nav>
      {items
        .filter((item) => item.roles.includes(role))
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
