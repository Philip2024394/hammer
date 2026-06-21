// POST /api/track
// Single endpoint for client-side beacons. Routes by `kind`:
//   { kind: "page", event_type, product_id?, session_id?, path? }
//   { kind: "search", q, results_count, session_id? }
// Country is derived server-side from the hx_country cookie / platform
// headers, so the client doesn't need to know it. Always returns 200 —
// tracking failures must never break the page.

import { NextResponse, type NextRequest } from "next/server";
import { logPageEvent, logSearchQuery, type PageEventType } from "@/lib/track";
import { getCountryFromRequest } from "@/lib/geo";

const VALID_EVENT_TYPES: PageEventType[] = [
  "pdp_view",
  "cart_view",
  "checkout_view",
  "checkout_started",
  "checkout_success"
];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const country = getCountryFromRequest(req.headers, req.cookies);
  const session_id = typeof body.session_id === "string" ? body.session_id : null;

  if (body.kind === "page") {
    const event_type = String(body.event_type ?? "") as PageEventType;
    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ ok: true });
    }
    await logPageEvent({
      event_type,
      product_id: typeof body.product_id === "string" ? body.product_id : null,
      country,
      session_id,
      path: typeof body.path === "string" ? body.path : null
    });
    return NextResponse.json({ ok: true });
  }

  if (body.kind === "search") {
    const q = String(body.q ?? "");
    const results_count = Number(body.results_count ?? 0);
    await logSearchQuery({
      q,
      results_count: Number.isFinite(results_count) ? results_count : 0,
      country,
      session_id
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
