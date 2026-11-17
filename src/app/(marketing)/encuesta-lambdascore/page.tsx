import { SurveyForm } from "@/marketing/components/survey-form";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Encuesta LambdaScore",
  description:
    "Evalúa el servicio de cronometraje y logística de LambdaScore en tu evento.",
  path: "/encuesta-lambdascore",
});

export default function EncuestaPage() {
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <h1 className="display section-title">
          Encuesta para organizadores
        </h1>
        <p className="text-lg muted">
          Cuéntanos cómo fue trabajar con nosotros. Tu evaluación mejora cada
          paquete de cronometraje y logística.
        </p>
        <div className="mt-8">
          <SurveyForm />
        </div>
      </div>
    </section>
  );
}
