import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { hasDatabase } from "@/db/client";
import { organizationFromRequestHost } from "@/lib/tenant";
import { getSiteSettings, themeStyleVars } from "@/modules/site/settings";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const organization = await organizationFromRequestHost();
  return { title: organization?.name ?? "Acceso" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let theme: Record<string, string> | undefined;
  try {
    if (hasDatabase()) {
      const organization = await organizationFromRequestHost();
      if (organization) {
        const settings = await getSiteSettings(organization.id);
        theme = themeStyleVars(settings);
      }
    }
  } catch {
    theme = undefined;
  }

  return (
    <html lang="es-MX" className={sans.variable}>
      <body style={theme as CSSProperties | undefined}>{children}</body>
    </html>
  );
}
