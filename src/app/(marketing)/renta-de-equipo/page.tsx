import Link from "next/link";
import { PriceFrom } from "@/marketing/components/formatted-date";
import { T } from "@/marketing/components/t";
import { rentalPages } from "@/marketing/content/rental";
import type { MessageId } from "@/marketing/lib/i18n";
import { getRentalItems } from "@/marketing/lib/cms";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: rentalPages.index.seoTitle,
  description: rentalPages.index.seoDescription,
  path: "/renta-de-equipo",
});

const pages = [
  {
    href: "/renta-de-arco-meta-para-carreras",
    title: "Arco meta y premiación",
    body: "Arcos inflables, truss, cronómetro y podio.",
  },
  {
    href: "/renta-de-vallas-metalicas-en-puebla-seguridad-y-control-para-eventos-masivos",
    title: "Vallas metálicas",
    body: "Control de flujo y seguridad para eventos en Puebla.",
  },
];

export default async function RentaDeEquipoPage() {
  const rentalItems = await getRentalItems();
  const grouped = ["meta", "flujo", "premiacion", "otro"] as const;
  const scenarioLabel: Record<(typeof grouped)[number], MessageId> = {
    meta: "rental.meta",
    flujo: "rental.flow",
    premiacion: "rental.podium",
    otro: "rental.onsite",
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">{rentalPages.index.h1}</h1>
        <p className="max-w-3xl text-lg muted">{rentalPages.index.lead}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="border-t-4 border-[color:var(--brand)] surface p-6"
            >
              <h2 className="display text-3xl">{page.title}</h2>
              <p className="muted mt-2">{page.body}</p>
            </Link>
          ))}
        </div>

        <div className="mt-14 grid gap-10">
          {grouped.map((scenario) => {
            const items = rentalItems.filter((item) => item.scenario === scenario);
            if (items.length === 0) return null;
            return (
              <div key={scenario}>
                <h2 className="display text-2xl">
                  <T id={scenarioLabel[scenario]} />
                </h2>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.name} className="surface px-4 py-3">
                      <Link href={item.pagePath} className="font-semibold">
                        {item.name}
                      </Link>
                      {typeof item.priceFrom === "number" ? (
                        <p className="muted text-sm">
                          <PriceFrom amount={item.priceFrom} />
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
