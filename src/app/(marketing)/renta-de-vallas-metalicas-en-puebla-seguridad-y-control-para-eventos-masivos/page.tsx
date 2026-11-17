import { QuoteForm } from "@/marketing/components/quote-form";
import { rentalPages } from "@/marketing/content/rental";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: rentalPages.vallas.seoTitle,
  description: rentalPages.vallas.seoDescription,
  path: "/renta-de-vallas-metalicas-en-puebla-seguridad-y-control-para-eventos-masivos",
});

export default function VallasPage() {
  return (
    <section className="section">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="display section-title">{rentalPages.vallas.h1}</h1>
          <p className="text-lg muted">{rentalPages.vallas.lead}</p>
          <ul className="muted mt-6 list-disc space-y-2 pl-5">
            <li>Control de acceso y zonas VIP</li>
            <li>Oleadas y canalización a meta</li>
            <li>Hidratación y áreas de recuperación</li>
            <li>Instalación profesional en Puebla</li>
          </ul>
        </div>
        <QuoteForm preselectedServices={["vallas"]} />
      </div>
    </section>
  );
}
