// Indicative FX rates — surfaces in the UI labelled "indicative".
// Final charge is in IDR until live FX is wired.
export const FX = {
  IDR: { code: "IDR", symbol: "Rp", perIDR: 1 },
  USD: { code: "USD", symbol: "$",  perIDR: 1 / 16000 },
  SGD: { code: "SGD", symbol: "S$", perIDR: 1 / 12000 },
  AUD: { code: "AUD", symbol: "A$", perIDR: 1 / 10500 },
  EUR: { code: "EUR", symbol: "€",  perIDR: 1 / 17500 },
  GBP: { code: "GBP", symbol: "£",  perIDR: 1 / 20000 }
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
