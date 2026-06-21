// Per-product belt-upgrade config. Used on scaffolding belt sets to let the
// buyer swap the standard belt for one of the alternative belts in the
// Hammerex belts catalogue. Keyed by product slug so we don't need a new
// schema column until 3+ products share the same config shape.
//
// Prices are placeholders (0) for the four catalogue belts at the moment —
// owner to set commercial prices after review. The renderer hides the price
// chip when priceIdr === 0, so a "Free / TBC" badge stands in.
//
// The 2" Heavy Duty Leather Work Belt is NOT listed here — it's the belt
// that ships included with the scaffolding sets, so offering it as an
// upgrade would be a no-op.
//
// imageUrl is optional — the section renders an "Image coming soon"
// placeholder until artwork is supplied.

export type BeltUpgradeOptionId =
  | "lanyard-safety-belt"
  | "fast-clip-work-belt"
  | "4-inch-belt-support"
  | "padded-belt-support-system";

export type BeltUpgradeOption = {
  id: BeltUpgradeOptionId;
  label: string;
  oneLine: string;
  priceIdr: number;
  imageUrl?: string | null;
  // Tailwind background class applied to the image tile (and the modal hero).
  // Defaults to bg-black in the renderer; use bg-white when the artwork
  // looks better on a light tile.
  tileBgClass?: string;
  details: {
    heading: string;
    paragraphs: string[];
    bullets: string[];
  };
};

export type BeltUpgradeConfig = {
  // Heading shown above the option cards.
  title: string;
  // Body line under the heading. Reminds the buyer the included belt is fine
  // by default — these are paid swaps, not requirements.
  subtitle: string;
  options: BeltUpgradeOption[];
};

const LANYARD_SAFETY: BeltUpgradeOption = {
  id: "lanyard-safety-belt",
  label: "Heavy Duty Lanyard Safety Belt",
  oneLine: "2\" leather belt with 4 sliding D-ring stations — each takes up to 5 tool lanyards.",
  // £10.00 × 23,827 ≈ 238,270 → floor to nearest 100
  priceIdr: 238200,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_29_23%20AM.png?updatedAt=1782012584919",
  details: {
    heading: "Heavy Duty Lanyard Safety Belt — 4 sliding D-ring stations",
    paragraphs: [
      "Swap the standard belt in this set for the Hammerex Lanyard Safety Belt — heavy-duty 2\" leather, reinforced riveted assembly, with four steel D-ring lanyard stations strategically positioned around the belt. Built for tradespeople working at height.",
      "The D-ring stations slide left or right when not in use, so tool pouches and holders still slide freely along the belt. Each station supports up to five heavy-duty lanyards — enough to tether a full kit when working on scaffolding, structural steel, or elevated platforms."
    ],
    bullets: [
      "Heavy-duty 2\" wide leather belt",
      "Reinforced riveted construction",
      "4 sliding steel D-ring lanyard stations",
      "Up to 5 lanyards per station",
      "Stations push aside so pouches still slide along the belt",
      "Replaces the standard belt — same buckle hardware fits"
    ]
  }
};

const FAST_CLIP: BeltUpgradeOption = {
  id: "fast-clip-work-belt",
  label: "Fast Clip Work Belt",
  oneLine: "38mm nylon webbing, adjustable 120cm, quick-release buckle — on/off in seconds.",
  // £7.80 × 23,827 ≈ 185,850 → floor to nearest 100
  priceIdr: 185800,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_41_38%20AM.png?updatedAt=1782013316972",
  details: {
    heading: "Fast Clip Work Belt — quick-release nylon",
    paragraphs: [
      "Swap the standard belt for our Hammerex Fast Clip Work Belt — 38mm heavy-duty nylon webbing with a premium quick-release buckle. Fitted, removed, adjusted and secured in seconds. Built for trades that need to drop the belt fast between tasks (lift access, height equipment changes, breaks).",
      "Buckle can sit at the front or rear of the waist — wear it at the back to keep tool pouches unobstructed around the front. Fully adjustable to 120cm so no waist measurement is needed at checkout."
    ],
    bullets: [
      "Heavy-duty 38mm (3.8cm) nylon webbing",
      "Quick-release fast-clip buckle, one-handed open/close",
      "Adjustable length up to 120cm — fits all listed waist sizes",
      "Buckle can be positioned at front or rear of belt",
      "Wipe-clean, dries fast after wet shifts",
      "Replaces the standard belt — same fit on the included pouches"
    ]
  }
};

