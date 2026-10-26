"use client";

import type { ReactNode } from "react";

export function DangerSubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="danger"
      onClick={(event) => {
        const confirmed = window.confirm("Vas a eliminar este evento. Esta acción no se puede deshacer.");
        if (!confirmed) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
