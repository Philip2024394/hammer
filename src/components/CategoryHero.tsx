import type { HammerexCategory } from "@/lib/supabase";
import { imageUrl } from "@/lib/imageUrl";

// Per-category hero banner shown at the top of /c/[slug]. The image (when set)
// is rendered uncluttered — no badge, no gradient, no overlay text. The trade
// title + product count sit BELOW the image so the hero artwork is fully
// visible. Categories without an image_url just skip the image block.
export function CategoryHero({ category, productCount }: { category: HammerexCategory; productCount: number }) {
  const hasImage = Boolean(category.image_url);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      {hasImage && category.image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[16/6]">
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
        </div>
      )}

      <div className="mt-4 flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-brand-text sm:text-5xl">
          {category.name}
        </h1>
        <p className="text-xs text-brand-muted sm:text-sm">
          {productCount === 0
            ? "No products listed yet — check back soon."
            : `${productCount} product${productCount === 1 ? "" : "s"} for ${category.name.toLowerCase()}.`}
        </p>
      </div>
    </section>
  );
}
