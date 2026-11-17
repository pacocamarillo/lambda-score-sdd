import Image from "next/image";
import Link from "next/link";
import { FormattedDate } from "@/marketing/components/formatted-date";
import { T } from "@/marketing/components/t";
import { getPosts } from "@/marketing/lib/cms";
import { buildMetadata } from "@/marketing/lib/seo";

export const metadata = buildMetadata({
  title: "Blog | LambdaScore",
  description:
    "Guías para organizadores, crónicas de terreno y detrás del cronometraje LambdaScore.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPosts();
  const ordered = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <section className="section">
      <div className="container">
        <h1 className="display section-title">
          <T id="blog.title" />
        </h1>
        <p className="muted text-lg">
          <T id="blog.lead" />
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {ordered.map((post) => (
            <article key={post.slug} className="overflow-hidden surface">
              <div className="relative aspect-[16/9]">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <p className="text-sm muted">
                  <FormattedDate value={post.publishedAt} />
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  <Link href={`/${post.slug}`}>{post.cardTitle}</Link>
                </h2>
                <p className="muted mt-2">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
