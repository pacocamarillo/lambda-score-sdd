import Link from "next/link";
import { PriceFrom } from "@/marketing/components/formatted-date";
import { T } from "@/marketing/components/t";
import { rentalPages } from "@/marketing/content/rental";
import { getRentalItems } from "@/marketing/lib/cms";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: rentalPages.arco.seoTitle,
  description: rentalPages.arco.seoDescription,
  path: "/renta-de-arco-meta-para-carreras",
});

export default async function ArcoMetaPage() {
  const rentalItems = await getRentalItems();
  const items = rentalItems.filter(
    (item) => item.pagePath === "/renta-de-arco-meta-para-carreras",
  );

  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">{rentalPages.arco.h1}</h1>
        <p className="max-w-3xl text-lg muted">{rentalPages.arco.lead}</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.name} className="surface p-5">
              <h2 className="text-xl font-bold">{item.name}</h2>
              {typeof item.priceFrom === "number" ? (
                <p className="mt-2 text-[color:var(--brand-deep)] font-semibold">
                  <PriceFrom amount={item.priceFrom} />
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <Link href="/quiero-cotizar" className="btn btn-primary mt-10">
          <T id="home.quote" />
        </Link>
      </div>
    </section>
  );
}
