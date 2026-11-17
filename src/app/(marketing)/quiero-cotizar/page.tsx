import { QuoteForm } from "@/marketing/components/quote-form";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Quiero cotizar | LambdaScore",
  description:
    "Cotiza cronometraje RFID, arcos, vallas y kits. Respuesta en menos de 24 horas en el centro de México.",
  path: "/quiero-cotizar",
});

export default function QuieroCotizarPage() {
  return (
    <section className="section">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="display section-title">
            Cotiza tu carrera con un paquete cerrado.
          </h1>
          <p className="text-lg muted">
            Cuéntanos el evento. Respondemos en menos de 24 horas con una
            propuesta clara —sin compromiso.
          </p>
          <p className="mt-6 rounded-xl bg-[color:var(--bg-deep)] p-5 text-white">
            Respuesta en menos de 24 horas · Cobertura en CDMX, Edomex, Puebla,
            Tlaxcala, Morelos, Hidalgo, Querétaro, Veracruz y Oaxaca.
          </p>
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}
