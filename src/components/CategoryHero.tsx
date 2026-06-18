import type { HammerexCategory } from "@/lib/supabase";
import { CategoryIcon } from "./CategoryIcon";
import { imageUrl } from "@/lib/imageUrl";

// Per-category hero banner shown at the top of /c/[slug]. If the category
// has an image_url set in the DB, it's used as a full-bleed background
// (object-cover, dark gradient overlay so the title stays legible). If
// not, we render a clean black banner with the brand-accent icon and a
// big trade name — so every category still looks intentional even before
// custom artwork is uploaded.
export function CategoryHero({ category, productCount }: { category: HammerexCategory; productCount: number }) {
  const hasImage = Boolean(category.image_url);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[16/6]">
        {hasImage && category.image_url && (
          <>
            <img
              src={imageUrl(category.image_url, 1600) ?? category.image_url}
              srcSet={`${imageUrl(category.image_url, 800) ?? category.image_url} 800w, ${imageUrl(category.image_url, 1280) ?? category.image_url} 1280w, ${imageUrl(category.image_url, 1600) ?? category.image_url} 1600w`}
              sizes="100vw"
              alt={category.name}
              width="1600"
              height="600"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25" />
          </>
        )}

        <div className="relative z-10 flex h-full flex-col items-start justify-end gap-2 px-4 pb-5 sm:px-6 sm:pb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-accent">
            <span className="grid h-4 w-4 place-items-center">
              <CategoryIcon slug={category.slug} />
            </span>
            Hammerex Trade
          </span>
          <h1 className="text-3xl font-bold uppercase tracking-wide text-brand-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl">
            {category.name}
          </h1>
          <p className="text-xs text-brand-muted sm:text-sm">
            {productCount === 0
              ? "No products listed yet — check back soon."
              : `${productCount} product${productCount === 1 ? "" : "s"} for ${category.name.toLowerCase()}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
