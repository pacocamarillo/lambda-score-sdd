import type { Metadata } from "next";
import { site } from "@/marketing/content/site";

const defaultOgImage = `${site.url}/images/hero-meta.jpg`;

export function absoluteUrl(path = "/"): string {
  if (path === "/") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = defaultOgImage,
  type = "website",
  index = true,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lambdascore",
      locale: "es_MX",
      type,
      images: [{ url: image, width: 1280, height: 963 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        legalName: site.legalName,
        url: site.url,
        logo: `${site.url}/images/logo-lambda.png`,
        email: site.email,
        telephone: site.phoneDisplay,
        sameAs: site.social.map((item) => item.href),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "es-MX",
      },
    ],
  };
}
