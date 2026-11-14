import Link from "next/link";
import { notFound } from "next/navigation";
import { organizationFromRequestHost } from "@/lib/tenant";
import { getPublishedNewsBySlug } from "@/modules/site/news";

export default async function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = await organizationFromRequestHost();
  if (!organization) notFound();
  const post = await getPublishedNewsBySlug(organization.id, slug);
  if (!post) notFound();

  return (
    <div className="stack register-page legal-page">
      <header>
        <p className="hint">
          <Link href="/noticias">Noticias</Link>
        </p>
        <h1>{post.title}</h1>
        {post.publishedAt ? (
          <p className="lede">
            {post.publishedAt.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })}
          </p>
        ) : null}
      </header>
      {post.imageDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageDataUrl} alt="" className="news-hero" />
      ) : null}
      <article className="card stack news-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      <p className="hint">
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
