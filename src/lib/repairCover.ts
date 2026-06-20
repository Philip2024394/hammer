// Per-product 3-Year Pro Repair Cover config. Slug-keyed for the same
// reason as customBranding / beltSizes — promote to a schema column once
// 3+ products carry it. The buyer pays inbound + outbound postage on any
// claim; Hammerex pays only the repair labour + materials, so the cover
// stays margin-positive at any claim rate.

export type RepairCoverConfig = {
  priceIdr: number;
};

export const REPAIR_COVER_BY_SLUG: Record<string, RepairCoverConfig> = {
  // £15 = 15 × 23,827 IDR
  "scaffolders-setup-kit": { priceIdr: 357405 }
};

export function repairCoverFor(slug: string | null | undefined): RepairCoverConfig | null {
  if (!slug) return null;
  return REPAIR_COVER_BY_SLUG[slug] ?? null;
}
