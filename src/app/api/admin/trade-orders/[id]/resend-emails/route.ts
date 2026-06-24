// POST /api/admin/trade-orders/[id]/resend-emails
//
// Owner-initiated email re-send. Picks the appropriate template based
// on the order's current status (see manualResendForOrder in
// src/lib/trade-emails.ts). Every send is recorded in
// hammerex_trade_email_log with email_type='manual_resend'.
//
// Also doubles as the manual-trigger endpoint Agent C can hit while
// the order-submission flow is being wired — POSTing here for a
// freshly-created order will deliver both the admin alert and the
// buyer confirmation, since manualResendForOrder routes 'submitted'
// orders through the submit templates.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { manualResendForOrder } from "@/lib/trade-emails";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const result = await manualResendForOrder(id);

  // Treat the request as successful if the buyer email landed; surface
  // admin-send errors as warnings but not request failures.
  if (!result.buyer.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.buyer.error || "Buyer email failed",
        adminWarning: result.admin && !result.admin.ok ? result.admin.error : undefined
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    buyer: result.buyer,
    admin: result.admin
  });
}
