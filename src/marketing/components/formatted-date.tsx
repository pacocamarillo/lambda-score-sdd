"use client";

import { localeTag } from "@/marketing/lib/i18n";
import { usePreferences } from "@/marketing/components/preferences";

export function FormattedDate({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { locale } = usePreferences();
  const date = new Date(value);
  const text = Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(localeTag(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return <span className={className}>{text}</span>;
}

export function PriceFrom({ amount }: { amount: number }) {
  const { locale, t } = usePreferences();
  return (
    <>
      {t("rental.from")} ${amount.toLocaleString(localeTag(locale))}
    </>
  );
}
