// Single source of truth for the flat shipping policy. £20 GBP per order
// for the three priority lanes (UK, USA, Australia); other destinations
// are confirmed on WhatsApp after the order goes through. Hammerex absorbs
// the gap between £20 and the real EMS Air Mail rate (£38–£76 per kg
// band) via product margin on those three lanes. Update in one place when
// policy changes — every UI surface reads from here.

// Two-tier shipping for UK / USA / Australia. The £30 minimum is the
// checkout floor — below this the cart can't proceed. £30-£49 carts pay
// a £28 subsidised rate (Hammerex absorbs the £10 gap to the real EMS
// cost). £50+ carts pay the £20 flat marketing rate (Hammerex absorbs
// the £18 gap to the real EMS cost). The progress bar in the cart shows
// both milestones so buyers can see how a few more items unlock cheaper
// shipping.

export const MIN_ORDER_IDR = 600000;            // £30.00 — checkout floor
export const MIN_ORDER_LABEL_GBP = "£30.00";

export const TIER_1_SHIPPING_IDR = 560000;      // £28.00 — small-parcel rate
export const TIER_1_SHIPPING_LABEL_GBP = "£28.00";

export const TIER_2_THRESHOLD_IDR = 1000000;    // £50.00 — flat-rate unlock
export const TIER_2_THRESHOLD_LABEL_GBP = "£50.00";

export const FLAT_SHIPPING_IDR = 400000;        // £20.00 — flat marketing rate
export const FLAT_SHIPPING_LABEL_GBP = "£20.00";

export const FLAT_SHIPPING_REGIONS = "UK · USA · Australia";

// Returns the shipping fee (IDR) for the given cart subtotal. Returns 0
// when the cart is below the £30 minimum so callers can branch on that
// to disable checkout. UI text should never present "0 shipping" as
// "free" — it means the order is not yet eligible to ship.
export function shippingForSubtotal(subtotalIdr: number): number {
  if (subtotalIdr < MIN_ORDER_IDR) return 0;
  if (subtotalIdr < TIER_2_THRESHOLD_IDR) return TIER_1_SHIPPING_IDR;
  return FLAT_SHIPPING_IDR;
}

export const FLAT_SHIPPING_DESCRIPTION =
  "£30 minimum order. £28 shipping on £30–£49 orders, £20 flat once you reach £50. " +
  "Dispatched via EMS Air Mail — 3 working-day dispatch, 5–6 days transit to UK, " +
  "USA and Australia. Shipping to other countries is confirmed on WhatsApp after checkout.";
