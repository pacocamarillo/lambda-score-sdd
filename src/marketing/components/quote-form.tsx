"use client";

import { useMemo, useState } from "react";
import { usePreferences } from "@/marketing/components/preferences";
import { services } from "@/marketing/content/services";
import type { EventType, ServiceId } from "@/marketing/lib/content";
import type { MessageId } from "@/marketing/lib/i18n";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailConfirm: string;
  firstRace: "" | "yes" | "no";
  eventType: "" | EventType;
  services: ServiceId[];
  street: string;
  city: string;
  state: string;
  postalCode: string;
  tentativeDate: string;
  estimatedParticipants: string;
  message: string;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  emailConfirm: "",
  firstRace: "",
  eventType: "",
  services: [],
  street: "",
  city: "",
  state: "",
  postalCode: "",
  tentativeDate: "",
  estimatedParticipants: "",
  message: "",
};

const eventTypes: { value: EventType; label: MessageId }[] = [
  { value: "running", label: "form.running" },
  { value: "mtb", label: "form.mtb" },
  { value: "triathlon", label: "form.triathlon" },
  { value: "swim", label: "form.swim" },
  { value: "other", label: "form.other" },
];

const serviceLabel: Record<ServiceId, MessageId> = {
  asesoria: "service.asesoria",
  cronometraje: "service.cronometraje",
  arco: "service.arco",
  vallas: "service.vallas",
  marketing: "service.marketing",
};

const fieldError: Partial<Record<string, MessageId>> = {
  firstName: "form.err.firstName",
  lastName: "form.err.lastName",
  phone: "form.err.phone",
  email: "form.err.email",
  emailConfirm: "form.err.emailConfirm",
  firstRace: "form.err.firstRace",
  eventType: "form.err.eventType",
  services: "form.err.services",
  street: "form.err.street",
  city: "form.err.city",
  state: "form.err.state",
  postalCode: "form.err.postalCode",
};

type QuoteFormProps = {
  preselectedServices?: ServiceId[];
};

