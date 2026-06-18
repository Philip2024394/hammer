// Single source of truth for the flat shipping policy. £20 GBP per order
// for the three priority lanes (UK, USA, Australia); other destinations
// are confirmed on WhatsApp after the order goes through. Hammerex absorbs
// the gap between £20 and the real EMS Air Mail rate (£38–£76 per kg
// band) via product margin on those three lanes. Update in one place when
// policy changes — every UI surface reads from here.

// Two-tier shipping for UK / USA / Australia. No minimum order — every
// cart proceeds to checkout. Below £50 pays the £28 subsidised rate;
// £50+ unlocks the £20 flat marketing rate. The progress bar shows the
// £50 milestone so buyers can see the cheaper-shipping unlock.

export const TIER_1_SHIPPING_IDR = 560000;      // £28.00 — small-parcel rate
export const TIER_1_SHIPPING_LABEL_GBP = "£28.00";

export const TIER_2_THRESHOLD_IDR = 1000000;    // £50.00 — flat-rate unlock
export const TIER_2_THRESHOLD_LABEL_GBP = "£50.00";

export const FLAT_SHIPPING_IDR = 400000;        // £20.00 — flat marketing rate
export const FLAT_SHIPPING_LABEL_GBP = "£20.00";

export const FLAT_SHIPPING_REGIONS = "UK · USA · Australia";

// Returns the shipping fee (IDR) for the given cart subtotal. Every
// non-empty cart pays at least the tier-1 rate; £50+ unlocks the £20
// flat rate.
export function shippingForSubtotal(subtotalIdr: number): number {
  if (subtotalIdr <= 0) return 0;
  if (subtotalIdr < TIER_2_THRESHOLD_IDR) return TIER_1_SHIPPING_IDR;
  return FLAT_SHIPPING_IDR;
}

// Cart-wide shipping. Lines whose product has a per-unit shipping override
// contribute `qty × shippingPerUnitIdr` directly to the shipping total.
// Lines without an override roll up into a subtotal and pay the standard
// tier-based rate. Used by both the cart and checkout pages.
export type CartLineForShipping = {
  unitPriceIdr: number;
  qty: number;
  shippingPerUnitIdr?: number | null;
};

export function shippingForCart(lines: CartLineForShipping[]): number {
  let overrideTotal = 0;
  let tierSubtotal = 0;
  for (const l of lines) {
    if (l.shippingPerUnitIdr != null) {
      overrideTotal += l.shippingPerUnitIdr * l.qty;
    } else {
      tierSubtotal += l.unitPriceIdr * l.qty;
    }
  }
  return overrideTotal + shippingForSubtotal(tierSubtotal);
}

export const FLAT_SHIPPING_DESCRIPTION =
  "£28 shipping under £50, £20 flat once you reach £50. " +
  "Dispatched via EMS Air Mail — 3 working-day dispatch, 5–6 days transit to UK, " +
  "USA and Australia. Shipping to other countries is confirmed on WhatsApp after checkout.";

// UK air-freight tariff (6-day delivery). Real per-parcel courier rates
// quoted from Indonesia → UK in IDR. Each product is assigned ONE tier
// code (A–E) at upload time; the cart shipping fee for the consignment
// is looked up by tier. Source: courier quote 2026-06-17.
//
// Tier E (>2,000 g) is currently open-ended at 1,083,000 IDR — confirm
// with the courier whether there's a heavier band above this before
// shipping any 5kg+ parcels using this rate.

export type UkAirFreightTierCode = "A" | "B" | "C" | "D" | "E";

export type UkAirFreightTier = {
  code: UkAirFreightTierCode;
  minGrams: number;
  maxGrams: number | null;   // null = open-ended (no upper bound yet)
  feeIdr: number | null;     // null = not yet quoted
  label: string;
};

export const UK_AIR_FREIGHT_TIERS: readonly UkAirFreightTier[] = [
  { code: "A", minGrams: 0,    maxGrams: 540,  feeIdr: 416_000, label: "Up to 540 g" },
  { code: "B", minGrams: 550,  maxGrams: 1040, feeIdr: 613_000, label: "550 g – 1,040 g" },
  { code: "C", minGrams: 1050, maxGrams: 1540, feeIdr: 756_000, label: "1,050 g – 1,540 g" },
  { code: "D", minGrams: 1550, maxGrams: 2000, feeIdr: 896_000, label: "1,550 g – 2,000 g" },
  { code: "E", minGrams: 2010, maxGrams: null, feeIdr: 1_083_000, label: "Over 2,000 g" }
] as const;

export const UK_AIR_FREIGHT_TRANSIT_DAYS = 6;

export function getUkAirFreightTier(code: UkAirFreightTierCode): UkAirFreightTier | undefined {
  return UK_AIR_FREIGHT_TIERS.find((t) => t.code === code);
}

// Look up the tariff bracket a single parcel falls into based on its
// total weight in grams. Tier E (>2,000 g) is currently open-ended —
// any heavier parcel falls into E until a higher band is confirmed
// with the courier.
export function ukAirFreightTierForGrams(grams: number): UkAirFreightTier {
  for (const t of UK_AIR_FREIGHT_TIERS) {
    if (t.maxGrams === null || grams <= t.maxGrams) return t;
  }
  return UK_AIR_FREIGHT_TIERS[UK_AIR_FREIGHT_TIERS.length - 1];
}
