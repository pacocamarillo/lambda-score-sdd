import { EmptyTable, PageIntro } from "../listing";

export default function CommunicationsPage() {
  return (
    <div className="stack">
      <PageIntro title="Comunicaciones" lede="Campañas a contactos o a personas inscritas. La función está apagada: no se crea ni se envía nada." />
      <p className="banner">Esta función es de pago. El cupo y las campañas se muestran para que sepas qué incluyen.</p>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Cupo de correos</h2>
            <p className="lede">La base mensual se reinicia. El saldo comprado no vence. Pruebas y envíos masivos descuentan cupo.</p>
          </div>
          <button type="button" disabled>
            Comprar más correos
          </button>
        </div>
        <div className="stats">
          <p className="stat">
            <strong>0</strong>
            <span>Base mensual</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Saldo comprado</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Usados este mes</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Disponibles</span>
          </p>
        </div>
      </section>
      <section className="card stack">
        <div className="card-head">
          <h2>Campañas</h2>
          <button type="button" className="ghost" disabled>
            Comunicación rápida
          </button>
        </div>
        <EmptyTable
          columns={["Campaña", "Tipo", "Estado", "Actualizada", "Acciones"]}
          message="Todavía no hay campañas. Cuando la función esté activa podrás empezar de un ejemplo o en blanco, revisar la audiencia y enviar una prueba antes del envío masivo."
        />
      </section>
    </div>
  );
}
