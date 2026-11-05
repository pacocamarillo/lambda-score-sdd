"use client";

import { useState } from "react";

export function EventPageMenu({ href }: { href: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    const url = new URL(href, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setOpen(false);
  }

  return (
    <div className="menu">
      <button type="button" className="ghost" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Ver página
      </button>
      {open ? (
        <div className="menu-panel" role="menu">
          <a href={href} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setOpen(false)}>
            Abrir en una pestaña nueva
          </a>
          <button type="button" role="menuitem" onClick={() => void copyUrl()}>
            Copiar URL del evento
          </button>
        </div>
      ) : null}
      {copied ? <p className="hint">URL copiada.</p> : null}
    </div>
  );
}
