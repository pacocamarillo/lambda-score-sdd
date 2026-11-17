"use client";

import { locales, type Locale, type Theme } from "@/marketing/lib/i18n";
import { usePreferences } from "@/marketing/components/preferences";

const localeLabel = {
  es: "lang.es",
  en: "lang.en",
  pt: "lang.pt",
} as const;

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="2.4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8 1.4v1.8M8 12.8v1.8M1.4 8h1.8M12.8 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 1.6a6.4 6.4 0 1 0 4.2 9.6 5.2 5.2 0 0 1-4.2-9.6z"
      />
    </svg>
  );
}

export function PreferenceControls() {
  const { locale, setLocale, setTheme, t } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <div className="pref-group" role="group" aria-label={t("lang.group")}>
        {locales.map((item) => (
          <button
            key={item}
            type="button"
            data-locale-option={item}
            className="pref-option"
            aria-pressed={locale === item}
            onClick={() => setLocale(item as Locale)}
          >
            {t(localeLabel[item])}
          </button>
        ))}
      </div>
      <div className="pref-group" role="group" aria-label={t("theme.group")}>
        {(["light", "dark"] as Theme[]).map((item) => (
          <button
            key={item}
            type="button"
            data-theme-option={item}
            className="pref-option pref-icon"
            aria-label={t(item === "light" ? "theme.light" : "theme.dark")}
            title={t(item === "light" ? "theme.light" : "theme.dark")}
            onClick={() => setTheme(item)}
          >
            {item === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
        ))}
      </div>
    </div>
  );
}
