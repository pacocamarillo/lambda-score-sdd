import Link from "next/link";
import { notFound } from "next/navigation";
import { organizationFromRequestHost } from "@/lib/tenant";
import { listPublishedNews } from "@/modules/site/news";

export default async function NoticiasIndexPage() {
  const organization = await organizationFromRequestHost();
  if (!organization) notFound();
  const news = await listPublishedNews(organization.id);

  return (
    <div className="stack register-page">
      <header>
        <h1>Noticias</h1>
        <p className="lede">{organization.name}</p>
      </header>
      {news.length === 0 ? (
        <p className="empty">Todavía no hay noticias publicadas.</p>
      ) : (
        <ul className="feature-list">
          {news.map((post) => (
            <li key={post.id}>
              <Link href={`/noticias/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
