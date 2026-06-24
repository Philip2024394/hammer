import { NextResponse, type NextRequest } from "next/server";
import { HX_COUNTRY_COOKIE, HX_CITY_COOKIE, HX_REGION_COOKIE, HX_LAT_COOKIE, HX_LON_COOKIE } from "@/lib/geo";
import { HX_LOCALE_COOKIE, deriveLocaleFromCountry, isLocale } from "@/lib/i18n/locales";
import { verifyAdminCookieEdge } from "@/lib/adminAuthEdge";

// Must stay in sync with ADMIN_COOKIE in lib/adminAuth.ts. Inlined here so
// middleware (edge runtime) doesn't pull node's `crypto` in via that file.
const ADMIN_COOKIE = "hx_admin";

// Promotes the buyer's country code from the platform-provided geo headers
// into a cookie so server components can read it without re-checking every
// request. Runs on every page-class request; bypassed for static assets and
// API routes via the matcher below.
//
// Also gates /admin/* — without a valid signed cookie, redirects to
// /admin/login. The login form itself stays accessible.
//
// Also gates /trade/* DEEPER paths (anything below /trade and outside the
// auth callback). The /trade landing itself is public — it renders the
// login form when unauthenticated and the welcome surface when signed in.
// Deeper trade paths (catalogue, cart, checkout etc., none of which exist
// yet) return 404 to anonymous visitors so the portal's gating isn't
// advertised. The check here is a coarse "do you have a Supabase auth
// cookie?" — the page itself does the full whitelist check.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    const ok = await verifyAdminCookieEdge(cookie, process.env.ADMIN_COOKIE_SECRET);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (
    pathname.startsWith("/trade/") &&
    pathname !== "/trade" &&
    !pathname.startsWith("/trade/auth/")
  ) {
    // @supabase/ssr stores its session as one or more cookies prefixed
    // `sb-<project-ref>-auth-token`. We just check that at least one
    // such cookie exists — the page handler does the real auth + trade-
    // account whitelist check (and will 404 itself on mismatch).
    const all = req.cookies.getAll();
    const hasSupabaseAuth = all.some((c) =>
      c.name.startsWith("sb-") && c.name.includes("auth-token")
    );
    if (!hasSupabaseAuth) {
      return new NextResponse(null, { status: 404 });
    }
  }

  const existingCountry = req.cookies.get(HX_COUNTRY_COOKIE)?.value;
  const existingCity    = req.cookies.get(HX_CITY_COOKIE)?.value;
  const existingRegion  = req.cookies.get(HX_REGION_COOKIE)?.value;
  const existingLat     = req.cookies.get(HX_LAT_COOKIE)?.value;
  const existingLon     = req.cookies.get(HX_LON_COOKIE)?.value;

  // Vercel URL-encodes city headers ("New%20York"); decode before storing.
  function decode(v: string | null): string | null {
    if (!v) return null;
    try { return decodeURIComponent(v); } catch { return v; }
  }

  const country = existingCountry ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const city   = existingCity   || decode(req.headers.get("x-vercel-ip-city")           || req.headers.get("cf-ipcity"));
  const region = existingRegion || decode(req.headers.get("x-vercel-ip-country-region") || req.headers.get("cf-region-code"));
  const lat    = existingLat    || req.headers.get("x-vercel-ip-latitude");
  const lon    = existingLon    || req.headers.get("x-vercel-ip-longitude");

  if (!country && !city) {
    // No platform geo signal at all — the client-side GeoBridge fills
    // country in after first paint via a free IP→country API.
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const opts = {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30
  };
  if (country && !existingCountry) res.cookies.set(HX_COUNTRY_COOKIE, country.toUpperCase(), opts);
  if (city    && !existingCity)    res.cookies.set(HX_CITY_COOKIE,    city,                  opts);
  if (region  && !existingRegion)  res.cookies.set(HX_REGION_COOKIE,  region,                opts);
  if (lat     && !existingLat)     res.cookies.set(HX_LAT_COOKIE,     lat,                   opts);
  if (lon     && !existingLon)     res.cookies.set(HX_LON_COOKIE,     lon,                   opts);

  // Auto-pick locale on landing: if the visitor hasn't explicitly chosen a
  // language (no `hx_locale` cookie), derive one from their IP-country and
  // write it. Cookie-driven, no URL change — the LocaleSwitcher overrides
  // by POSTing to /api/locale. Country is honoured in priority order:
  // existing cookie → header (Vercel/CF) → null.
  const existingLocale = req.cookies.get(HX_LOCALE_COOKIE)?.value;
  if (!isLocale(existingLocale)) {
    const localeFromCountry = deriveLocaleFromCountry(country);
    res.cookies.set(HX_LOCALE_COOKIE, localeFromCountry, opts);
  }

  return res;
}

export const config = {
  matcher: [
    // Exclude static + API + Next internals; run on everything else.
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|ttf|otf)$).*)"
  ]
};
