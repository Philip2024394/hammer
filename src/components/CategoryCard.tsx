import type { HammerexCategory } from "@/lib/supabase";
import { CategoryIcon } from "./CategoryIcon";
import { imageUrl } from "@/lib/imageUrl";

// Shared category-card tile used by both CategoryGrid (View Your Trade)
// and ToolTypesGrid (Shop by Tool Type). Three render modes:
//   - no card_image_url            → brand-accent SVG icon + name below
//   - card_image_url, no label     → image object-contain with 12px pad
//   - card_image_url + show_label  → image object-cover edge-to-edge,
//                                    bottom gradient + overlay name
export function CategoryCard({ category }: { category: HammerexCategory }) {
  const c = category;
  return (
    <li className="group relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 -bottom-2 h-6 rounded-full bg-brand-accent/0 blur-2xl transition-all duration-300 group-hover:bg-brand-accent/55"
      />
      <a
        href={`/c/${c.slug}`}
        className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface p-4 transition-colors duration-200 group-hover:border-brand-accent sm:gap-3 sm:p-6"
      >
        {c.card_image_url ? (
          <>
            <img
              src={imageUrl(c.card_image_url, 480) ?? c.card_image_url}
              srcSet={`${imageUrl(c.card_image_url, 240) ?? c.card_image_url} 240w, ${imageUrl(c.card_image_url, 360) ?? c.card_image_url} 360w, ${imageUrl(c.card_image_url, 480) ?? c.card_image_url} 480w`}
              sizes="(min-width: 1024px) 240px, 33vw"
              alt={c.name}
              loading="lazy"
              decoding="async"
              className={
                c.card_show_label
                  ? "absolute inset-0 h-full w-full object-contain"
                  : "absolute inset-0 h-full w-full object-contain p-3"
              }
            />
            {c.card_show_label && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-3 z-10 text-center text-xs font-bold uppercase tracking-widest text-brand-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-sm">
                  {c.name}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <span className="text-brand-accent">
              <CategoryIcon slug={c.slug} />
            </span>
            <span className="line-clamp-2 text-center text-xs font-bold uppercase tracking-wider text-brand-text sm:text-sm">
              {c.name}
            </span>
          </>
        )}
      </a>
    </li>
  );
}
