import Link from "next/link";
import type { SiteSettings } from "@/modules/site/settings";

type NewsCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageDataUrl: string | null;
  publishedAt: Date | null;
};

export function PublicHomePage({
  organizationName,
  settings,
  news,
}: {
  organizationName: string;
  settings: SiteSettings;
  news: NewsCard[];
}) {
  const networks = [
    ["Facebook", settings.facebookUrl],
    ["X", settings.xUrl],
    ["Instagram", settings.instagramUrl],
    ["YouTube", settings.youtubeUrl],
  ].filter(([, url]) => Boolean(url)) as Array<[string, string]>;

  const featured = news.slice(0, 3);
  const older = news.slice(3);

  return (
    <div className="stack public-home" style={themeInline(settings)}>
      {settings.coverEnabled ? (
        <section className="card stack public-cover">
          {settings.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.coverImage} alt={organizationName} className="public-cover-image" />
          ) : null}
          <h1>{settings.coverTitle || organizationName}</h1>
          {settings.coverDescription ? <p className="lede">{settings.coverDescription}</p> : null}
        </section>
      ) : (
        <header>
          <h1>{organizationName}</h1>
        </header>
      )}

      {settings.sponsors.length > 0 ? (
        <section className="card stack">
          <h2>Patrocinadores</h2>
          <ul className="sponsor-grid">
            {settings.sponsors.map((sponsor) => (
              <li key={sponsor.id}>
                {sponsor.siteUrl ? (
                  <a href={sponsor.siteUrl} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sponsor.logoDataUrl} alt={sponsor.name} />
                    <span>{sponsor.name}</span>
                  </a>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sponsor.logoDataUrl} alt={sponsor.name} />
                    <span>{sponsor.name}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(settings.contactPhone || settings.contactEmail || networks.length > 0) && (
        <section className="card stack">
          <h2>Contacto</h2>
          {settings.contactPhone ? <p>Teléfono: {settings.contactPhone}</p> : null}
          {settings.contactEmail ? (
            <p>
              Correo: <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            </p>
          ) : null}
          {networks.length > 0 ? (
            <ul className="feature-list">
              {networks.map(([label, url]) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {news.length > 0 ? (
        <section className="card stack">
          <h2>Noticias</h2>
          <div className="news-grid">
            {featured.map((post) => (
              <article key={post.id} className="news-card">
                {post.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageDataUrl} alt="" />
                ) : null}
                <h3>
                  <Link href={`/noticias/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
              </article>
            ))}
          </div>
          {older.length > 0 ? (
            <ul className="feature-list">
              {older.map((post) => (
                <li key={post.id}>
                  <Link href={`/noticias/${post.slug}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="hint">
            <Link href="/noticias">Ver todas las noticias</Link>
          </p>
        </section>
      ) : null}

      <p className="hint">
        <Link href="/login">Acceso al panel</Link>
      </p>
    </div>
  );
}

function themeInline(settings: SiteSettings) {
  return {
    ["--brand" as string]: settings.colorPrimary,
    ["--brand-hover" as string]: settings.colorSecondary,
    ["--ok" as string]: settings.colorSuccess,
    ["--danger" as string]: settings.colorWarning,
  };
}
