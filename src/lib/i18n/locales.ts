// Locale registry — kept tiny on purpose. The dictionary modules
// (`dict.en.ts`, `dict.id.ts`, `dict.vi.ts`, `dict.ms.ts`) are the source
// of truth for visible copy; this file just enumerates the codes and the
// country → locale mapping used by middleware to auto-pick on landing.

export const LOCALES = ["en", "id", "vi", "ms"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Visitor's IP-derived country → display locale. Anything not in this map
// (UK, US, EU, AU, SG, etc.) falls back to English. Reflects the customer
// base: native-language for ID/VN/MY visitors, English for everyone else.
export const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  ID: "id",
  VN: "vi",
  MY: "ms"
};

export function deriveLocaleFromCountry(country: string | null | undefined): Locale {
  if (!country) return DEFAULT_LOCALE;
  return COUNTRY_TO_LOCALE[country.toUpperCase()] ?? DEFAULT_LOCALE;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export const HX_LOCALE_COOKIE = "hx_locale";

// Human-readable labels for the language switcher pill (always rendered in
// the *target* locale so the buyer can recognise their own language).
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  ms: "Bahasa Melayu"
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "\u{1F1EC}\u{1F1E7}", // GB flag stands in for English; switcher copy is the locale label
  id: "\u{1F1EE}\u{1F1E9}",
  vi: "\u{1F1FB}\u{1F1F3}",
  ms: "\u{1F1F2}\u{1F1FE}"
};
