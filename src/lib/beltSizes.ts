// Per-product belt sizing config. Keyed by product slug so we don't need a
// schema column until a second product needs it. When that happens, promote
// these fields onto `hammerex_products` (belt_sizes text[], belt_size_guide_url text)
// and read them from the product row instead.
export type BeltSizingConfig = {
  sizes: string[];
  guideUrl: string;
};

const STANDARD_BELT_WAIST_SIZES = ["30\"", "32\"", "34\"", "36\"", "38\"", "40\"", "42\"", "44\"", "46\"", "48\""];
const STANDARD_BELT_GUIDE_URL = "https://ik.imagekit.io/9mrgsv2rp/Untitledasassassfdsdf.png?updatedAt=1781813285522";

export const BELT_SIZING_BY_SLUG: Record<string, BeltSizingConfig> = {
  "trowel-leg-pouch": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "electrician-pro-pouch": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  // Every scaffolding belt-set / wearable belt gets the same waist-size
  // picker so the buyer experience is consistent across the category.
  "scaffolders-setup-kit": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "heavy-duty-leather-tool-belt": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "scaffolders-tool-belt": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "forgex-7-station-scaffolders-belt": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "leather-scaffolding-belt-tilted-ratchet-frog-holder": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "scaffolders-belt-trox": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  },
  "scaffolders-belt-tower": {
    sizes: STANDARD_BELT_WAIST_SIZES,
    guideUrl: STANDARD_BELT_GUIDE_URL
  }
};

// The active variant must opt in to belt sizing. Currently any variant whose
// label includes "belt" (case-insensitive) is treated as belt-bearing.
export function variantHasBelt(variantLabel: string | null | undefined): boolean {
  if (!variantLabel) return false;
  return /belt/i.test(variantLabel);
}

export function beltSizingFor(slug: string | null | undefined): BeltSizingConfig | null {
  if (!slug) return null;
  return BELT_SIZING_BY_SLUG[slug] ?? null;
}
