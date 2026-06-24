// PATCH /api/admin/trade-orders/[id]
//
// Status transitions for the trade-order lifecycle. Admin-cookie gated.
// Each transition is small and explicit; no "set arbitrary status"
// path. Allowed flows:
//
//   submitted        -> quoted              (requires freight_quote_gbp)
//   quoted           -> awaiting_payment    (no extra fields)
//   awaiting_payment -> paid                (no extra fields)
//   paid             -> dispatched          (requires tracking_ref)
//   dispatched       -> delivered           (no extra fields)
//   * (non-terminal) -> cancelled
//
// Side effects baked in:
//   - submitted → quoted: total_gbp computed (subtotal + freight); the
//     status flip fires sendTradeOrderQuoted.
//   - paid → dispatched: fires sendTradeOrderConfirmed.
//
// Email failures are NOT treated as request failures — the DB write is
// the source of truth. We return a non-blocking `emailWarning` field
// so the admin UI can surface "saved, but email failed: …".

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTradeOrderConfirmed, sendTradeOrderQuoted } from "@/lib/trade-emails";

export const runtime = "nodejs";

type Status =
  | "submitted"
  | "quoted"
  | "awaiting_payment"
  | "paid"
  | "dispatched"
  | "delivered"
  | "cancelled";

const VALID_STATUSES: Status[] = [
  "submitted",
  "quoted",
  "awaiting_payment",
  "paid",
  "dispatched",
  "delivered",
  "cancelled"
];

const ALLOWED: Record<Status, Status[]> = {
  submitted: ["quoted", "cancelled"],
  quoted: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  paid: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!isStatus(body.status)) {
    return NextResponse.json({ ok: false, error: "Missing or invalid status." }, { status: 400 });
  }
  const next = body.status;

  const current = await supabaseAdmin
    .from("hammerex_trade_orders")
    .select("id, status, subtotal_gbp, freight_quote_gbp, total_gbp, freight_quote_idr, goods_idr_locked")
    .eq("id", id)
    .maybeSingle();

  if (current.error || !current.data) {
    return NextResponse.json(
      { ok: false, error: current.error?.message ?? "Order not found" },
      { status: 404 }
    );
  }

  const from = current.data.status as Status;
  if (from === next) {
    return NextResponse.json({ ok: true, status: next });
  }
  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(next)) {
    return NextResponse.json(
      { ok: false, error: `Cannot transition from '${from}' to '${next}'.` },
      { status: 409 }
    );
  }

  // Build the update payload + per-transition timestamp.
  const update: Record<string, unknown> = { status: next };
  const nowIso = new Date().toISOString();

  if (next === "quoted") {
    const freight = Number(body.freight_quote_gbp);
    if (!Number.isFinite(freight) || freight < 0) {
      return NextResponse.json(
        { ok: false, error: "freight_quote_gbp required to mark as quoted." },
        { status: 400 }
      );
    }
    update.freight_quote_gbp = freight;
    update.total_gbp = Math.round((Number(current.data.subtotal_gbp ?? 0) + freight) * 100) / 100;
    update.quoted_at = nowIso;
    if (typeof body.admin_notes === "string") {
      update.admin_notes = body.admin_notes.trim() || null;
    }
  } else if (next === "awaiting_payment") {
    // No extra fields. We do not stamp confirmed_at here — confirmed_at
    // is reserved for the "paid" event below to match the column's
    // intent (the column reflects when payment is confirmed).
  } else if (next === "paid") {
    update.confirmed_at = nowIso;
  } else if (next === "dispatched") {
    const tracking = String(body.tracking_ref ?? "").trim();
    if (!tracking) {
      return NextResponse.json({ ok: false, error: "tracking_ref required to mark as dispatched." }, { status: 400 });
    }
    update.tracking_ref = tracking;
    update.dispatched_at = nowIso;
  } else if (next === "delivered") {
    update.delivered_at = nowIso;
  } else if (next === "cancelled") {
    update.cancelled_at = nowIso;
  }

  const upd = await supabaseAdmin
    .from("hammerex_trade_orders")
    .update(update)
    .eq("id", id)
    .select("id, status")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json(
      { ok: false, error: upd.error?.message ?? "Update failed" },
      { status: 500 }
    );
  }

  // Fire emails after the DB write. We catch errors to a soft warning
  // — the status flip itself has already succeeded.
  let emailWarning: string | undefined;
  if (next === "quoted") {
    const r = await sendTradeOrderQuoted(id);
    if (!r.ok) emailWarning = r.error;
  } else if (next === "dispatched") {
    const r = await sendTradeOrderConfirmed(id);
    if (!r.ok) emailWarning = r.error;
  }

  return NextResponse.json({ ok: true, status: upd.data.status, emailWarning });
}
