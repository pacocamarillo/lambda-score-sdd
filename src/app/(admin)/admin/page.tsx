import Link from "next/link";
import { auth } from "@/lib/auth";

const included = [
  { href: "/admin/settings/measurement", label: "Medición de visitas y conversiones", ownerOnly: true },
  { href: "/admin/settings#dominio", label: "Dominio propio", ownerOnly: true },
  { href: "/admin/analytics", label: "Analítica" },
  { href: "/admin/communications", label: "Comunicaciones" },
  { href: "/admin/events", label: "Cronometraje" },
  { href: "/admin/events", label: "Fotos del evento" },
];

const extras = [
  ["Cuentas de pago por evento", "Una cuenta distinta para cobrar ese evento."],
  ["Cargo por participante", "Se suma en el formulario de inscripción."],
  ["Eventos privados", "La inscripción pide un código de acceso."],
  ["Lotes de cupones", "Varios códigos con las mismas condiciones, para copiar o exportar."],
  ["Roles de staff", "Accesos distintos en cada evento."],
];

export default async function AdminHomePage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "";
  const role = session?.role;
  const actions = [{ href: "/admin/events", label: "Crear evento" }];
  if (role === "owner" || role === "admin") actions.push({ href: "/admin/website", label: "Página web" });
  if (role === "owner") actions.push({ href: "/admin/settings", label: "Configuración" });
  if (role === "admin") actions.push({ href: "/admin/coupons", label: "Cupones" });

  return (
    <div className="dashboard">
      <section className="card welcome-card">
        <h1>{name ? `Bienvenido de nuevo, ${name}` : "Bienvenido de nuevo"}</h1>
        <p className="lede">Esto es lo que está pasando con tus eventos hoy.</p>
      </section>
      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Eventos recientes</h2>
            <Link href="/admin/events">Ver todos</Link>
          </div>
          <p className="empty">No hay eventos recientes. El primero lleva nombre, fecha, lugar y al menos una competencia.</p>
        </section>
        <div className="stack">
          <section className="card">
            <h2>Acciones rápidas</h2>
            <div className="quick">
              {actions.map((action) => (
                <Link key={action.href + action.label} href={action.href}>
                  {action.label}
                </Link>
              ))}
            </div>
          </section>
          {role === "owner" || role === "admin" ? (
            <section className="card">
              <h2>Funciones avanzadas</h2>
              <h3>Al habilitarlas</h3>
              <ul className="feature-list">
                {included
                  .filter((item) => !item.ownerOnly || role === "owner")
                  .map((item) => (
                    <li key={item.label}>
                      <Link href={item.href}>{item.label}</Link>
                      <span className="badge">De pago</span>
                    </li>
                  ))}
              </ul>
              <h3>Adicionales</h3>
              <p className="hint">Se suman a las anteriores. Siguen apagadas.</p>
              <ul className="feature-list">
                {extras.map(([title, detail]) => (
                  <li key={title}>
                    <span>
                      {title}
                      <span className="detail">{detail}</span>
                    </span>
                    <span className="badge">Adicional</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
