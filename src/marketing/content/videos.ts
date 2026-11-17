import { toFeaturedVideo, type FeaturedVideo } from "@/marketing/lib/youtube";

const seed = [
  {
    title: "Promo Lambda",
    youtubeUrl: "https://youtube.com/shorts/JdgUdPQvbK8",
  },
];

export const seedVideos: FeaturedVideo[] = seed.flatMap((video) => {
  const mapped = toFeaturedVideo(video.title, video.youtubeUrl);
  return mapped ? [mapped] : [];
});
