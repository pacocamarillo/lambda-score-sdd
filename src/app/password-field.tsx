"use client";

import { useId, useState } from "react";

export function PasswordField(props: {
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <div className="password-row">
        <input
          id={id}
          name={props.name}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete}
          required
          minLength={props.minLength}
        />
        <button type="button" className="ghost" onClick={() => setVisible((current) => !current)}>
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
