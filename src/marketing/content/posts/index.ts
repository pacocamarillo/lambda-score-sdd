import type { Post } from "@/marketing/lib/content";

export const posts: Post[] = [
  {
    slug: "cronometraje-deportivo-pequenas-carreras-tonanitla-edomex",
    title:
      "Carreras pequeñas en Edomex también merecen cronometraje profesional: así fue nuestra experiencia en Tonanitla",
    cardTitle: "Cronometraje profesional en Tonanitla, Edomex",
    publishedAt: "2026-09-29",
    excerpt:
      "Descubre cómo aplicamos cronometraje con chip y medición intermedia en una carrera de 10K en Tonanitla.",
    description:
      "Cronometraje con chip y medición intermedia en Tonanitla, Edomex. Resultados en vivo para 3K, 5K y 10K.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Carrera en Tonanitla con cronometraje LambdaScore",
    body: `En Tonanitla demostramos que una carrera chica también merece chip RFID, puntos intermedios y resultados en vivo.

Montamos antenas ligeras, entregamos dorsales con chip integrado y publicamos tiempos para 3K, 5K y 10K el mismo día.

Si organizas en Edomex o en cualquier municipio del centro, el estándar no depende del tamaño del pelotón.`,
  },
  {
    slug: "kits-personalizados-para-organizadores-de-carreras-running-y-mtb-lambdascore",
    title:
      "Kits Personalizados para Organizadores de Carreras | Running y MTB | LambdaScore",
    cardTitle: "Kits personalizados para running y MTB",
    publishedAt: "2026-07-20",
    excerpt:
      "Playera, dorsal con chip y medalla listos para entregar en expo o el día de la carrera.",
    description:
      "Kits personalizados LambdaScore: playera, dorsal y medalla para running o MTB. Envíos a todo México.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Kit de corredor LambdaScore",
    body: `Simplifica la logística con un kit listo: dorsal con chip RFID, playera sublimada y medalla finisher.

Tú defines el contenido; nosotros producimos, empacamos y entregamos.`,
  },
  {
    slug: "como-organizar-una-carrera-de-running-o-ciclismo",
    title:
      "Cómo organizar una carrera de Running o Ciclismo | Guía completa | LambdaScore",
    cardTitle: "Cómo organizar una carrera de running o ciclismo",
    publishedAt: "2026-07-14",
    excerpt:
      "Guía para organizar running, trail o ciclismo en Puebla, Tlaxcala, Morelos, Edomex, Oaxaca y Veracruz.",
    description:
      "Guía para organizar una carrera de running, trail o ciclismo en el centro y sureste de México con LambdaScore.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Organización de carrera deportiva",
    body: `Organizar una carrera implica ruta, permisos, kit, meta, cronometraje e inscripción.

Esta guía resume el orden práctico y cómo un proveedor All-in-One reduce el caos el día del evento.`,
  },
  {
    slug: "922-2",
    title:
      "Tochimilco se Vistió de Fiesta: “El Calvario del Conejo” Consagra a la Trifecta del Valle como el Mejor Serial de MTB del Centro del País",
    cardTitle: "Trifecta en Tochimilco: El Calvario del Conejo",
    publishedAt: "2026-06-01",
    excerpt:
      "Crónica de la segunda fecha de la Trifecta del Valle en Tochimilco.",
    description:
      "Segunda fecha de la Trifecta del Valle en Tochimilco con cronometraje LambdaScore.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Trifecta del Valle en Tochimilco",
    body: `La segunda fecha de la Trifecta del Valle reunió a la comunidad MTB en Tochimilco con organización puntual y cronometraje en vivo.

Organizamos lo que medimos: esa es la diferencia cuando el mismo equipo viste la meta y publica los resultados.`,
  },
  {
    slug: "xonacayucan-mejor-carrera-mtb-puebla-19-abril-trifecta-valle",
    title:
      "Xonacayucan, el escenario perfecto: así se vivió la primera fecha de la Trifecta del Valle, la mejor carrera de MTB de Puebla (19 de abril)",
    cardTitle: "Xonacayucan: primera fecha de la Trifecta",
    publishedAt: "2026-04-20",
    excerpt: "Crónica de la primera fecha de la Trifecta en Xonacayucan, Atlixco.",
    description:
      "Primera fecha de la Trifecta del Valle en Xonacayucan: MTB en el valle de Atlixco.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Trifecta en Xonacayucan",
    body: `Xonacayucan abrió el serial con veredas del valle de Atlixco y un pelotón listo para tres fechas.

La Trifecta no es solo una carrera: es un reto de constancia en tres municipios de Puebla.`,
  },
  {
    slug: "ciclistas-conquistan-tochimilco-cronoescalda-2026",
    title: "Ciclistas conquistan Tochimilco: Cronoescalda 2026",
    cardTitle: "Cronoescalada 2026 en Tochimilco",
    publishedAt: "2026-03-30",
    excerpt:
      "Cupo lleno desde la salida en Tochimilco hasta la meta en Cuilotepec.",
    description:
      "Cronoescalada Puebla 2026 en Tochimilco con cupo lleno y cronometraje LambdaScore.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Cronoescalada 2026",
    body: `La Cronoescalada 2026 llenó el cupo. Revive la subida desde Tochimilco hasta Cuilotepec con resultados oficiales.`,
  },
  {
    slug: "resultados_cronoescalda_2026",
    title: "Resultados de la Cronoescolada 2026",
    cardTitle: "Resultados Cronoescalada 2026",
    publishedAt: "2026-03-27",
    excerpt: "Consulta los resultados de la Cronoescalada de Ruta 2026.",
    description:
      "Resultados de la Cronoescalada de Ruta 2026 en Tochimilco, Puebla.",
    image: "/images/hero-meta.jpg",
    imageAlt: "Resultados Cronoescalada 2026",
    body: `Los resultados completos de la Cronoescalada 2026 están disponibles en la sección de Resultados del sitio.

Busca por nombre o dorsal y descarga tu certificado.`,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((post) => post.slug);
}
