import Link from "next/link";
import { T } from "@/marketing/components/t";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Nosotros | LambdaScore",
  description:
    "Empresa mexicana All-in-One de cronometraje RFID, infraestructura e inscripción para carreras en el centro de México.",
  path: "/nosotros",
});

const trust = [
  {
    title: "Infraestructura propia",
    body: "Arcos inflables, vallas y podios listos para vestir la meta.",
  },
  {
    title: "Plataforma de inscripción",
    body: "Registro, pagos y certificados digitales.",
  },
  {
    title: "Experiencia en terreno",
    body: "Ruta urbana, trail y MTB con altimetría exigente.",
  },
];

export default function NosotrosPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">
          Eliminamos el caos logístico de tu carrera.
        </h1>
        <p className="max-w-3xl text-lg muted">
          En Lambdascore Multiservicios S.A.S. unimos cronometraje electrónico,
          infraestructura propia e inscripción digital para que clubes, comités
          y municipios del centro del país entreguen eventos claros, seguros y
          memorables.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="surface p-6">
            <h2 className="display text-3xl">
              <T id="about.mission" />
            </h2>
            <p className="muted mt-3">
              Nacimos para que organizar una carrera deje de ser un rompecabezas
              de proveedores.
            </p>
          </div>
          <div className="surface p-6">
            <h2 className="display text-3xl">
              <T id="about.what" />
            </h2>
            <p className="muted mt-3">
              Solución All-in-One — chip RFID en el dorsal, arcos y vallas
              propios, kits de corredor y plataforma de inscripción.
            </p>
          </div>
        </div>

        <p className="mt-10 max-w-3xl muted">
          Operamos desde Puebla y la zona centro; también en CDMX, Edomex,
          Tlaxcala, Morelos, Hidalgo, Querétaro, Veracruz y Oaxaca.
        </p>

        <h2 className="display mt-14 text-3xl">
          <T id="about.trust" />
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {trust.map((item) => (
            <article key={item.title} className="border-t-4 border-[color:var(--brand)] surface p-5">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="muted mt-2">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <p className="text-lg font-semibold">
            <T id="about.quotePrompt" />
          </p>
          <Link href="/quiero-cotizar" className="btn btn-primary mt-4">
            <T id="about.quote" />
          </Link>
        </div>
      </div>
    </section>
  );
}