export function QuoteForm({ preselectedServices = [] }: QuoteFormProps) {
  const { t } = usePreferences();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    ...initial,
    services: preselectedServices,
  });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const quotable = useMemo(
    () => services.filter((service) => service.quotable),
    [],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function errorFor(key: string) {
    if (!fields[key]) return null;
    const id = fieldError[key];
    return id ? t(id) : fields[key];
  }

  function toggleService(id: ServiceId) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((item) => item !== id)
        : [...prev.services, id],
    }));
  }

  function validateStep1() {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = t("form.err.firstName");
    if (!form.lastName.trim()) next.lastName = t("form.err.lastName");
    if (!form.phone.trim()) next.phone = t("form.err.phone");
    if (!form.email.trim() || !form.email.includes("@")) {
      next.email = t("form.err.email");
    }
    if (form.email !== form.emailConfirm) {
      next.emailConfirm = t("form.err.emailConfirm");
    }
    if (!form.firstRace) next.firstRace = t("form.err.firstRace");
    if (!form.eventType) next.eventType = t("form.err.eventType");
    if (form.services.length === 0) {
      next.services = t("form.err.services");
    }
    setFields(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next: Record<string, string> = {};
    if (!form.street.trim()) next.street = t("form.err.street");
    if (!form.city.trim()) next.city = t("form.err.city");
    if (!form.state.trim()) next.state = t("form.err.state");
    if (!form.postalCode.trim()) next.postalCode = t("form.err.postalCode");
    setFields(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateStep2()) return;

    setStatus("loading");
    setFields({});

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      emailConfirm: form.emailConfirm,
      firstRace: form.firstRace === "yes",
      eventType: form.eventType,
      services: form.services,
      street: form.street,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      tentativeDate: form.tentativeDate || undefined,
      estimatedParticipants: form.estimatedParticipants
        ? Number(form.estimatedParticipants)
        : undefined,
      message: form.message || undefined,
    };

    try {
      const response = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.status === 400 && data.fields) {
        const translated: Record<string, string> = {};
        for (const [key, message] of Object.entries(
          data.fields as Record<string, string>,
        )) {
          const id = fieldError[key];
          translated[key] = id ? t(id) : message;
        }
        setFields(translated);
        setStatus("idle");
        setStep(1);
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("done");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/quiero-cotizar?enviado=1");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-[color:var(--line)] surface-solid p-8">
        <h2 className="display text-3xl">{t("form.received")}</h2>
        <p className="muted mt-3">{t("form.receivedBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[color:var(--line)] surface-solid p-6 md:p-8">
      <div className="mb-6 flex gap-3 text-sm font-semibold">
        <span className={step === 1 ? "text-[color:var(--brand-deep)]" : "muted"}>
          {t("form.stepContact")}
        </span>
        <span className="muted">/</span>
        <span className={step === 2 ? "text-[color:var(--brand-deep)]" : "muted"}>
          {t("form.stepDetail")}
        </span>
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field">
            <label htmlFor="firstName">{t("form.firstName")}</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            {fields.firstName ? <p className="error">{errorFor("firstName")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="lastName">{t("form.lastName")}</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            {fields.lastName ? <p className="error">{errorFor("lastName")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="phone">{t("form.phone")}</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            {fields.phone ? <p className="error">{errorFor("phone")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="email">{t("form.email")}</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {fields.email ? <p className="error">{errorFor("email")}</p> : null}
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="emailConfirm">{t("form.emailConfirm")}</label>
            <input
              id="emailConfirm"
              type="email"
              value={form.emailConfirm}
              onChange={(e) => update("emailConfirm", e.target.value)}
            />
            {fields.emailConfirm ? (
              <p className="error">{errorFor("emailConfirm")}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="firstRace">{t("form.firstRace")}</label>
            <select
              id="firstRace"
              value={form.firstRace}
              onChange={(e) =>
                update("firstRace", e.target.value as FormState["firstRace"])
              }
            >
              <option value="">{t("form.select")}</option>
              <option value="yes">{t("form.yes")}</option>
              <option value="no">{t("form.no")}</option>
            </select>
            {fields.firstRace ? <p className="error">{errorFor("firstRace")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="eventType">{t("form.eventType")}</label>
            <select
              id="eventType"
              value={form.eventType}
              onChange={(e) =>
                update("eventType", e.target.value as FormState["eventType"])
              }
            >
              <option value="">{t("form.select")}</option>
              {eventTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.label)}
                </option>
              ))}
            </select>
            {fields.eventType ? <p className="error">{errorFor("eventType")}</p> : null}
          </div>
          <fieldset className="md:col-span-2">
            <legend className="mb-2 font-semibold">{t("form.services")}</legend>
            <div className="grid gap-2">
              {quotable.map((service) => (
                <label key={service.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={form.services.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  <span>{t(serviceLabel[service.id])}</span>
                </label>
              ))}
            </div>
            {fields.services ? <p className="error">{errorFor("services")}</p> : null}
          </fieldset>
          <div className="md:col-span-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
            >
              {t("form.continue")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field md:col-span-2">
            <label htmlFor="street">{t("form.street")}</label>
            <input
              id="street"
              value={form.street}
              onChange={(e) => update("street", e.target.value)}
            />
            {fields.street ? <p className="error">{errorFor("street")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="city">{t("form.city")}</label>
            <input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            {fields.city ? <p className="error">{errorFor("city")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="state">{t("form.state")}</label>
            <input
              id="state"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
            {fields.state ? <p className="error">{errorFor("state")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="postalCode">{t("form.postalCode")}</label>
            <input
              id="postalCode"
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
            {fields.postalCode ? (
              <p className="error">{errorFor("postalCode")}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="tentativeDate">{t("form.dateOptional")}</label>
            <input
              id="tentativeDate"
              type="date"
              value={form.tentativeDate}
              onChange={(e) => update("tentativeDate", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="estimatedParticipants">
              {t("form.participantsOptional")}
            </label>
            <input
              id="estimatedParticipants"
              type="number"
              min={1}
              value={form.estimatedParticipants}
              onChange={(e) => update("estimatedParticipants", e.target.value)}
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="message">{t("form.message")}</label>
            <textarea
              id="message"
              rows={4}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </div>
          {status === "error" ? (
            <p className="error md:col-span-2">
              {t("form.sendError")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="button"
              className="btn btn-ghost-dark"
              onClick={() => setStep(1)}
            >
              {t("form.back")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "loading"}
            >
              {status === "loading" ? t("form.sending") : t("form.submitQuote")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
