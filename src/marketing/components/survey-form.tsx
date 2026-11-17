"use client";

import { useState } from "react";
import { usePreferences } from "@/marketing/components/preferences";
import type { MessageId } from "@/marketing/lib/i18n";

const questions: MessageId[] = [
  "survey.q1",
  "survey.q2",
  "survey.q3",
  "survey.q4",
  "survey.q5",
  "survey.q6",
  "survey.q7",
  "survey.q8",
  "survey.q9",
  "survey.q10",
];

const scale: MessageId[] = [
  "survey.s1",
  "survey.s2",
  "survey.s3",
  "survey.s4",
  "survey.s5",
];

export function SurveyForm() {
  const { t } = usePreferences();
  const [organizer, setOrganizer] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));
  const [comment, setComment] = useState("");
  const [error, setError] = useState<"" | "required" | "scores">("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!organizer.trim() || !eventName.trim() || !eventDate) {
      setError("required");
      return;
    }
    if (scores.some((score) => score < 1)) {
      setError("scores");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      const response = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizer,
          eventName,
          eventDate,
          scores,
          comment: comment || undefined,
        }),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("done");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/encuesta-lambdascore?enviado=1");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-[color:var(--line)] surface-solid p-8">
        <h2 className="display text-3xl">{t("survey.thanks")}</h2>
        <p className="muted mt-3">{t("survey.thanksBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[color:var(--line)] surface-solid p-6 md:p-8"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="field">
          <label htmlFor="organizer">{t("survey.organizer")}</label>
          <input
            id="organizer"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="eventName">{t("survey.event")}</label>
          <input
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="eventDate">{t("survey.date")}</label>
          <input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {questions.map((question, index) => (
          <fieldset key={question}>
            <legend className="font-semibold">
              {index + 1}. {t(question)}
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {scale.map((label, scoreIndex) => {
                const value = scoreIndex + 1;
                return (
                  <label key={label} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${index}`}
                      checked={scores[index] === value}
                      onChange={() =>
                        setScores((prev) => {
                          const next = [...prev];
                          next[index] = value;
                          return next;
                        })
                      }
                    />
                    {t(label)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="field mt-8">
        <label htmlFor="comment">{t("survey.comment")}</label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error ? (
        <p className="error mt-4">
          {error === "required" ? t("survey.errRequired") : t("survey.errScores")}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="error mt-4">
          {t("form.sendError")}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary mt-6"
        disabled={status === "loading"}
      >
        {status === "loading" ? t("form.sending") : t("survey.submit")}
      </button>
    </form>
  );
}
