// POST /api/admin/login
// Body: { password: string }
// On success: sets the signed admin cookie and returns { ok: true }.
// On failure: returns 401 with a generic message.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminCookieAttrs, adminPasswordMatches, signAdminCookie } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!adminPasswordMatches(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const attrs = adminCookieAttrs();
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: signAdminCookie(),
    httpOnly: attrs.httpOnly,
    sameSite: attrs.sameSite,
    secure: attrs.secure,
    path: attrs.path,
    maxAge: attrs.maxAge
  });
  return res;
}
