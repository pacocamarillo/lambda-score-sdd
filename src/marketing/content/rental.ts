import type { RentalItem } from "@/marketing/lib/content";

export const rentalItems: RentalItem[] = [
  {
    name: "Arco meta inflable de 6 metros",
    priceFrom: 1800,
    scenario: "meta",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Arco meta túnel inflable de 9 metros",
    priceFrom: 2500,
    scenario: "meta",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Estructura truss galvanizada para meta",
    priceFrom: 2500,
    scenario: "meta",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Estructura truss para línea de meta",
    priceFrom: 4500,
    scenario: "meta",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Truss galvanizado para escenario",
    priceFrom: 5500,
    scenario: "premiacion",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Podium de premiación",
    priceFrom: 1000,
    scenario: "premiacion",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Cronómetro para carreras",
    priceFrom: 1500,
    scenario: "meta",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Equipo de audio y unifilas",
    priceFrom: 2000,
    scenario: "otro",
    pagePath: "/renta-de-arco-meta-para-carreras",
  },
  {
    name: "Vallas metálicas para control de flujo",
    scenario: "flujo",
    pagePath:
      "/renta-de-vallas-metalicas-en-puebla-seguridad-y-control-para-eventos-masivos",
  },
];

export const rentalPages = {
  index: {
    h1: "Renta de equipo para tu carrera",
    lead: "Infraestructura propia: meta, control de flujo y premiación. Cotiza solo lo que necesitas o arma el paquete con cronometraje.",
    seoTitle: "Renta de equipo para carreras | LambdaScore",
    seoDescription:
      "Renta de arco meta, vallas y podios para carreras en Puebla y el centro de México.",
  },
  arco: {
    h1: "Renta de arco meta para carreras",
    lead: "Arcos inflables, truss y podio con precios desde. Montaje incluido y respuesta el mismo día para urgencias.",
    seoTitle: "Renta de arco meta para carreras | LambdaScore",
    seoDescription:
      "Renta de arco meta inflable para running y ciclismo. Precios desde y montaje incluido en el centro de México.",
  },
  vallas: {
    h1: "Renta de vallas metálicas en Puebla",
    lead: "Seguridad y control de flujo para carreras, conciertos y eventos masivos. Instalación profesional.",
    seoTitle:
      "Renta de Vallas Metálicas en Puebla | Seguridad y Control para Eventos Masivos | LambdaScore",
    seoDescription:
      "Vallas metálicas para control de acceso y flujo en eventos deportivos y masivos en Puebla.",
  },
};

export const scenarioLabels: Record<string, string> = {
  meta: "Meta",
  flujo: "Control de flujo",
  premiacion: "Premiación",
  otro: "Apoyo en sitio",
};
