import { hasDatabase } from "@/db/client";
import { organizationFromRequestHost } from "@/lib/tenant";
import { MarketingChrome } from "@/marketing/marketing-chrome";
import { MarketingHomePage } from "@/marketing/home-page";
import { listPublishedNews } from "@/modules/site/news";
import { getSiteSettings } from "@/modules/site/settings";
import { PublicHomePage } from "./(public)/home-page";
import { PublicFooter } from "./(public)/footer";

export const revalidate = 60;

export default async function HomePage() {
  if (hasDatabase()) {
    try {
      const organization = await organizationFromRequestHost();
      if (organization) {
        const settings = await getSiteSettings(organization.id);
        if (!settings.active) {
          return (
            <div className="public-shell">
              <main className="auth-shell">
                <div className="stack auth-card">
                  <h1>{organization.name}</h1>
                  <p className="lede">El sitio público está apagado por ahora.</p>
                  <a className="button" href="/login">
                    Ir al acceso
                  </a>
                </div>
              </main>
              <PublicFooter />
            </div>
          );
        }

        const news = await listPublishedNews(organization.id);
        return (
          <div className="public-shell">
            <main className="auth-shell">
              <PublicHomePage
                organizationName={organization.name}
                settings={settings}
                news={news.map((post) => ({
                  id: post.id,
                  title: post.title,
                  slug: post.slug,
                  excerpt: post.excerpt,
                  imageDataUrl: post.imageDataUrl,
                  publishedAt: post.publishedAt,
                }))}
              />
            </main>
            <PublicFooter />
          </div>
        );
      }
    } catch {
      // fall through to marketing site
    }
  }

  return (
    <MarketingChrome>
      <MarketingHomePage />
    </MarketingChrome>
  );
}
