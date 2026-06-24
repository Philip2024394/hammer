// POST /api/trade/signout
//
// Closes the current trade login event and tears down the Supabase auth
// session. Resilient: even if the hx_trade_event cookie is missing or
// points at a row we can't update, we always sign the auth session out
// and clear the cookie so the user lands at an unauthenticated state.

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  TRADE_EVENT_COOKIE,
  createSupabaseServerClient,
  getCurrentTradeAccount
} from "@/lib/trade-auth";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const eventId = cookieStore.get(TRADE_EVENT_COOKIE)?.value || null;

  // Resolve the trade account currently signed in so we can verify the
  // login event we're about to close belongs to them.
  const account = await getCurrentTradeAccount();

  if (eventId && account) {
    // Re-read the row to compute duration based on signed_in_at server-
    // side (don't trust the client clock).
    const { data: row } = await supabaseAdmin
      .from("hammerex_trade_login_events")
      .select("id,account_id,signed_in_at,signed_out_at")
      .eq("id", eventId)
      .maybeSingle();

    if (row && row.account_id === account.id && !row.signed_out_at) {
      const signedInMs = new Date(row.signed_in_at).getTime();
      const nowMs = Date.now();
      const duration = Math.max(0, Math.floor((nowMs - signedInMs) / 1000));

      await supabaseAdmin
        .from("hammerex_trade_login_events")
        .update({
          signed_out_at: new Date(nowMs).toISOString(),
          session_duration_seconds: duration
        })
        .eq("id", eventId);

      await supabaseAdmin
        .from("hammerex_trade_accounts")
        .update({
          total_session_seconds: (account.total_session_seconds ?? 0) + duration
        })
        .eq("id", account.id);
    }
  }

  // Tear down Supabase auth session (clears sb-* cookies via the ssr
  // adapter).
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // No-op: even if signOut fails (e.g. no session) we still clear our
    // event cookie below.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: TRADE_EVENT_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res;
}
