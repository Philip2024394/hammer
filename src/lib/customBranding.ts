// Per-product custom-branding config. Keyed by product slug so we don't need
// a schema column until 3+ products need it. Promote to a `custom_branding_option_idr`
// column on hammerex_products when that happens.

export type CustomBrandingConfig = {
  priceIdr: number;
  // Reference photo showing the logo placement on the actual product. Optional
  // until artwork is supplied — the UI hides the preview cleanly if absent.
  sampleImageUrl?: string;
};

export const CUSTOM_BRANDING_BY_SLUG: Record<string, CustomBrandingConfig> = {
  // £10 each = 238,270 IDR at 23,827 IDR/£
  "scaffolders-setup-kit": {
    priceIdr: 238270,
    sampleImageUrl: "https://ik.imagekit.io/9mrgsv2rp/Untitledasfdfsdfsdfasdasd.png"
  }
};

export function customBrandingFor(slug: string | null | undefined): CustomBrandingConfig | null {
  if (!slug) return null;
  return CUSTOM_BRANDING_BY_SLUG[slug] ?? null;
}