const FOUR_INCH_SUPPORT: BeltUpgradeOption = {
  id: "4-inch-belt-support",
  label: "4\" Heavy Duty Belt Support",
  oneLine: "Wide 4\" back support, 2\" front lips — distributes heavy tool loads across the waist.",
  // £14.99 × 23,827 ≈ 357,166 → floor to nearest 100
  priceIdr: 357100,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2021,%202026,%2010_02_54%20AM.png?updatedAt=1782011049952",
  details: {
    heading: "4\" Heavy Duty Belt Support — wider load distribution",
    paragraphs: [
      "Swap the standard belt for the Hammerex 4\" Belt Support — built for tradespeople carrying heavier tool loads who need more stability than a standard work belt provides. The wide 4\" back section spreads weight evenly across the waist, reducing pressure points and twist over long shifts.",
      "Transitions to 2\" front support lips so it stays compatible with all the standard pouches and holders included in this set — heavier carrying capacity without losing kit compatibility."
    ],
    bullets: [
      "4\" back-support body, 2\" front lips",
      "Larger mounting surface for multi-hole tool holders",
      "Premium heavy-duty leather, double stitched",
      "Reinforced with heavy-duty rivets",
      "Reduces belt roll + sag under heavy loads",
      "Replaces the standard belt — front lips fit the included pouches"
    ]
  }
};

const PADDED_SUPPORT: BeltUpgradeOption = {
  id: "padded-belt-support-system",
  label: "Padded Belt Support System",
  oneLine: "5\" padded back support + 2\" work belt — all-day comfort under heavy loads.",
  // £19.40 × 23,827 ≈ 462,243 → floor to nearest 100
  priceIdr: 462200,
  imageUrl: "https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxcxzcxzxcsdsdasdasd.png?updatedAt=1782011026288",
  details: {
    heading: "Padded Belt Support System — 5\" padded back support",
    paragraphs: [
      "Swap the standard belt for the full Hammerex Padded Belt Support System — heavy-duty 2\" work belt with a 5\" padded back support section that extends into the sides where you need it most. Built for tradespeople on long shifts carrying a fully loaded kit.",
      "Distributes weight evenly across the waist and lower back, cutting fatigue across the day. Reinforced construction, heavy-duty stitching, rugged hardware — designed to take demanding site conditions while staying comfortable enough for everyday wear."
    ],
    bullets: [
      "5\" padded back support, wraps into the sides",
      "Heavy-duty 2\" work belt included",
      "Distributes weight across waist + lower back",
      "Reinforced construction, heavy-duty stitching",
      "All-day comfort under heavy tool loads",
      "Replaces the standard belt + adds the padded support"
    ]
  }
};

const ALL_BELTS: BeltUpgradeOption[] = [
  LANYARD_SAFETY,
  FAST_CLIP,
  FOUR_INCH_SUPPORT,
  PADDED_SUPPORT
];

const SUBTITLE_SET =
  "Keep the standard 2\" belt that ships with this set, or swap it for one of the belts below. Each replaces — not adds to — the included belt.";
const SUBTITLE_SINGLE =
  "Keep the standard 2\" belt that ships with this product, or swap it for one of the belts below. Each replaces — not adds to — the included belt.";

export const BELT_UPGRADE_BY_SLUG: Record<string, BeltUpgradeConfig> = {
  "heavy-duty-leather-tool-belt": {
    title: "Upgrade your belt",
    subtitle: SUBTITLE_SET,
    options: ALL_BELTS
  },
  "scaffolders-setup-kit": {
    title: "Upgrade your belt",
    subtitle: SUBTITLE_SET,
    options: ALL_BELTS
  },
  "scaffolders-tool-belt": {
    title: "Upgrade your belt",
    subtitle: SUBTITLE_SINGLE,
    options: ALL_BELTS
  },
  "forgex-7-station-scaffolders-belt": {
    title: "Upgrade your belt",
    subtitle: SUBTITLE_SINGLE,
    options: ALL_BELTS
  },
  "leather-scaffolding-belt-tilted-ratchet-frog-holder": {
    title: "Upgrade your belt",
    subtitle: SUBTITLE_SINGLE,
    options: ALL_BELTS
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
