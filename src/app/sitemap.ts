import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/marketing/content/site";
import { getPosts } from "@/marketing/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const staticEntries = indexableRoutes.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const postEntries = posts.map((post) => ({
    url: `${site.url}/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticEntries, ...postEntries];
}
