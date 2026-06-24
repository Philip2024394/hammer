// Indicative FX rates — surfaces in the UI labelled "indicative".
// Final charge is in IDR until live FX is wired.
//
// Rates last verified against XE mid-market on 2026-06-23.
// Update via the daily scheduled agent (see `routines/`) or by hand
// from https://www.xe.com/currencyconverter/ — bump FX_RATES_VERIFIED_AT
// at the same time so stale-rate banners can self-trigger if missed.
export const FX_RATES_VERIFIED_AT = "2026-06-23";

export const FX = {
  IDR: { code: "IDR", symbol: "Rp", perIDR: 1 },
  USD: { code: "USD", symbol: "$",  perIDR: 1 / 17753 },
  SGD: { code: "SGD", symbol: "S$", perIDR: 1 / 13866 },
  AUD: { code: "AUD", symbol: "A$", perIDR: 1 / 12578 },
  EUR: { code: "EUR", symbol: "€",  perIDR: 1 / 20619 },
  GBP: { code: "GBP", symbol: "£",  perIDR: 1 / 23827 },
  // SEA cross-rates used only when a Malaysian / Vietnamese visitor sees the
  // IDR-canonical SEA price converted into their local currency.
  MYR: { code: "MYR", symbol: "RM", perIDR: 1 / 4329 },
  VND: { code: "VND", symbol: "₫",  perIDR: 1 / 0.6807 }
} as const;

export type Currency = keyof typeof FX;

// Pick the Intl locale that renders the right local symbol for each
// currency. en-US picks the ISO code ("MYR 429.21") for MYR rather than
// the local symbol ("RM 429.21"); the Malaysian buyer expects RM. Same
// reasoning for the others.
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

const fmt = (currency: Currency) =>
  new Intl.NumberFormat(LOCALE_FOR_CURRENCY[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" || currency === "VND" ? 0 : 2
  });

export function formatPrice(priceIdr: number, currency: Currency): string {
  return fmt(currency).format(priceIdr * FX[currency].perIDR);
}

// Surfaces where a product carries no listed price (price_idr=0) should
// show this label instead of "£0.00" or "FREE". Welcome-gift cart lines
// keep saying FREE — the WELCOME GIFT marker is what distinguishes a
// deliberate freebie from a "price quoted at checkout" placeholder.
export const QUOTE_AT_CHECKOUT_LABEL = "Quoted at checkout";

export function formatPriceOrQuote(priceIdr: number, currency: Currency): string {
  if (priceIdr === 0) return QUOTE_AT_CHECKOUT_LABEL;
  return formatPrice(priceIdr, currency);
}

// Region-gated price visibility. Owner rule (2026-06-23): numeric prices are
// shown ONLY to Indonesia, Malaysia, Vietnam visitors. Everyone else sees
// the "Quoted at checkout" label and goes through the quote-request form
// regardless of whether the product carries a price or not.
const PRICE_VISIBLE_COUNTRIES = new Set(["ID", "MY", "VN"]);

export function shouldShowPrice(country: string | null | undefined): boolean {
  if (!country) return false;
  return PRICE_VISIBLE_COUNTRIES.has(country.toUpperCase());
}

// Use this anywhere a price would be rendered to the customer. Pass the
// visitor's country code (from `hx_country` cookie / Vercel header / CF
// header). Returns either the formatted price (SEA visitor) or the
// "Quoted at checkout" label (everyone else).
//
// For ID/MY/VN visitors the displayed currency is ALWAYS forced to their
// local currency (IDR / MYR / VND), regardless of the product's stored
// `base_currency`. The `fallbackCurrency` arg is the currency the page
// would have used pre-region-gating — only used as a courtesy when the
// helper is invoked outside SEA (where it's never reached, since
// shouldShowPrice gates first).
export function formatPriceForRegion(
  priceIdr: number,
  fallbackCurrency: Currency,
  country: string | null | undefined
): string {
  if (!shouldShowPrice(country)) return QUOTE_AT_CHECKOUT_LABEL;
  const c = (country ?? "").toUpperCase();
  const regionCurrency: Currency =
    c === "ID" ? "IDR" :
    c === "MY" ? "MYR" :
    c === "VN" ? "VND" : fallbackCurrency;
  return formatPriceOrQuote(priceIdr, regionCurrency);
}

export const CURRENCIES = Object.keys(FX) as Currency[];

// Country / region flag emoji for each currency. Rendered to the LEFT of
// the currency code in the selector so the buyer can read flag-then-code.
export const CURRENCY_FLAGS: Record<Currency, string> = {
  IDR: "\u{1F1EE}\u{1F1E9}",  // 🇮🇩
  USD: "\u{1F1FA}\u{1F1F8}",  // 🇺🇸
  SGD: "\u{1F1F8}\u{1F1EC}",  // 🇸🇬
  AUD: "\u{1F1E6}\u{1F1FA}",  // 🇦🇺
  EUR: "\u{1F1EA}\u{1F1FA}",  // 🇪🇺
  GBP: "\u{1F1EC}\u{1F1E7}",  // 🇬🇧
  MYR: "\u{1F1F2}\u{1F1FE}",  // 🇲🇾
  VND: "\u{1F1FB}\u{1F1F3}"   // 🇻🇳
};
