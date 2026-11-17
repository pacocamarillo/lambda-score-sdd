import Link from "next/link";
import { T } from "@/marketing/components/t";
import { site } from "@/marketing/content/site";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Trifecta del Valle | LambdaScore",
  description:
    "Serial de MTB en Atlixco, Tochimilco y San Juan Epatlán. Organizamos lo que cronometramos.",
  path: "/trifecta",
});

const categories = [
  "Juvenil varonil",
  "Master 20",
  "Master 30",
  "Master 40",
  "Master 50",
  "Master 60",
  "Femenil avanzada",
  "Femenil libre",
];

const dates = [
  {
    name: "Xonacayucan / Atlixco",
    detail: "Veredas del valle de Atlixco",
    when: "19 de abril",
  },
  {
    name: "Tochimilco",
    detail: "Faldas del Popocatépetl",
    when: "31 de mayo",
  },
  {
    name: "San Juan Epatlán",
    detail: "Laguna y vegetación húmeda",
    when: "5 de julio",
  },
];

export default function TrifectaPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">
          Trifecta del Valle — el serial que también cronometramos.
        </h1>
        <p className="max-w-3xl text-lg muted">
          Tres fechas de MTB en Atlixco, Tochimilco y San Juan Epatlán. Prueba de
          que organizamos lo que medimos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dates.map((date) => (
            <article key={date.name} className="surface p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--brand-deep)]">
                {date.when}
              </p>
              <h2 className="display mt-2 text-3xl">{date.name}</h2>
              <p className="muted mt-2">{date.detail}</p>
            </article>
          ))}
        </div>

        <h2 className="display mt-14 text-3xl">
          <T id="trifecta.categories" />
        </h2>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {categories.map((item) => (
            <li key={item} className="surface px-4 py-3">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="bg-[color:var(--bg-deep)] p-6 text-white">
            <h2 className="display text-3xl">
              <T id="trifecta.registration" />
            </h2>
            <p className="mt-3 text-white/75">
              Inscríbete en línea o por WhatsApp enviando comprobante, nombre de
              la carrera, nombre completo y categoría.
            </p>
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-6"
            >
              <T id="trifecta.whatsapp" />
            </a>
          </div>
          <div className="surface p-6">
            <h2 className="display text-3xl">
              <T id="trifecta.results" />
            </h2>
            <p className="muted mt-3">
              Consulta clasificaciones y certificados en la sección de
              resultados.
            </p>
            <Link
              href="/resultados-eventos-lambdascore"
              className="btn btn-ghost-dark mt-6"
            >
              <T id="trifecta.viewResults" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
