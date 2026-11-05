import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCoupon, listOrganizationCoupons } from "@/modules/coupons/crud";
import { couponStatus, formatCouponDiscount } from "@/modules/coupons/parse";
import { listOrganizationEvents } from "@/modules/events/crud";
import { EmptyTable, PageIntro } from "../listing";
import { CreateCouponDialog } from "./create-coupon-dialog";

function statusLabel(status: "active" | "exhausted" | "expired") {
  if (status === "exhausted") return "Agotado";
  if (status === "expired") return "Vencido";
  return "Disponible";
}

function appliesLabel(registration: boolean, addOns: boolean) {
  if (registration && addOns) return "Inscripción y adicionales";
  if (registration) return "Inscripción";
  if (addOns) return "Adicionales";
  return "—";
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; event?: string; status?: string; error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const params = await searchParams;
  const canEdit = session.role === "owner" || session.role === "admin";
  const [rows, events] = await Promise.all([
    listOrganizationCoupons(session.organizationId),
    listOrganizationEvents(session.organizationId),
  ]);
  const eventName = new Map(events.map((event) => [event.id, event.name]));
  const q = params.q?.trim().toLowerCase() ?? "";
  const eventFilter = params.event && params.event !== "all" ? params.event : "all";
  const statusFilter =
    params.status === "active" || params.status === "exhausted" || params.status === "expired"
      ? params.status
      : "all";

  const listed = rows.filter((row) => {
    const status = couponStatus(row);
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (eventFilter !== "all" && !row.allEvents && !row.eventIds.includes(eventFilter)) return false;
    if (!q) return true;
    return row.code.toLowerCase().includes(q) || row.description.toLowerCase().includes(q);
  });

  const uses = rows.reduce((sum, row) => sum + row.useCount, 0);

  async function create(formData: FormData) {
    "use server";
    const current = await auth();
    if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
      redirect("/admin");
    }
    const known = await listOrganizationEvents(current.organizationId);
    const result = await createCoupon(current.organizationId, {
      code: String(formData.get("code") ?? ""),
      discountType: String(formData.get("discountType") ?? ""),
      percent: String(formData.get("percent") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      description: String(formData.get("description") ?? ""),
      appliesToRegistration: formData.get("appliesToRegistration") === "on",
      appliesToAddOns: formData.get("appliesToAddOns") === "on",
      allEvents: String(formData.get("eventScope") ?? "all") !== "specific",
      eventIds: formData.getAll("eventId").map(String),
      includeFutureCompetitions: formData.get("includeFutureCompetitions") === "on",
      limitUses: formData.get("limitUses") === "on",
      usageLimit: String(formData.get("usageLimit") ?? ""),
      hasExpiry: formData.get("hasExpiry") === "on",
      expiresOn: String(formData.get("expiresOn") ?? ""),
      knownEventIds: known.map((event) => event.id),
    });
    if (!result.ok) redirect(`/admin/coupons?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/coupons?saved=1");
  }

  return (
    <div className="stack">
      <PageIntro
        title="Cupones"
        lede="Un cupón reduce el total. Se aplica al momento del pago del participante."
        action={canEdit ? <CreateCouponDialog events={events.map((event) => ({ id: event.id, name: event.name }))} action={create} /> : null}
      />
      {params.error ? <p className="error">{params.error}</p> : null}
      {params.saved ? <p className="notice">Cupón creado.</p> : null}
      <section className="card" aria-label="Resumen de usos y ahorro">
        <h2>Resumen de usos y ahorro</h2>
        <p className="lede">Indicadores de todos los cupones de la organización.</p>
        <div className="stats">
          <p className="stat">
            <strong>{rows.length}</strong>
            <span>Cupones</span>
          </p>
          <p className="stat">
            <strong>{uses}</strong>
            <span>Veces usado</span>
          </p>
          <p className="stat">
            <strong>{money(0)}</strong>
            <span>Ahorro total (MXN)</span>
          </p>
        </div>
      </section>
      <section className="card stack">
        <form className="filters" action="/admin/coupons">
          <label>
            Buscar
            <input name="q" type="search" placeholder="Código o descripción" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Eventos aplicables
            <select name="event" defaultValue={eventFilter}>
              <option value="all">Todos los eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select name="status" defaultValue={statusFilter}>
              <option value="all">Todos</option>
              <option value="active">Disponible</option>
              <option value="exhausted">Agotado</option>
              <option value="expired">Vencido</option>
            </select>
          </label>
          <div className="inline-actions">
            <button type="submit">Buscar</button>
            <a className="button ghost" href="/admin/coupons">
              Limpiar filtros
            </a>
          </div>
        </form>
        {listed.length === 0 ? (
          <EmptyTable
            columns={["Código", "Descuento", "Dónde se usa", "Aplica a", "Usos", "Vence", "Estado"]}
            message="Todavía no hay cupones con esos filtros."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Descuento</th>
                  <th scope="col">Dónde se usa</th>
                  <th scope="col">Aplica a</th>
                  <th scope="col">Usos</th>
                  <th scope="col">Vence</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {listed.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.code}</strong>
                      {row.description ? <div className="hint">{row.description}</div> : null}
                    </td>
                    <td>{formatCouponDiscount(row)}</td>
                    <td>
                      {row.allEvents
                        ? "Todos los eventos"
                        : row.eventIds.map((id) => eventName.get(id) ?? id).join(", ") || "—"}
                      {row.includeFutureCompetitions ? (
                        <div className="hint">Incluye competencias futuras</div>
                      ) : null}
                    </td>
                    <td>{appliesLabel(row.appliesToRegistration, row.appliesToAddOns)}</td>
                    <td>
                      {row.useCount}
                      {row.usageLimit != null ? ` / ${row.usageLimit}` : ""}
                    </td>
                    <td>
                      {row.expiresAt
                        ? row.expiresAt.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })
                        : "Sin vencimiento"}
                    </td>
                    <td>{statusLabel(couponStatus(row))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
