// POST /api/admin/orders/[id]/capture
// Captures the previously-authorized payment on a Stripe order, then
// marks the order as captured + ready-for-dispatch. Called from the
// admin dashboard via the Capture button.
//
// Auth: requires the signed admin session cookie set by /api/admin/login.

import { NextResponse, type NextRequest } from "next/server";
import { STRIPE_ENABLED, getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json({ error: "Stripe is not enabled." }, { status: 503 });
  }
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const orderRes = await supabase
    .from("hammerex_orders")
    .select("id,status,stripe_payment_intent_id")
    .eq("id", id)
    .maybeSingle();
  if (orderRes.error || !orderRes.data) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const order = orderRes.data;
  if (order.status !== "authorized") {
    return NextResponse.json(
      { error: `Order is not in authorized state (current: ${order.status}).` },
      { status: 409 }
    );
  }
  if (!order.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "Order has no payment intent on file." },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  try {
    const pi = await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
    await supabase.from("hammerex_orders").update({
      status: "captured",
      captured_at: new Date().toISOString(),
      stripe_charge_id: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id ?? null
    }).eq("id", order.id);
    return NextResponse.json({ ok: true, status: "captured" });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
