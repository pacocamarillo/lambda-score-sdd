export type FeaturedVideo = {
  title: string;
  youtubeUrl: string;
  embedUrl: string;
  short: boolean;
};

/** Accepts watch, share, shorts and embed URLs. */
export function toFeaturedVideo(
  title: string,
  youtubeUrl: string,
): FeaturedVideo | null {
  const id = extractYoutubeId(youtubeUrl);
  if (!id) return null;
  const short = /shorts\//i.test(youtubeUrl);
  return {
    title,
    youtubeUrl,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    short,
  };
}

function extractYoutubeId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
    if (shorts) return shorts[1];
    const embed = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embed) return embed[1];
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}
