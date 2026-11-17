import { groq } from "next-sanity";

export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  title,
  cardTitle,
  "slug": slug.current,
  publishedAt,
  excerpt,
  description,
  imageAlt,
  "image": image.asset->url,
  "body": pt::text(body)
}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  title,
  cardTitle,
  "slug": slug.current,
  publishedAt,
  excerpt,
  description,
  imageAlt,
  "image": image.asset->url,
  "body": pt::text(body)
}`;

export const eventsQuery = groq`*[_type == "event"] | order(startsAt asc) {
  name,
  "slug": slug.current,
  startsAt,
  place,
  imageAlt,
  "image": image.asset->url,
  registrationUrl,
  summary
}`;

export const rentalItemsQuery = groq`*[_type == "rentalItem"] | order(name asc) {
  name,
  priceFrom,
  scenario,
  pagePath
}`;

export const resultSetsByYearQuery = groq`*[_type == "resultSet" && year == $year] | order(eventDate desc) {
  year,
  eventName,
  eventDate,
  distance,
  rows[] {
    place,
    bib,
    name,
    time,
    gap,
    laps[] { index, time, place, cumulativeTime, cumulativePlace }
  }
}`;

export const resultYearsQuery = groq`array::unique(*[_type == "resultSet"].year) | order(@ desc)`;

export const videosQuery = groq`*[_type == "featuredVideo"] | order(order asc) {
  title,
  youtubeUrl
}`;

export const pageCopyQuery = groq`*[_type == "pageCopy" && key == $key][0] {
  key,
  h1,
  lead,
  seoTitle,
  seoDescription,
  blocks[] { title, body }
}`;
