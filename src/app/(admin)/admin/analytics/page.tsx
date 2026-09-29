import { PageIntro } from "../listing";

const breakdown = [
  "Vistas de evento",
  "Visitas a inscripción",
  "Visitas a la página principal",
  "Inscripciones completadas",
  "Vistas de resultados",
  "Vistas de noticias",
  "Vistas de fotos",
];

export default function AnalyticsPage() {
  return (
    <div className="stack">
      <PageIntro title="Analítica" lede="Visitas e inscripciones de la organización. La función está apagada, así que las cifras quedan en cero." />
      <p className="banner">Esta función es de pago. No cambia los accesos del panel mientras siga apagada.</p>
      <section className="card stack">
        <details>
          <summary>Qué significa cada métrica</summary>
          <p>Una vista cuenta una página. Un visitante cuenta una persona distinta. El embudo sigue a quien vio un evento, abrió la inscripción y la completó. Las fotos separan búsquedas y descargas.</p>
        </details>
        <form className="filters">
          <label>
            Periodo
            <select defaultValue="30">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </label>
          <label>
            Evento
            <select defaultValue="all" disabled>
              <option value="all">Todos los eventos</option>
            </select>
          </label>
        </form>
        <div className="stats">
          <p className="stat">
            <strong>0</strong>
            <span>Vistas totales</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Visitantes únicos</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Descargas de fotos</span>
          </p>
          <p className="stat">
            <strong>0</strong>
            <span>Búsquedas de fotos</span>
          </p>
        </div>
      </section>
      <div className="cards-2">
        <section className="card">
          <h2>Tendencia diaria</h2>
          <p className="empty">Sin visitas en el periodo elegido.</p>
        </section>
        <section className="card">
          <h2>Embudo de registro</h2>
          <ul className="feature-list">
            <li>
              Visitantes únicos <span>0</span>
            </li>
            <li>
              Vieron un evento <span>0</span>
            </li>
            <li>
              Visitaron la inscripción <span>0</span>
            </li>
            <li>
              Completaron el registro <span>0</span>
            </li>
          </ul>
          <h3>Embudo de fotos</h3>
          <p className="hint">Búsquedas 0 · Descargas 0</p>
        </section>
      </div>
      <section className="card">
        <h2>Desglose</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Métrica</th>
                <th scope="col">Vistas totales</th>
                <th scope="col">Visitantes únicos</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((metric) => (
                <tr key={metric}>
                  <td>{metric}</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
