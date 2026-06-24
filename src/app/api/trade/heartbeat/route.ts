// POST /api/trade/heartbeat
//
// Soft session-end heartbeat. The trade portal client may POST here
// every ~60s while the tab is active and once more on `beforeunload`
// via `navigator.sendBeacon`. We update `signed_out_at` on the current
// login event to "now" so that even if the buyer closes the tab without
// clicking Sign out, our analytics get a near-real session-end boundary.
//
// Phase 1 NOTE: the welcome page does NOT yet ship a client heartbeat —
// the spec said "skip unless trivial". This endpoint is wired so Phase 2
// can drop in a tiny `useEffect` without touching the server. The
// explicit Sign out flow already writes signed_out_at + duration.

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  TRADE_EVENT_COOKIE,
  getCurrentTradeAccount
} from "@/lib/trade-auth";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const eventId = cookieStore.get(TRADE_EVENT_COOKIE)?.value;
  if (!eventId) return NextResponse.json({ ok: false }, { status: 204 });

  const account = await getCurrentTradeAccount();
  if (!account) return NextResponse.json({ ok: false }, { status: 204 });

  // Only update rows that belong to the current account AND aren't
  // already closed (an explicit sign-out wins over heartbeats).
  await supabaseAdmin
    .from("hammerex_trade_login_events")
    .update({ signed_out_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("account_id", account.id)
    .is("signed_out_at", null);

  return NextResponse.json({ ok: true });
}
