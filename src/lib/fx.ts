// Indicative FX rates — surfaces in the UI labelled "indicative".
// Final charge is in IDR until live FX is wired.
//
// Rates last verified against XE mid-market on 2026-06-17 ~14:50 UTC.
// Update via the daily scheduled agent (see `routines/`) or by hand
// from https://www.xe.com/currencyconverter/ — bump FX_RATES_VERIFIED_AT
// at the same time so stale-rate banners can self-trigger if missed.
export const FX_RATES_VERIFIED_AT = "2026-06-17";

export const FX = {
  IDR: { code: "IDR", symbol: "Rp", perIDR: 1 },
  USD: { code: "USD", symbol: "$",  perIDR: 1 / 17753 },
  SGD: { code: "SGD", symbol: "S$", perIDR: 1 / 13866 },
  AUD: { code: "AUD", symbol: "A$", perIDR: 1 / 12578 },
  EUR: { code: "EUR", symbol: "€",  perIDR: 1 / 20619 },
  GBP: { code: "GBP", symbol: "£",  perIDR: 1 / 23827 }
} as const;

export type Currency = keyof typeof FX;

const fmt = (currency: Currency) =>
  new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  });

export function formatPrice(priceIdr: number, currency: Currency): string {
  return fmt(currency).format(priceIdr * FX[currency].perIDR);
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
  GBP: "\u{1F1EC}\u{1F1E7}"   // 🇬🇧
};
