"use client";

import { Fragment, useMemo, useState } from "react";
import { usePreferences } from "@/marketing/components/preferences";
import type { ResultRow, ResultSet } from "@/marketing/lib/content";
import { localeTag } from "@/marketing/lib/i18n";

function matchesQuery(row: ResultRow, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    row.name.toLowerCase().includes(q) || row.bib.toLowerCase().includes(q)
  );
}

function downloadCsv(set: ResultSet, header: string[]) {
  const lines = set.rows.map((row) =>
    [row.place, row.bib, `"${row.name}"`, row.time, row.gap].join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${set.eventName}-${set.distance}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Certificate({
  set,
  row,
  onClose,
}: {
  set: ResultSet;
  row: ResultRow;
  onClose: () => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white">
      <div className="surface-solid max-w-lg w-full p-8 print:bg-white print:shadow-none">
        <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {t("results.certificateKicker")}
        </p>
        <h2 className="display mt-2 text-3xl">{set.eventName}</h2>
        <p className="mt-4 text-lg">
          <strong>{row.name}</strong>
        </p>
        <p className="muted">
          {t("results.distanceBib")} {set.distance} · {t("results.bib")} {row.bib}
        </p>
        <p className="mt-6 text-4xl font-bold">{row.time}</p>
        <p className="muted mt-2">
          {t("results.placeLabel")} {row.place}
        </p>
        <div className="mt-8 flex gap-3 print:hidden">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            {t("results.print")}
          </button>
          <button type="button" className="btn btn-ghost-dark" onClick={onClose}>
            {t("results.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  years: number[];
  resultsByYear: Record<number, ResultSet[]>;
};

export function ResultsBrowser({ years, resultsByYear }: Props) {
  const { locale, t } = usePreferences();
  const yearsWithData = years.filter(
    (year) => (resultsByYear[year] || []).length > 0,
  );
  const defaultYear = yearsWithData[0] || years[0];
  const [year, setYear] = useState(defaultYear);
  const sets = useMemo(() => resultsByYear[year] || [], [resultsByYear, year]);
  const eventNames = useMemo(
    () => [...new Set(sets.map((set) => set.eventName))],
    [sets],
  );
  const [eventName, setEventName] = useState(eventNames[0] || "");
  const distances = useMemo(
    () =>
      sets
        .filter((set) => set.eventName === eventName)
        .map((set) => set.distance),
    [sets, eventName],
  );
  const [distance, setDistance] = useState(distances[0] || "");
  const [query, setQuery] = useState("");
  const [openBib, setOpenBib] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<{
    set: ResultSet;
    row: ResultRow;
  } | null>(null);

  const activeSet = useMemo(() => {
    return (
      sets.find(
        (set) => set.eventName === eventName && set.distance === distance,
      ) || sets[0]
    );
  }, [sets, eventName, distance]);

  const rows = (activeSet?.rows || []).filter((row) => matchesQuery(row, query));

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="field md:col-span-2">
          <label htmlFor="query">{t("results.search")}</label>
          <input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("results.searchPlaceholder")}
          />
        </div>
        <div className="field">
          <label htmlFor="year">{t("results.year")}</label>
          <select
            id="year"
            value={year}
            onChange={(e) => {
              const nextYear = Number(e.target.value);
              setYear(nextYear);
              const nextSets = resultsByYear[nextYear] || [];
              const nextEvent = nextSets[0]?.eventName || "";
              setEventName(nextEvent);
              setDistance(
                nextSets.find((set) => set.eventName === nextEvent)?.distance ||
                  "",
              );
            }}
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="distance">{t("results.distance")}</label>
          <select
            id="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          >
            {distances.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {eventNames.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {eventNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                name === eventName
                  ? "bg-[color:var(--bg-deep)] text-[color:var(--brand)]"
                  : "surface"
              }`}
              onClick={() => {
                setEventName(name);
                const nextDistance =
                  sets.find((set) => set.eventName === name)?.distance || "";
                setDistance(nextDistance);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      {activeSet ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-3xl">{activeSet.eventName}</h2>
            <p className="muted">
              {new Date(activeSet.eventDate).toLocaleDateString(localeTag(locale))} ·{" "}
              {activeSet.distance}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost-dark"
            onClick={() =>
              downloadCsv(activeSet, [
                t("results.place"),
                t("results.bib"),
                t("results.name"),
                t("results.time"),
                t("results.gap"),
              ])
            }
          >
            {t("results.download")}
          </button>
        </div>
      ) : (
        <p className="muted mt-6">{t("results.empty")}</p>
      )}

      <div className="mt-6 overflow-x-auto surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[color:var(--line)]">
            <tr>
              <th className="px-4 py-3">{t("results.place")}</th>
              <th className="px-4 py-3">{t("results.bib")}</th>
              <th className="px-4 py-3">{t("results.name")}</th>
              <th className="px-4 py-3">{t("results.time")}</th>
              <th className="px-4 py-3">{t("results.gap")}</th>
              <th className="px-4 py-3">{t("results.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.bib}>
                <tr className="border-b border-[color:var(--line)]">
                  <td className="px-4 py-3">{row.place}</td>
                  <td className="px-4 py-3">{row.bib}</td>
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3">{row.gap || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="underline"
                        onClick={() =>
                          activeSet && setCertificate({ set: activeSet, row })
                        }
                      >
                        {t("results.certificate")}
                      </button>
                      {row.laps.length > 0 ? (
                        <button
                          type="button"
                          className="underline"
                          onClick={() =>
                            setOpenBib((current) =>
                              current === row.bib ? null : row.bib,
                            )
                          }
                        >
                          {openBib === row.bib
                            ? t("results.hideLaps")
                            : t("results.showLaps")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                {openBib === row.bib
                  ? row.laps.map((lap) => (
                      <tr
                        key={`${row.bib}-${lap.index}`}
                        className="bg-[color:var(--sand)] text-sm"
                      >
                        <td className="px-4 py-2" colSpan={2}>
                          {t("results.lap")} {lap.index}
                        </td>
                        <td className="px-4 py-2">{lap.time}</td>
                        <td className="px-4 py-2">
                          {t("results.lapPlace")} {lap.place}
                        </td>
                        <td className="px-4 py-2">{lap.cumulativeTime}</td>
                        <td className="px-4 py-2">
                          {t("results.cumulative")} {lap.cumulativePlace}
                        </td>
                      </tr>
                    ))
                  : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {certificate ? (
        <Certificate
          set={certificate.set}
          row={certificate.row}
          onClose={() => setCertificate(null)}
        />
      ) : null}
    </div>
  );
}
