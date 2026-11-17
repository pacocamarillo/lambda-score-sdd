import type { Service } from "@/marketing/lib/content";

export const services: Service[] = [
  {
    id: "asesoria",
    name: "Asesoría para organizar una carrera",
    summary:
      "Te guiamos paso a paso si es tu primera carrera o si quieres escalar el evento.",
    quotable: true,
  },
  {
    id: "cronometraje",
    name: "Servicio de cronometraje deportivo",
    summary:
      "Chip RFID en el dorsal, lecturas en salida, intermedios y meta, resultados en vivo.",
    quotable: true,
  },
  {
    id: "arco",
    name: "Renta de arco meta inflable",
    summary: "Presencia de marca en la meta y punto visual para fotos de llegada.",
    quotable: true,
  },
  {
    id: "vallas",
    name: "Renta de vallas metálicas",
    summary: "Control de flujo en salida, hidratación y canalización a meta.",
    quotable: true,
  },
  {
    id: "marketing",
    name: "Servicios de marketing",
    summary: "Difusión y materiales para llenar tu lista de inscritos.",
    quotable: true,
  },
];

export const serviceBlocks = [
  {
    id: "integral",
    title: "Paquete integral",
    problem: "Muchos proveedores, un solo día de carrera.",
    body: "Coordinamos cronometraje, infraestructura, kits e inscripción con precio preferencial. Un solo interlocutor desde la cotización hasta la meta.",
  },
  {
    id: "rfid",
    title: "Cronometraje con chip RFID en el dorsal",
    problem: "Chips que se pierden, depósitos y lecturas dudosas.",
    body: "Sin chip en el zapato y sin devolución. Lectura en salida, intermedios y meta; resultados en vivo para organizadores y atletas.",
  },
  {
    id: "kits",
    title: "Kit de corredor",
    problem: "Armar el kit a última hora resta tiempo a la logística.",
    body: "Dorsal con chip, playera, medalla, buff, calcetas, gorra, bandana, morral y pañoleta para mascotas, según lo que elijas.",
  },
  {
    id: "arco",
    title: "Arco meta inflable",
    problem: "Una meta sin presencia se siente improvisada.",
    body: "Estructura con tu marca y patrocinadores, montaje rápido y punto visual para la foto de llegada.",
  },
  {
    id: "vallas",
    title: "Vallas de control de flujo",
    problem: "Salidas amontonadas y corredores fuera de carril.",
    body: "Oleadas, canalización a meta e hidratación ordenada con vallas ligeras de instalación rápida.",
  },
  {
    id: "inscripcion",
    title: "Plataforma de inscripción",
    problem: "Inscripciones dispersas y poca visibilidad en buscadores.",
    body: "Landing del evento, categorías, pagos, dorsales y estrategia de posicionamiento para que te encuentren.",
  },
];

export const disciplines = [
  "Ciclismo (ruta, MTB)",
  "Running (ruta, trail)",
  "Triatlón",
  "Natación",
];

export const serviceFaqs = [
  {
    question: "¿El chip va en el dorsal?",
    answer: "Sí; no hace falta chip en el zapato ni pulsera.",
  },
  {
    question: "¿Se devuelve el chip?",
    answer: "No; el corredor se lleva el dorsal.",
  },
  {
    question: "¿Sirve para ciclismo y MTB?",
    answer: "Sí; las antenas leen a velocidad de ruta y de montaña.",
  },
  {
    question: "¿Puedo contratar solo una pieza?",
    answer: "Sí; el integral sale mejor en precio y coordinación.",
  },
  {
    question: "¿La inscripción ayuda a que nos encuentren en Google?",
    answer: "Sí; la landing se entrega con estrategia de posicionamiento.",
  },
];

export const servicesPage = {
  h1: "El paquete completo para tu carrera.",
  lead: "Un solo proveedor para cronometraje, meta, control de flujo, kits e inscripciones. Arma solo lo que necesitas o llévate el integral.",
  seoTitle: "Servicios de cronometraje y producción de carreras | LambdaScore",
  seoDescription:
    "Chip RFID en el dorsal, kits, arco meta, vallas e inscripción en un solo paquete para running, MTB, triatlón y natación.",
};
