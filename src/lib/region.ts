// SEA pricing region. Indonesia, Malaysia, Vietnam visitors see the
// `price_idr_sea` column instead of the UK/RoW `price_idr`, with the
// `free_shipping_sea` toggle overriding the UK shipping flag. Malaysian and
// Vietnamese visitors get the IDR price FX-converted into MYR / VND by the
// existing currency selector; Indonesian visitors see it natively as Rp.
//
// Stripe checkout is also disabled for SEA visitors — they always WhatsApp.

import type { HammerexProduct, HammerexProductVariant, HammerexProductDeal } from "./supabase";

export const SEA_COUNTRIES = new Set(["ID", "MY", "VN"]);

export function isSeaCountry(country: string | null | undefined): boolean {
  if (!country) return false;
  return SEA_COUNTRIES.has(country.toUpperCase());
}

// Returns a new product object with the SEA-facing pricing applied, leaving
// the original untouched. Non-SEA visitors get the input back unchanged.
export function applyRegionPricing<T extends Pick<HammerexProduct, "price_idr" | "shipping_per_unit_idr"> & { price_idr_sea?: number; free_shipping_sea?: boolean }>(
  product: T,
  country: string | null | undefined
): T {
  if (!isSeaCountry(country)) return product;
  const seaPrice = product.price_idr_sea ?? 0;
  const freeSea = product.free_shipping_sea === true;
  return {
    ...product,
    price_idr: seaPrice,
    shipping_per_unit_idr: freeSea ? 0 : product.shipping_per_unit_idr
  };
}

// Variant SEA fallback: variant.price_idr_sea overrides parent's SEA price.
// `0` on the variant means "no override — use parent SEA price".
export function applyRegionPricingToVariant(
  variant: HammerexProductVariant & { price_idr_sea?: number },
  parentSeaPrice: number,
  country: string | null | undefined
): HammerexProductVariant {
  if (!isSeaCountry(country)) return variant;
  const own = variant.price_idr_sea ?? 0;
  return { ...variant, price_idr: own > 0 ? own : parentSeaPrice };
}

// Multi-buy deals are stored as absolute IDR totals computed from the base
// price. For SEA visitors we recompute them off the SEA base so the
// percentage discounts stay aligned. If SEA base is 0 ("Quoted at checkout")
// we set the deal totals to 0 as well — the existing formatter will surface
// the quote label.
export function applyRegionPricingToDeals(
  deals: HammerexProductDeal[],
  rowPriceIdr: number,
  seaPriceIdr: number,
  country: string | null | undefined
): HammerexProductDeal[] {
  if (!isSeaCountry(country)) return deals;
  if (rowPriceIdr <= 0) return deals.map((d) => ({ ...d, price_idr: 0 }));
  if (seaPriceIdr <= 0) return deals.map((d) => ({ ...d, price_idr: 0 }));
  const scale = seaPriceIdr / rowPriceIdr;
  return deals.map((d) => ({ ...d, price_idr: Math.round(d.price_idr * scale) }));
}
