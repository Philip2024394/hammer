"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { HX_COUNTRY_COOKIE } from "@/lib/geo";

// CountryProvider is hydrated server-side with the country resolved from
// `hx_country` cookie (or platform headers via middleware). Client components
// call `useCountry()` to decide whether to render numeric prices or the
// "Quoted at checkout" label (see `shouldShowPrice`/`formatPriceForRegion`
// in `@/lib/fx`).
//
// Once mounted, the provider also re-reads the cookie on the client in case
// the GeoBridge fallback wrote a country code after first paint. That way
// visitors who land via a non-Vercel/CF edge still get region-correct prices
// from the next render onward.

const CountryContext = createContext<string | null>(null);

export function CountryProvider({ country, children }: { country: string | null; children: ReactNode }) {
  const [resolved, setResolved] = useState<string | null>(country);

  useEffect(() => {
    if (resolved) return;
    if (typeof document === "undefined") return;
    const match = document.cookie.match(new RegExp(`(?:^|; )${HX_COUNTRY_COOKIE}=([^;]+)`));
    if (match) setResolved(decodeURIComponent(match[1]).toUpperCase());
  }, [resolved]);

  return <CountryContext.Provider value={resolved}>{children}</CountryContext.Provider>;
}

export function useCountry(): string | null {
  return useContext(CountryContext);
}
