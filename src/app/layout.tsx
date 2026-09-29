import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { organizationFromRequestHost } from "@/lib/tenant";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const organization = await organizationFromRequestHost();
  return { title: organization?.name ?? "Acceso" };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
