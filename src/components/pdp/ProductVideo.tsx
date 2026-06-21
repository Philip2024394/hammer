"use client";

import { useState } from "react";

// Per-product YouTube embed block. Renders only when product.video_url
// is set. Extracts the YouTube video ID from any of:
//   - https://www.youtube.com/watch?v=ID
//   - https://youtu.be/ID
//   - https://youtube.com/shorts/ID
//   - https://www.youtube.com/embed/ID
// Falls back to a plain link if the URL isn't YouTube.
//
// When a coverUrl is provided, the block renders as a click-to-play
// facade: the cover image with the canonical red YouTube play button
// overlaid. Tapping it swaps in the iframe with autoplay=1. This keeps
// the PDP light (no iframe until the user opts in) and lets us brand
// the poster instead of relying on YouTube's auto-generated thumbnail.

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function YouTubePlayBadge() {
  // Canonical YouTube play badge: red rounded rectangle, white triangle.
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none grid h-16 w-24 place-items-center rounded-2xl bg-[#FF0000] shadow-[0_6px_24px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-105"
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export function ProductVideo({
  url,
  title,
  coverUrl
}: {
  url: string;
  title: string;
  coverUrl?: string | null;
}) {
  const id = extractYouTubeId(url);
  const [playing, setPlaying] = useState(false);

  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-accent hover:border-brand-accent"
      >
        ▶ Watch product video
      </a>
    );
  }

  const embed = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
  const showFacade = !!coverUrl && !playing;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex items-center gap-2 pb-3">
        <span aria-hidden="true" className="grid h-6 w-9 place-items-center rounded-md bg-[#FF0000] text-white">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Watch — {title}
        </h2>
      </div>
      <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-brand-line bg-black">
        {showFacade ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title} video`}
            className="group relative block h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl!}
              alt={`${title} — video cover`}
              className="absolute inset-0 h-full w-full object-contain"
              loading="lazy"
            />
            <span className="absolute inset-0 grid place-items-center">
              <YouTubePlayBadge />
            </span>
          </button>
        ) : (
          <iframe
            src={embed}
            title={`${title} — product video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        )}
      </div>
    </section>
  );
}
