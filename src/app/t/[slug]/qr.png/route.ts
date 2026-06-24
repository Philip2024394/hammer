// Legacy `/t/<slug>/qr.png` — 301 redirect to the canonical
// `/trade/<slug>/qr.png` route. Preserves query string so `?download=1`
// continues to work for printed QR cards still pointing at the old path.

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const cleanSlug = slug.replace(/[^a-zA-Z0-9-]/g, "");
  const search = req.nextUrl.search ?? "";
  const location = `/trade/${cleanSlug}/qr.png${search}`;
  return NextResponse.redirect(new URL(location, req.nextUrl.origin), 308);
}
