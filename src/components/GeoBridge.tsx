"use client";

import { useEffect } from "react";
import { HX_COUNTRY_COOKIE } from "@/lib/geo";

// Client-side fallback: if the middleware couldn't read a country header
// (i.e. we're self-hosted without Vercel/Cloudflare in front), look the
// buyer up via a free IP→country API and write the `hx_country` cookie
// once. From the next page navigation onwards every server component
// gets a deterministic country signal and can localise currency.
//
// Free tier: ipapi.co allows ~30k requests/day on the anonymous JSON
// endpoint with no key. Plenty for an organic-traffic store at this
// stage. If it ever rate-limits, swap in your own server endpoint.
export function GeoBridge() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.cookie.includes(`${HX_COUNTRY_COOKIE}=`)) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country_code?: string } | null) => {
        const code = data?.country_code?.toUpperCase();
        if (!code) return;
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        document.cookie = `${HX_COUNTRY_COOKIE}=${code}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      })
      .catch(() => {
        // Silent fail — we just don't localise this session, no user impact.
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return null;
}
