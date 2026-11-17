"use client";

import { useCallback, useEffect, useState } from "react";
import { usePreferences } from "@/marketing/components/preferences";
import type { FeaturedVideo } from "@/marketing/lib/youtube";

export function VideoCarousel({ videos }: { videos: FeaturedVideo[] }) {
  const { t } = usePreferences();
  const [index, setIndex] = useState(0);
  const total = videos.length;
  const current = videos[index];

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (total <= 1) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  if (!current) return null;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription={t("videos.region")}
      aria-label={t("videos.label")}
    >
      <div
        className={`overflow-hidden bg-[color:var(--bg-deep)] ${
          current.short
            ? "mx-auto aspect-[9/16] max-h-[70vh] w-full max-w-sm"
            : "aspect-video"
        }`}
      >
        <iframe
          key={current.embedUrl}
          title={current.title}
          src={current.embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="display text-xl sm:text-2xl">{current.title}</p>
        {total > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="carousel-nav"
              aria-label={t("videos.prev")}
              onClick={prev}
            >
              ‹
            </button>
            <span className="muted min-w-[3.5rem] text-center text-sm tabular-nums">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              className="carousel-nav"
              aria-label={t("videos.next")}
              onClick={next}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {total > 1 ? (
        <div
          className="mt-3 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label={t("videos.dots")}
        >
          {videos.map((video, i) => (
            <button
              key={`${video.title}-${video.embedUrl}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${t("videos.goTo")} ${video.title}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index
                  ? "bg-[color:var(--brand-deep)]"
                  : "bg-[color:var(--line)] hover:bg-[color:var(--muted)]"
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}

      <p className="muted mt-3 text-sm">
        {t("videos.fallback")}
      </p>
    </div>
  );
}
