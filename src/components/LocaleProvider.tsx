"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { t as tFn, type TKey } from "@/lib/i18n/t";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

// Client-side locale context. Hydrated by the root layout with the
// server-resolved locale (cookie → country → English). Components use
// `useT()` to get a memoised `t(key, vars?)` function bound to the
// active locale, so they don't need to pass `locale` through every call.

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): (key: TKey, vars?: Record<string, string | number>) => string {
  const locale = useLocale();
  return useMemo(() => (key: TKey, vars?: Record<string, string | number>) => tFn(locale, key, vars), [locale]);
}
