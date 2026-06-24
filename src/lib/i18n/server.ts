// Server-side locale resolver. Reads `hx_locale` cookie first; if absent,
// derives from `hx_country` via COUNTRY_TO_LOCALE; final fallback English.
// Use in server components (layouts, pages) to pick the locale BEFORE
// passing it down through LocaleProvider.

import { cookies } from "next/headers";
import { HX_COUNTRY_COOKIE } from "@/lib/geo";
import {
  DEFAULT_LOCALE,
  HX_LOCALE_COOKIE,
  deriveLocaleFromCountry,
  isLocale,
  type Locale
} from "./locales";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const explicit = c.get(HX_LOCALE_COOKIE)?.value;
  if (isLocale(explicit)) return explicit;
  const country = c.get(HX_COUNTRY_COOKIE)?.value ?? null;
  if (country) return deriveLocaleFromCountry(country);
  return DEFAULT_LOCALE;
}
