"use client";

import { useMemo, useState } from "react";
import {
  filterCategoryOptions,
  isCategoryFormField,
  type Gender,
} from "@/modules/events/category-eligibility";

type CompetitionOption = {
  id: string;
  name: string;
  priceCents: number;
  full: boolean;
};

type FormFieldOption = {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string[];
};

type AddOnOption = {
  id: string;
  name: string;
  priceCents: number;
  required: boolean;
  options: string[];
};

export function RegistrationForm({
  eventId,
  eventDateIso,
  competitions,
  selectedCompetitionId,
  fields,
  addOns,
  action,
}: {
  eventId: string;
  eventDateIso: string;
  competitions: CompetitionOption[];
  selectedCompetitionId: string;
  fields: FormFieldOption[];
  addOns: AddOnOption[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const eventDate = useMemo(() => new Date(eventDateIso), [eventDateIso]);
  const [gender, setGender] = useState<Gender | "">("");
  const [birthDate, setBirthDate] = useState("");

  const categoryReady = Boolean(gender && birthDate);

  return (
    <form action={action} className="stack card">
      <input type="hidden" name="eventId" value={eventId} />

      <label>
        Competencia
        <select name="competitionId" defaultValue={selectedCompetitionId} required>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id} disabled={competition.full}>
              {competition.name}
              {competition.full ? " (sin cupo)" : ` · $${(competition.priceCents / 100).toFixed(2)}`}
            </option>
          ))}
        </select>
      </label>

      <label>
        Nombre
        <input name="firstName" required />
      </label>
      <label>
        Apellido
        <input name="lastName" required />
      </label>

      <label>
        Género
        <select
          name="gender"
          required
          value={gender}
          onChange={(event) => setGender(event.target.value as Gender | "")}
        >
          <option value="" disabled>
            Elige
          </option>
          <option value="male">Varonil</option>
          <option value="female">Femenil</option>
        </select>
      </label>

      <label>
        Fecha de nacimiento
        <input
          name="birthDate"
          type="date"
          required
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
        />
      </label>
      <p className="hint">
        Primero elige género y fecha de nacimiento. Las categorías se filtran con esos datos.
      </p>

      <label>
        Correo
        <input name="email" type="email" required />
      </label>

      {fields.map((field) => {
        if (field.fieldType === "heading") {
          return <h3 key={field.id}>{field.label}</h3>;
        }

        const categoryField = isCategoryFormField(field);
        const options = categoryField
          ? filterCategoryOptions({
              label: field.label,
              options: field.options,
              gender: gender || null,
              birthDate,
              eventDate,
            })
          : field.options;

        if (categoryField) {
          if (!categoryReady) {
            return (
              <label key={field.id}>
                {field.label}
                <select disabled defaultValue="">
                  <option value="">Completa género y fecha de nacimiento</option>
                </select>
              </label>
            );
          }
          if (options.length === 0) {
            return (
              <p key={field.id} className="hint">
                {field.label}: no hay opciones para tu género o edad.
              </p>
            );
          }
        }

        if (field.fieldType === "textarea") {
          return (
            <label key={field.id}>
              {field.label}
              <textarea name={`field_${field.id}`} required={field.required} />
            </label>
          );
        }

        if (field.fieldType === "select" || field.fieldType === "radio") {
          return (
            <label key={field.id}>
              {field.label}
              <select
                name={`field_${field.id}`}
                required={field.required && options.length > 0}
                defaultValue=""
                key={`${field.id}-${gender}-${birthDate}-${options.join("|")}`}
              >
                <option value="" disabled>
                  Elige
                </option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        return (
          <label key={field.id}>
            {field.label}
            <input
              name={`field_${field.id}`}
              type={field.fieldType === "number" ? "number" : field.fieldType === "file" ? "text" : "text"}
              required={field.required}
              placeholder={field.fieldType === "file" ? "Clave del archivo" : undefined}
            />
          </label>
        );
      })}

      {addOns.map((addOn) => (
        <label key={addOn.id} className={addOn.options.length === 0 ? "switch-row" : undefined}>
          {addOn.options.length === 0 ? (
            <>
              <input name={`addon_${addOn.id}`} type="checkbox" required={addOn.required} />
              {addOn.name} (+${(addOn.priceCents / 100).toFixed(2)})
            </>
          ) : (
            <>
              {addOn.name} (+${(addOn.priceCents / 100).toFixed(2)})
              <select name={`addon_${addOn.id}`} required={addOn.required} defaultValue="">
                <option value="">{addOn.required ? "Elige" : "Sin adicional"}</option>
                {addOn.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          )}
        </label>
      ))}

      <label className="switch-row">
        <input name="acceptedTerms" type="checkbox" required />
        Acepto los términos
      </label>
      <label className="switch-row">
        <input name="acceptedWaiver" type="checkbox" required />
        Acepto la renuncia de responsabilidad
      </label>
      <button type="submit">Enviar inscripción</button>
    </form>
  );
}
