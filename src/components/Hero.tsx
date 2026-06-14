"use client";

import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/imageUrl";

const HERO_SRCS = [
  "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/5e90c14e2eeae2ca.png",
  "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/60c25cb2b78f9c91.png",
  "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/eeb015bd361f3c57.png",
  "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/22b848b905a646c1.png",
  "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/fba957555d43988e.png?updatedAt=1781202487005"
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
    <section className="relative overflow-hidden">
      <div className="relative w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[16/9]">
          {HERO_SRCS.map((src, i) => (
            <img
              key={src}
              src={imageUrl(src, 1600) ?? src}
              srcSet={`${imageUrl(src, 800) ?? src} 800w, ${imageUrl(src, 1280) ?? src} 1280w, ${imageUrl(src, 1600) ?? src} 1600w`}
              sizes="100vw"
              alt={i === 0 ? "Hammerex — built for everyday utility" : ""}
              width="1600"
              height="900"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              aria-hidden={i === index ? undefined : true}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out ${
                i === index ? "opacity-100 hx-kenburns" : "opacity-0"
              }`}
            />
          ))}

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
        </div>
      </div>
    </section>
  );
}
