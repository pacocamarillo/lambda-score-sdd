import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
