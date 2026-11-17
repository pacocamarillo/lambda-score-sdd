"use client";

import Link from "next/link";
import { usePreferences } from "@/marketing/components/preferences";
import { site } from "@/marketing/content/site";
import type { MessageId } from "@/marketing/lib/i18n";

const itemLabel: Record<string, MessageId> = {
  "/servicios": "nav.services",
  "/renta-de-equipo": "nav.rental",
  "/quiero-cotizar": "nav.quote",
  "/events": "nav.events",
  "/resultados-eventos-lambdascore": "nav.results",
  "/blog": "nav.blog",
  "/nosotros": "nav.about",
};

export function SiteFooter() {
  const { t } = usePreferences();

  return (
    <footer className="mt-auto bg-[color:var(--bg-deep)] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display text-3xl text-[color:var(--brand)]">{site.name}</p>
          <p className="mt-3 max-w-sm text-white/70">{t("footer.tagline")}</p>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-[0.18em] text-white/45">
            {t("footer.contact")}
          </h2>
          <ul className="mt-4 space-y-2 text-white/85">
            <li>
              {t("footer.calls")}:{" "}
              <a href={`tel:${site.phone}`} className="underline-offset-2 hover:underline">
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              {t("footer.marketing")}:{" "}
              <a
                href={`tel:${site.marketingPhone}`}
                className="underline-offset-2 hover:underline"
              >
                {site.marketingPhoneDisplay}
              </a>
            </li>
            <li>
              {t("footer.email")}:{" "}
              <a
                href={`mailto:${site.email}`}
                className="underline-offset-2 hover:underline"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                {t("footer.whatsapp")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-[0.18em] text-white/45">
            {t("footer.menu")}
          </h2>
          <ul className="mt-4 space-y-2 text-white/85">
            <li>
              <Link href="/">{site.name}</Link>
            </li>
            <li>
              <Link href={site.companyLink.href}>
                {t(itemLabel[site.companyLink.href])}
              </Link>
            </li>
            {site.navGroups.flatMap((group) =>
              group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{t(itemLabel[item.href])}</Link>
                </li>
              )),
            )}
          </ul>
          <div className="mt-6 flex gap-4">
            {site.social.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[color:var(--brand)] hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/45">
        © {new Date().getFullYear()} {site.legalName}
      </div>
    </footer>
  );
}
