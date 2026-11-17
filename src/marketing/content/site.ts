import type { SiteConfig } from "@/marketing/lib/content";

export const site: SiteConfig = {
  name: "LambdaScore",
  legalName: "Lambdascore Multiservicios S.A.S.",
  url: "https://lambdascore.com.mx",
  phone: "+522441442188",
  phoneDisplay: "52 244 144 2188",
  marketingPhone: "+522441045215",
  marketingPhoneDisplay: "52 244 104 5215",
  email: "contacto@lambdascore.com.mx",
  whatsapp: "2441442188",
  whatsappUrl: "https://wa.me/522441442188",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/lambdascore" },
    { label: "YouTube", href: "https://www.youtube.com/@lambdascore" },
    { label: "Instagram", href: "https://www.instagram.com/lambdascore/" },
  ],
  navGroups: [
    {
      label: "Organizadores",
      items: [
        { href: "/servicios", label: "Servicios" },
        { href: "/renta-de-equipo", label: "Renta de equipo" },
        { href: "/quiero-cotizar", label: "Quiero cotizar" },
      ],
    },
    {
      label: "Atletas",
      items: [
        { href: "/events", label: "Eventos" },
        { href: "/resultados-eventos-lambdascore", label: "Resultados" },
        { href: "/blog", label: "Blog" },
      ],
    },
  ],
  companyLink: { href: "/nosotros", label: "Nosotros" },
  cta: { href: "/quiero-cotizar", label: "Quiero cotizar" },
};

export const homeCopy = {
  brand: "LambdaScore",
  promise: "Una sola empresa. Meta, chip, kit e inscripción.",
  support:
    "Profesionalizamos carreras en el centro de México, desde el primer 5K hasta el trail en montaña.",
  primaryCta: "Cotiza tu evento",
  secondaryCta: "Ver servicios",
  heroImage: "/images/hero-meta.jpg",
  heroImageAlt: "Meta de carrera cronometrada por LambdaScore",
  proofsTitle: "Por qué organizadores del centro nos eligen",
  proofs: [
    {
      title: "Chip que se queda con el corredor",
      body: "RFID integrado al dorsal. Sin depósitos. Sin devolución. Resultados en vivo.",
    },
    {
      title: "Infraestructura propia",
      body: "Arcos, vallas y podios del catálogo LambdaScore. Montaje listo para ruta o bosque.",
    },
    {
      title: "Organizamos lo que cronometramos",
      body: "La Trifecta del Valle y carreras locales. Hablamos el idioma del organizador porque también lo somos.",
    },
  ],
  socialProof:
    "Llegamos con el mismo estándar a una carrera de barrio y a un serial de MTB.",
  terrainTitle: "Misma precisión en el asfalto y en el bosque.",
  emptyEvents:
    "Pronto publicaremos nuevas fechas. Mientras tanto, revisa resultados.",
  seoTitle: "LambdaScore | Meta, chip, kit e inscripción para tu carrera",
  seoDescription:
    "Cronometraje RFID, arcos, vallas, kits e inscripción en un solo proveedor. Carreras en Puebla, Edomex, Oaxaca y el centro de México. Cotiza en menos de 24 horas.",
};

export const indexableRoutes = [
  "/",
  "/nosotros",
  "/servicios",
  "/renta-de-equipo",
  "/renta-de-arco-meta-para-carreras",
  "/renta-de-vallas-metalicas-en-puebla-seguridad-y-control-para-eventos-masivos",
  "/quiero-cotizar",
  "/events",
  "/event/carrera-de-mtb-zoker-2500-amozoc",
  "/resultados-eventos-lambdascore",
  "/blog",
  "/trifecta",
  "/encuesta-lambdascore",
] as const;
