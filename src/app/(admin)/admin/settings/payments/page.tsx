import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function PaymentsSettingsPage() {
  const session = await auth();
  if (session?.role !== "owner") redirect("/admin");
  return (
    <div className="cards-2">
      <section className="card">
        <h2>Mercado Pago</h2>
        <p>Cuenta no conectada. Al conectarla, los cobros de ese medio llegan a la cuenta de la organización.</p>
        <button type="button" disabled>
          Conectar Mercado Pago
        </button>
      </section>
      <section className="card">
        <h2>Stripe</h2>
        <p>Cuenta no conectada. La conexión es independiente de Mercado Pago y no la reemplaza.</p>
        <button type="button" disabled>
          Conectar Stripe
        </button>
      </section>
    </div>
  );
}
