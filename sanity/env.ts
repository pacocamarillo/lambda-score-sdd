export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-01";

export function isSanityConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  return Boolean(id && id !== "placeholder" && id.length > 0);
}
