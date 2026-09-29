"use client";

import { useState } from "react";
import { AccountMenu } from "./account-menu";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AppShell(props: {
  organizationName?: string;
  userName?: string;
  nav: React.ReactNode;
  logout: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={open ? "app-shell" : "app-shell is-collapsed"}>
      <aside className="side">
        <div className="side-brand">
          <strong>{props.organizationName ?? "Organización"}</strong>
          <span>Panel de organización</span>
        </div>
        {props.nav}
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button type="button" className="ghost" aria-label="Alternar menú" onClick={() => setOpen((value) => !value)}>
            Menú
          </button>
          <span className="org">{props.organizationName}</span>
          <span className="spacer" />
          <AccountMenu
            name={props.userName || "Cuenta"}
            initials={initials(props.userName || "?")}
            logout={props.logout}
          />
        </header>
        <main>{props.children}</main>
      </div>
    </div>
  );
}
