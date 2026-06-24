// POST /api/locale  { locale: "en" | "id" | "vi" | "ms" }
// Writes the `hx_locale` cookie so the next request renders in the
// chosen language. 30-day expiry to match `hx_country`.

import { NextResponse, type NextRequest } from "next/server";
import { HX_LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let body: { locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!isLocale(body.locale)) {
    return NextResponse.json({ ok: false, error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale: body.locale });
  res.cookies.set(HX_LOCALE_COOKIE, body.locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30
  });
  return res;
}
