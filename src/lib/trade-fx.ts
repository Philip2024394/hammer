// Trade-portal FX helpers.
//
// Trade prices on hammerex_products / hammerex_product_variants are stored in
// GBP (column `trade_price_gbp`). Each trade account row has its own
// preferred currency (GBP / USD / EUR / IDR by default). When a buyer views
// the catalogue we convert GBP → account currency via the canonical IDR
// rate table in `fx.ts` — so a single FX bump in one file updates retail AND
// trade displays at once.
//
// Conversion is two-hop on purpose: tradeGbp → idr → targetCurrency. That
// way the live IDR-canonical rates stay the only source of truth and the
// trade-£ figure already lines up with the retail-£ figure the same buyer
// would see on the public site.

import { FX, type Currency } from "./fx";

// Pounds-per-IDR is exposed by FX.GBP.perIDR. The reciprocal is IDR-per-GBP.
const IDR_PER_GBP = 1 / FX.GBP.perIDR;

// Convert a GBP amount to IDR (canonical). Internal helper.
function gbpToIdr(gbp: number): number {
  return gbp * IDR_PER_GBP;
}

// Convert a trade GBP price to the buyer's account currency, rounded to 2dp
// (or 0dp for IDR/VND which are whole-unit currencies). Returns the numeric
// amount only — pair with `formatTradePrice` for display.
export function gbpToAccountCurrency(
  tradePriceGbp: number,
  accountCurrency: Currency | string
): number {
  // Defensive: if the account currency is anything unrecognised, fall back
  // to GBP so we never crash a catalogue render over a typo.
  const cur = (accountCurrency in FX ? accountCurrency : "GBP") as Currency;
  if (cur === "GBP") {
    return Math.round(tradePriceGbp * 100) / 100;
  }
  const idr = gbpToIdr(tradePriceGbp);
  const raw = idr * FX[cur].perIDR;
  if (cur === "IDR" || cur === "VND") return Math.round(raw);
  return Math.round(raw * 100) / 100;
}

const LOCALE_FOR_CURRENCY: Record<Currency, string> = {
  IDR: "id-ID",
  USD: "en-US",
  SGD: "en-SG",
  AUD: "en-AU",
  EUR: "en-IE",
  GBP: "en-GB",
  MYR: "ms-MY",
  VND: "vi-VN"
};

const fmtCache = new Map<string, Intl.NumberFormat>();
function fmt(currency: Currency): Intl.NumberFormat {
  const k = currency;
  let f = fmtCache.get(k);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE_FOR_CURRENCY[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" || currency === "VND" ? 0 : 2
    });
    fmtCache.set(k, f);
  }
  return f;
}

/** Render a trade GBP price in the account's currency (£4.20 / $5.30 / etc). */
export function formatTradePrice(
  tradePriceGbp: number,
  accountCurrency: Currency | string
): string {
  const cur = (accountCurrency in FX ? accountCurrency : "GBP") as Currency;
  const amount = gbpToAccountCurrency(tradePriceGbp, cur);
  return fmt(cur).format(amount);
}

/** Render an IDR retail RRP in the account's currency. Used to display the
 *  strikethrough RRP next to the trade price. */
export function formatRrpForAccount(
  retailIdr: number,
  accountCurrency: Currency | string
): string {
  const cur = (accountCurrency in FX ? accountCurrency : "GBP") as Currency;
  const raw = retailIdr * FX[cur].perIDR;
  const amount =
    cur === "IDR" || cur === "VND"
      ? Math.round(raw)
      : Math.round(raw * 100) / 100;
  return fmt(cur).format(amount);
}

/** Margin off RRP as a positive whole percent. E.g. tradeGbp=£15, rrpIdr →
 *  £24.99 → 40. Returns null when either price is missing or RRP ≤ trade. */
export function marginOffRrp(
  tradePriceGbp: number,
  retailIdr: number
): number | null {
  if (!tradePriceGbp || tradePriceGbp <= 0) return null;
  if (!retailIdr || retailIdr <= 0) return null;
  const retailGbp = retailIdr * FX.GBP.perIDR;
  if (retailGbp <= 0 || tradePriceGbp >= retailGbp) return null;
  return Math.round(((retailGbp - tradePriceGbp) / retailGbp) * 100);
}
