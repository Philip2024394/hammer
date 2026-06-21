// Per-product 3-Year Pro Repair Cover config. Slug-keyed for the same
// reason as customBranding / beltSizes — promote to a schema column once
// 3+ products carry it. The buyer pays inbound + outbound postage on any
// claim; Hammerex pays only the repair labour + materials, so the cover
// stays margin-positive at any claim rate.

export type RepairCoverConfig = {
  priceIdr: number;
};

// £15 = 15 × 23,827 IDR — same flat price across the scaffolding belt
// range; the parts that wear (stitching, rivets, buckles, slider, leather
// conditioning) are the same physical work whatever belt we cover.
const SCAFFOLDING_BELT_COVER: RepairCoverConfig = { priceIdr: 357405 };

export const REPAIR_COVER_BY_SLUG: Record<string, RepairCoverConfig> = {
  "scaffolders-setup-kit": SCAFFOLDING_BELT_COVER,
  "heavy-duty-leather-tool-belt": SCAFFOLDING_BELT_COVER,
  "scaffolders-tool-belt": SCAFFOLDING_BELT_COVER,
  "forgex-7-station-scaffolders-belt": SCAFFOLDING_BELT_COVER,
  "leather-scaffolding-belt-tilted-ratchet-frog-holder": SCAFFOLDING_BELT_COVER
};

export function repairCoverFor(slug: string | null | undefined): RepairCoverConfig | null {
  if (!slug) return null;
  return REPAIR_COVER_BY_SLUG[slug] ?? null;
}
