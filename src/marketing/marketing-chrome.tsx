import { Barlow_Condensed, Manrope } from "next/font/google";
import Script from "next/script";
import { PreferencesProvider } from "@/marketing/components/preferences";
import { SiteShell } from "@/marketing/components/site-shell";
import { preferenceBootScript } from "@/marketing/lib/i18n";
import { organizationJsonLd } from "@/marketing/lib/seo";
import "@/marketing/marketing.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} antialiased marketing-root`}>
      <Script id="lambdascore-prefs" strategy="beforeInteractive">
        {preferenceBootScript}
      </Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      <PreferencesProvider>
        <SiteShell>{children}</SiteShell>
      </PreferencesProvider>
    </div>
  );
}
