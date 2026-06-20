import { NextResponse, type NextRequest } from "next/server";
import { HX_COUNTRY_COOKIE } from "@/lib/geo";

// Promotes the buyer's country code from the platform-provided geo headers
// into a cookie so server components can read it without re-checking every
// request. Runs on every page-class request; bypassed for static assets and
// API routes via the matcher below.
export function middleware(req: NextRequest) {
  const existing = req.cookies.get(HX_COUNTRY_COOKIE);
  if (existing?.value) {
    return NextResponse.next();
  }

  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;

  if (!country) {
    // No platform geo header — the client-side GeoBridge will fill it in
    // after the first paint via a free IP→country API.
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.cookies.set(HX_COUNTRY_COOKIE, country.toUpperCase(), {
    path: "/",
    sameSite: "lax",
    httpOnly: false, // readable client-side too so JS can localise on the fly
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
  return res;
}

export const config = {
  matcher: [
    // Exclude static + API + Next internals; run on everything else.
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|ttf|otf)$).*)"
  ]
};
