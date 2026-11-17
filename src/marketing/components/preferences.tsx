"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_KEY,
  THEME_KEY,
  isLocale,
  isTheme,
  localeTag,
  messages,
  type Locale,
  type MessageId,
  type Theme,
} from "@/marketing/lib/i18n";

type Preferences = {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  t: (id: MessageId) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    const nextLocale = isLocale(storedLocale) ? storedLocale : "es";
    setLocaleState(nextLocale);
    document.documentElement.dataset.locale = nextLocale;
    document.documentElement.lang = localeTag(nextLocale);

    const storedTheme = localStorage.getItem(THEME_KEY);
    const domTheme = document.documentElement.dataset.theme;
    const nextTheme = isTheme(storedTheme)
      ? storedTheme
      : isTheme(domTheme)
        ? domTheme
        : "light";
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const value = useMemo<Preferences>(() => {
    function setLocale(next: Locale) {
      setLocaleState(next);
      localStorage.setItem(LOCALE_KEY, next);
      document.documentElement.dataset.locale = next;
      document.documentElement.lang = localeTag(next);
    }

    function setTheme(next: Theme) {
      setThemeState(next);
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.dataset.theme = next;
    }

    return {
      locale,
      theme,
      setLocale,
      setTheme,
      t: (id) => messages[locale][id],
    };
  }, [locale, theme]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
