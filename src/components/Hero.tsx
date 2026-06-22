"use client";

import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/imageUrl";

const HERO_SRCS = [
  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2009_05_41%20AM.png"
];

const ROTATE_MS = 5500;

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (HERO_SRCS.length <= 1) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % HERO_SRCS.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    // Banner sits inside the standard max-w-6xl container with px-4 gutters
    // so it visually aligns with every other section below it. aspect-[2/1]
    // matches the source banner's native 1600×800 dimensions so object-cover
    // doesn't crop anything off the sides.
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl bg-black">
          {HERO_SRCS.map((src, i) => (
            <img
              key={src}
              src={imageUrl(src, 1600) ?? src}
              srcSet={`${imageUrl(src, 800) ?? src} 800w, ${imageUrl(src, 1280) ?? src} 1280w, ${imageUrl(src, 1600) ?? src} 1600w`}
              sizes="100vw"
              alt={i === 0 ? "Hammerex — built for everyday utility" : ""}
              width="1600"
              height="800"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              aria-hidden={i === index ? undefined : true}
              style={{ transformOrigin: "center center" }}
              // IMPORTANT: object-cover (NOT contain). Source images aren't a
              // uniform 16:9 — some are taller. object-contain would scale
              // them down to fit the box height and centre them, leaving
              // visible side bars on portrait-leaning images so the hero
              // looks "narrow" on mobile. object-cover guarantees the image
              // fills the full container width on every breakpoint, even if
              // it has to crop a little top/bottom. Do not revert.
              //
              // object-center (default) is made explicit so any Ken-Burns
              // overshoot stays equal both sides and the image never appears
              // shifted off-screen to the left.
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                i === index ? "opacity-100 hx-kenburns" : "opacity-0"
              }`}
            />
          ))}

          {HERO_SRCS.length > 1 && (
            <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 sm:bottom-4 sm:left-4">
              {HERO_SRCS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-brand-accent" : "w-4 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}

          <div
            className="hammerex-marquee-mask pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden border-t border-brand-accent/40 bg-black/65 py-2 backdrop-blur-sm"
            aria-label="Hammerex welcome message"
          >
            <span
              className="hammerex-marquee-track px-4 text-[11px] font-semibold uppercase tracking-wider text-brand-accent sm:text-xs"
              style={{ animationDuration: "60s" }}
            >
              ⚒ Welcome to Hammerex Direct &nbsp;·&nbsp; Our team is on standby 7 days a week, 9 am – 9 pm Indonesia time &nbsp;·&nbsp; Questions, orders or delivery — we're here to help &nbsp;·&nbsp; Glad you stopped by &nbsp;·&nbsp; ⚒ Welcome to Hammerex Direct &nbsp;·&nbsp; Our team is on standby 7 days a week, 9 am – 9 pm Indonesia time &nbsp;·&nbsp; Questions, orders or delivery — we're here to help &nbsp;·&nbsp; Glad you stopped by &nbsp;·&nbsp;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
