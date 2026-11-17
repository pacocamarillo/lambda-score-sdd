import { events as seedEvents } from "@/marketing/content/events";
import { seedVideos } from "@/marketing/content/videos";
import { posts as seedPosts } from "@/marketing/content/posts";
import { rentalItems as seedRental } from "@/marketing/content/rental";
import { resultYears as seedYears, resultsByYear as seedResults } from "@/marketing/content/results";
import type { Event, Post, RentalItem, ResultSet } from "@/marketing/lib/content";
import { toFeaturedVideo, type FeaturedVideo } from "@/marketing/lib/youtube";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";
import {
  eventsQuery,
  postBySlugQuery,
  postsQuery,
  rentalItemsQuery,
  videosQuery,
  resultSetsByYearQuery,
  resultYearsQuery,
} from "@/sanity/lib/queries";

function withFallbackImage(url?: string | null) {
  return url && url.length > 0 ? url : "/images/hero-meta.jpg";
}

function mapPost(raw: Record<string, unknown>): Post {
  return {
    slug: String(raw.slug || ""),
    title: String(raw.title || ""),
    cardTitle: String(raw.cardTitle || raw.title || ""),
    publishedAt: String(raw.publishedAt || "").slice(0, 10),
    excerpt: String(raw.excerpt || ""),
    description: String(raw.description || ""),
    image: withFallbackImage(raw.image as string | undefined),
    imageAlt: String(raw.imageAlt || raw.title || "LambdaScore"),
    body: String(raw.body || ""),
  };
}

function mapEvent(raw: Record<string, unknown>): Event {
  return {
    slug: String(raw.slug || ""),
    name: String(raw.name || ""),
    startsAt: String(raw.startsAt || ""),
    place: String(raw.place || ""),
    image: withFallbackImage(raw.image as string | undefined),
    imageAlt: String(raw.imageAlt || raw.name || "Evento"),
    registrationUrl: String(raw.registrationUrl || ""),
    summary: String(raw.summary || ""),
  };
}

export async function getPosts(): Promise<Post[]> {
  if (!isSanityConfigured()) return seedPosts;
  try {
    const data = await sanityClient.fetch(postsQuery);
    if (!Array.isArray(data) || data.length === 0) return seedPosts;
    return data.map(mapPost);
  } catch {
    return seedPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  if (!isSanityConfigured()) {
    return seedPosts.find((post) => post.slug === slug);
  }
  try {
    const data = await sanityClient.fetch(postBySlugQuery, { slug });
    if (!data) return seedPosts.find((post) => post.slug === slug);
    return mapPost(data);
  } catch {
    return seedPosts.find((post) => post.slug === slug);
  }
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getPosts();
  return posts.map((post) => post.slug);
}

export async function getVideos(): Promise<FeaturedVideo[]> {
  if (!isSanityConfigured()) return seedVideos;
  try {
    const data = await sanityClient.fetch(videosQuery);
    if (!Array.isArray(data) || data.length === 0) return seedVideos;
    const mapped = data.flatMap((item) => {
      const video = toFeaturedVideo(
        String(item.title || "Video"),
        String(item.youtubeUrl || ""),
      );
      return video ? [video] : [];
    });
    return mapped.length > 0 ? mapped : seedVideos;
  } catch {
    return seedVideos;
  }
}

export async function getEvents(): Promise<Event[]> {
  if (!isSanityConfigured()) return seedEvents;
  try {
    const data = await sanityClient.fetch(eventsQuery);
    if (!Array.isArray(data) || data.length === 0) return seedEvents;
    return data.map(mapEvent);
  } catch {
    return seedEvents;
  }
}

export async function getRentalItems(): Promise<RentalItem[]> {
  if (!isSanityConfigured()) return seedRental;
  try {
    const data = await sanityClient.fetch(rentalItemsQuery);
    if (!Array.isArray(data) || data.length === 0) return seedRental;
    return data as RentalItem[];
  } catch {
    return seedRental;
  }
}

export async function getResultYears(): Promise<number[]> {
  if (!isSanityConfigured()) return seedYears;
  try {
    const data = await sanityClient.fetch(resultYearsQuery);
    if (!Array.isArray(data) || data.length === 0) return seedYears;
    return data as number[];
  } catch {
    return seedYears;
  }
}

export async function getResultsByYear(year: number): Promise<ResultSet[]> {
  if (!isSanityConfigured()) return seedResults[year] || [];
  try {
    const data = await sanityClient.fetch(resultSetsByYearQuery, { year });
    if (!Array.isArray(data) || data.length === 0) return seedResults[year] || [];
    return data as ResultSet[];
  } catch {
    return seedResults[year] || [];
  }
}

export async function getAllResultsByYear(): Promise<Record<number, ResultSet[]>> {
  const years = await getResultYears();
  const entries = await Promise.all(
    years.map(async (year) => [year, await getResultsByYear(year)] as const),
  );
  return Object.fromEntries(entries);
}
