// Country → currency + display helpers. Country code is the ISO 3166-1
// alpha-2 form (e.g. "GB", "US"). Falls back to null when we have no signal,
// so consumers can decide whether to use the product's base_currency.

import type { Currency } from "./fx";

export const HX_COUNTRY_COOKIE = "hx_country";
export const HX_CITY_COOKIE   = "hx_city";
export const HX_REGION_COOKIE = "hx_region";
export const HX_LAT_COOKIE    = "hx_lat";
export const HX_LON_COOKIE    = "hx_lon";

export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  GB: "GBP", IE: "EUR",
  US: "USD", CA: "USD",
  AU: "AUD", NZ: "AUD",
  SG: "SGD",
  ID: "IDR",
  // Eurozone — everyone else falls through to GBP default below
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  SK: "EUR", SI: "EUR", LT: "EUR", LV: "EUR", EE: "EUR", CY: "EUR",
  MT: "EUR", HR: "EUR"
};

export function countryToCurrency(country: string | null | undefined): Currency | null {
  if (!country) return null;
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? null;
}

// Reads the geo signal in this priority order:
//   1. Cookie `hx_country` (set by middleware OR by the client-side fallback)
//   2. Live request headers (Vercel `x-vercel-ip-country`, Cloudflare `cf-ipcountry`)
// Returns ISO country code or null.
export function getCountryFromRequest(headers: Headers, cookies: { get(name: string): { value: string } | undefined }): string | null {
  const cookied = cookies.get(HX_COUNTRY_COOKIE)?.value;
  if (cookied) return cookied.toUpperCase();
  const fromVercel = headers.get("x-vercel-ip-country");
  if (fromVercel) return fromVercel.toUpperCase();
  const fromCloudflare = headers.get("cf-ipcountry");
  if (fromCloudflare) return fromCloudflare.toUpperCase();
  return null;
}

// City + region (state / subdivision). Populated by Vercel
// (`x-vercel-ip-city`, `x-vercel-ip-country-region`) and by Cloudflare
// Enterprise (`cf-ipcity`). Localhost and non-Enterprise CF return null.
// Cities are URL-encoded by Vercel (e.g. "New%20York"); we decode here.
function decode(value: string | null): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return value; }
}

export function getCityFromRequest(headers: Headers, cookies: { get(name: string): { value: string } | undefined }): string | null {
  const cookied = cookies.get(HX_CITY_COOKIE)?.value;
  if (cookied) return cookied;
  return decode(headers.get("x-vercel-ip-city") || headers.get("cf-ipcity"));
}

export function getRegionFromRequest(headers: Headers, cookies: { get(name: string): { value: string } | undefined }): string | null {
  const cookied = cookies.get(HX_REGION_COOKIE)?.value;
  if (cookied) return cookied;
  return decode(headers.get("x-vercel-ip-country-region") || headers.get("cf-region-code"));
}

// Lat/lon comes from Vercel's `x-vercel-ip-latitude` / `x-vercel-ip-longitude`.
// Cloudflare doesn't ship coordinates on the free/Pro tier — those visitors
// fall back to the country centroid in the admin map. Stored as decimals.
export function getLatLonFromRequest(
  headers: Headers,
  cookies: { get(name: string): { value: string } | undefined }
): { latitude: number | null; longitude: number | null } {
  function parse(name: string, cookieName: string): number | null {
    const c = cookies.get(cookieName)?.value;
    const raw = (c && c.length > 0) ? c : headers.get(name);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return {
    latitude:  parse("x-vercel-ip-latitude",  HX_LAT_COOKIE),
    longitude: parse("x-vercel-ip-longitude", HX_LON_COOKIE)
  };
}

// Optional micro-localisations the PDP/cart can use to feel "local".
export type CountryLocaleHint = {
  country: string;
  countryName: string;
  currency: Currency | null;
  flag: string;
};

export function localeHintFor(country: string | null | undefined): CountryLocaleHint {
  const c = country?.toUpperCase() ?? "";
  return {
    country: c,
    countryName: COUNTRY_NAMES[c] ?? c,
    currency: countryToCurrency(c),
    flag: COUNTRY_FLAGS[c] ?? ""
  };
}

const COUNTRY_FLAGS: Record<string, string> = {
  GB: "\u{1F1EC}\u{1F1E7}", US: "\u{1F1FA}\u{1F1F8}", AU: "\u{1F1E6}\u{1F1FA}",
  SG: "\u{1F1F8}\u{1F1EC}", ID: "\u{1F1EE}\u{1F1E9}", DE: "\u{1F1E9}\u{1F1EA}",
  FR: "\u{1F1EB}\u{1F1F7}", IT: "\u{1F1EE}\u{1F1F9}", ES: "\u{1F1EA}\u{1F1F8}",
  NL: "\u{1F1F3}\u{1F1F1}", IE: "\u{1F1EE}\u{1F1EA}", CA: "\u{1F1E8}\u{1F1E6}",
  NZ: "\u{1F1F3}\u{1F1FF}", BE: "\u{1F1E7}\u{1F1EA}", PT: "\u{1F1F5}\u{1F1F9}",
  AT: "\u{1F1E6}\u{1F1F9}", FI: "\u{1F1EB}\u{1F1EE}", GR: "\u{1F1EC}\u{1F1F7}",
  LU: "\u{1F1F1}\u{1F1FA}", SK: "\u{1F1F8}\u{1F1F0}", SI: "\u{1F1F8}\u{1F1EE}"
};

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom", US: "United States", AU: "Australia",
  SG: "Singapore", ID: "Indonesia", DE: "Germany", FR: "France",
  IT: "Italy", ES: "Spain", NL: "Netherlands", IE: "Ireland",
  CA: "Canada", NZ: "New Zealand", BE: "Belgium", PT: "Portugal",
  AT: "Austria", FI: "Finland", GR: "Greece", LU: "Luxembourg",
  SK: "Slovakia", SI: "Slovenia"
};
