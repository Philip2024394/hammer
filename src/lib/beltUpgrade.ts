// Per-product belt-upgrade config. Used on scaffolding belt sets to let the
// buyer swap the standard belt for a leather-with-lanyard-rings option or a
// fast-buckle-release nylon option. Keyed by product slug so we don't need a
// new schema column until 3+ products share the same config shape.
//
// Prices computed at the canonical 23,827 IDR/£ FX. Update if the rate moves.
//
// imageUrl is optional — the section renders a "Image coming soon" placeholder
// until artwork is supplied. Owner can drop the ImageKit URL in here without
// touching the React side.

export type BeltUpgradeOptionId = "lanyard-leather" | "fast-clip-nylon";

export type BeltUpgradeOption = {
  id: BeltUpgradeOptionId;
  label: string;
  oneLine: string;
  priceIdr: number;
  imageUrl?: string | null;
  // Tailwind background class applied to the image tile (and the modal hero).
  // Defaults to bg-black in the renderer; use bg-white when the artwork
  // looks better on a light tile (e.g. the nylon belt photo).
  tileBgClass?: string;
  details: {
    heading: string;
    paragraphs: string[];
    bullets: string[];
  };
};

export type BeltUpgradeConfig = {
  // Heading shown above the two option cards.
  title: string;
  // Body line under the heading. Reminds the buyer the included belt is fine
  // by default — these are paid swaps, not requirements.
  subtitle: string;
  options: BeltUpgradeOption[];
};

const LANYARD_LEATHER: BeltUpgradeOption = {
  id: "lanyard-leather",
  label: "Lanyard Leather Belt",
  oneLine: "Leather belt with 4 lanyard hook rings — riveted and under-stitched.",
  // £14.99 × 23,827 = 357,167 → round to 357,100 for clean display
  priceIdr: 357100,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2008_12_04%20AM.png",
  details: {
    heading: "Lanyard Leather Belt — 4 riveted, under-stitched hook rings",
    paragraphs: [
      "Swap the standard belt in this set for the Hammerex lanyard leather belt — full-grain leather with four reinforced lanyard hook rings riveted through the belt body and then under-stitched for double-lock retention. Built for working at height where every tool needs a tether.",
      "Hook rings sit flat against the belt when unloaded so they don't bite into your hip during normal site work, and rotate up to receive a tool lanyard the moment you clip on."
    ],
    bullets: [
      "Full-grain leather body, industrially sewn",
      "4 stainless hook rings — riveted and under-stitched for double-lock retention",
      "Soft-close button belt loop, fits most work belts",
      "Replaces the standard belt — same buckle hardware fits"
    ]
  }
};

const FAST_CLIP_NYLON: BeltUpgradeOption = {
  id: "fast-clip-nylon",
  label: "Fast-Clip Release Nylon Belt",
  oneLine: "One-size nylon belt (120 cm × 3.8 cm) with quick-release buckle — on / off in seconds.",
  // £6.80 × 23,827 = 162,024 → round to 162,000
  priceIdr: 162000,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2008_30_41%20AM.png",
  tileBgClass: "bg-white",
  details: {
    heading: "Fast-Clip Release Nylon Belt — quick on/off buckle",
    paragraphs: [
      "Swap the standard belt for our heavy-duty nylon belt with a fast-clip release buckle. One-handed on / off — engineered for trades that need to drop the belt fast between tasks (lift access, height-equipment changes, breaks).",
      "Standard one-size belt — adjustable on the fly via the clip, so no waist measurement is needed at checkout. Resists abrasion, moisture and concrete dust better than leather in wet pours and scaffold environments."
    ],
    bullets: [
      "Standard one-size: 120 cm × 3.8 cm — fits all listed waist sizes",
      "Heavy-duty nylon webbing",
      "Fast-clip release buckle — one-handed open / close",
      "Wipe-clean, dries fast after a wet shift",
      "Replaces the standard belt — same fit on the included pouches"
    ]
  }
};

export const BELT_UPGRADE_BY_SLUG: Record<string, BeltUpgradeConfig> = {
  "heavy-duty-leather-tool-belt": {
    title: "Upgrade your belt",
    subtitle: "Keep the standard belt that ships with this set, or swap it for one of the two upgrade belts below. Each replaces — not adds to — the included belt.",
    options: [LANYARD_LEATHER, FAST_CLIP_NYLON]
  },
  "scaffolders-setup-kit": {
    title: "Upgrade your belt",
    subtitle: "Keep the standard belt that ships with this set, or swap it for one of the two upgrade belts below. Each replaces — not adds to — the included belt.",
    options: [LANYARD_LEATHER, FAST_CLIP_NYLON]
  }
};

export function beltUpgradeFor(slug: string | null | undefined): BeltUpgradeConfig | null {
  if (!slug) return null;
  return BELT_UPGRADE_BY_SLUG[slug] ?? null;
}

export function beltUpgradePrice(
  config: BeltUpgradeConfig | null,
  selected: BeltUpgradeOptionId | null
): number {
  if (!config || !selected) return 0;
  const opt = config.options.find((o) => o.id === selected);
  return opt?.priceIdr ?? 0;
}

export function beltUpgradeLabel(
  config: BeltUpgradeConfig | null,
  selected: BeltUpgradeOptionId | null
): string | null {
  if (!config || !selected) return null;
  return config.options.find((o) => o.id === selected)?.label ?? null;
}
