// Per-product custom-branding config. Keyed by product slug so we don't need
// a schema column until 3+ products need it. Promote to a `custom_branding_option_idr`
// column on hammerex_products when that happens.

export type CustomBrandingConfig = {
  priceIdr: number;
  // Reference photo showing the logo placement on the actual product. Optional
  // until artwork is supplied — the UI hides the preview cleanly if absent.
  sampleImageUrl?: string;
};

// £10 each = 238,270 IDR at 23,827 IDR/£ — applied uniformly across every
// scaffolding belt-set / wearable belt so the buyer choice is consistent.
const SCAFFOLDING_BELT_BRANDING: CustomBrandingConfig = {
  priceIdr: 238270,
  sampleImageUrl: "https://ik.imagekit.io/9mrgsv2rp/Untitledasfdfsdfsdfasdasd.png"
};

export const CUSTOM_BRANDING_BY_SLUG: Record<string, CustomBrandingConfig> = {
  "scaffolders-setup-kit": SCAFFOLDING_BELT_BRANDING,
  "heavy-duty-leather-tool-belt": SCAFFOLDING_BELT_BRANDING,
  "scaffolders-tool-belt": SCAFFOLDING_BELT_BRANDING,
  "forgex-7-station-scaffolders-belt": SCAFFOLDING_BELT_BRANDING,
  "leather-scaffolding-belt-tilted-ratchet-frog-holder": SCAFFOLDING_BELT_BRANDING
};

export function customBrandingFor(slug: string | null | undefined): CustomBrandingConfig | null {
  if (!slug) return null;
  return CUSTOM_BRANDING_BY_SLUG[slug] ?? null;
}
