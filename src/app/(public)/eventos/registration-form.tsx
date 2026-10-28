"use client";

import { useMemo, useState } from "react";
import {
  filterCategoryOptions,
  isCategoryFormField,
  type Gender,
} from "@/modules/events/category-eligibility";
import { WaiverDownloadButton } from "./waiver-download-button";

type CompetitionOption = {
  id: string;
  name: string;
  priceCents: number;
  full: boolean;
  mode?: "individual" | "team";
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
  const categoryFields = fields.filter((field) => isCategoryFormField(field));
  const otherFields = fields.filter((field) => !isCategoryFormField(field));

  function renderField(field: FormFieldOption, full = true) {
    if (field.fieldType === "heading") {
      return (
        <h3 key={field.id} className="full">
          {field.label}
        </h3>
      );
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

    if (categoryField && options.length === 0) return null;
    const className = full ? "full" : undefined;

    if (field.fieldType === "textarea") {
      return (
        <label key={field.id} className={className}>
          {field.label}
          <textarea name={`field_${field.id}`} required={field.required} />
        </label>
      );
    }

    if (field.fieldType === "select" || field.fieldType === "radio") {
      return (
        <label key={field.id} className={className}>
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
      <label key={field.id} className={className}>
        {field.label}
        <input
          name={`field_${field.id}`}
          type={field.fieldType === "number" ? "number" : "text"}
          required={field.required}
          placeholder={field.fieldType === "file" ? "Clave del archivo" : undefined}
        />
      </label>
    );
  }

  const visibleCategories = categoryReady ? categoryFields.map((field) => renderField(field)).filter(Boolean) : [];

  return (
    <form action={action} className="stack register-form">
      <input type="hidden" name="eventId" value={eventId} />

      <div className="register-grid">
        <label className="full">
          Competencia
          <select
            name="competitionId"
            defaultValue={selectedCompetitionId}
            required
            onChange={(event) => {
              const chosen = competitions.find((competition) => competition.id === event.target.value);
              if (chosen?.mode === "team") {
                window.location.assign(
                  `/eventos/${eventId}/inscripcion/team?competitionId=${encodeURIComponent(chosen.id)}`,
                );
              }
            }}
          >
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id} disabled={competition.full}>
                {competition.name}
                {competition.mode === "team" ? " · Equipo" : ""}
                {competition.full ? " (sin cupo)" : ` · $${(competition.priceCents / 100).toFixed(2)}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          Nombre
          <input name="firstName" required autoComplete="given-name" />
        </label>
        <label>
          Apellido
          <input name="lastName" required autoComplete="family-name" />
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

        {categoryFields.length > 0 ? (
          <p className="hint full">
            Primero elige género y fecha de nacimiento. La categoría se filtra con esos datos.
          </p>
        ) : null}

        {!categoryReady && categoryFields.length > 0 ? (
          <label className="full">
            Categoría
            <select disabled defaultValue="">
              <option value="">Completa género y fecha de nacimiento</option>
            </select>
          </label>
        ) : null}
        {categoryReady && categoryFields.length > 0 && visibleCategories.length === 0 ? (
          <p className="hint full">No hay categoría para tu género o edad.</p>
        ) : null}
        {visibleCategories}

        <label className="full">
          Correo
          <input name="email" type="email" required autoComplete="email" inputMode="email" />
        </label>

        {otherFields.map((field) => renderField(field))}

        {addOns.map((addOn) => (
          <label
            key={addOn.id}
            className={addOn.options.length === 0 ? "switch-row full" : "full"}
          >
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

        <label className="switch-row full">
          <input name="acceptedTerms" type="checkbox" required />
          Acepto los términos
        </label>
        <label className="switch-row full">
          <input name="acceptedWaiver" type="checkbox" required />
          Acepto la carta de exoneración
        </label>

        <div className="register-actions full">
          <div className="stack">
            <WaiverDownloadButton eventId={eventId} categoryFieldIds={categoryFields.map((field) => field.id)} />
            <p className="hint">El PDF usa los datos del evento y los que llevas capturados en este formulario.</p>
          </div>
          <button type="submit">Enviar inscripción</button>
        </div>
      </div>
    </form>
  );
}
