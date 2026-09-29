import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MeasurementPage() {
  const session = await auth();
  if (session?.role !== "owner") redirect("/admin");
  return (
    <section className="card stack">
      <div>
        <h2>Medición de visitas y conversiones</h2>
        <p className="lede">Identificadores para registrar visitas y inscripciones completadas. La función está apagada.</p>
      </div>
      <label>
        Identificador de Meta
        <input disabled placeholder="No configurado" />
      </label>
      <label>
        Identificador de Google Ads
        <input disabled placeholder="No configurado" />
      </label>
      <label>
        Etiqueta de conversión
        <input disabled placeholder="No configurado" />
      </label>
      <button type="button" disabled>
        Guardar medición
      </button>
      <p className="hint">Se guarda solo cuando la función comercial está habilitada.</p>
    </section>
  );
}
