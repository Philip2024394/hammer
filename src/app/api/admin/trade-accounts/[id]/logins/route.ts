// GET /api/admin/trade-accounts/[id]/logins
// Returns the last 50 login events for a trade account, newest first.
// Admin-cookie gated. Used by the row drill-down modal.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("hammerex_trade_login_events")
    .select("id, signed_in_at, signed_out_at, session_duration_seconds, ip, user_agent, country_inferred")
    .eq("account_id", id)
    .order("signed_in_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, events: data ?? [] });
}
