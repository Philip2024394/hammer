// PATCH /api/admin/trade-accounts/[id]
// Body: { status: "pending" | "active" | "disabled" }
// Status-only mutator for the trade-accounts admin. Admin-cookie gated.
// Restricts transitions to the documented set:
//   pending  -> active        (activate)
//   active   -> disabled      (disable)
//   disabled -> active        (re-enable)
// Other transitions return 409 so accidental clicks never silently
// reset a row to pending.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Status = "pending" | "active" | "disabled";

const ALLOWED: Record<Status, Status[]> = {
  pending: ["active"],
  active: ["disabled"],
  disabled: ["active"]
};

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

  const next = String(body.status ?? "") as Status;
  if (next !== "pending" && next !== "active" && next !== "disabled") {
    return NextResponse.json({ ok: false, error: "status must be pending | active | disabled." }, { status: 400 });
  }

  const current = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("id, status")
    .eq("id", id)
    .single();

  if (current.error || !current.data) {
    return NextResponse.json({ ok: false, error: current.error?.message ?? "Not found" }, { status: 404 });
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

  const upd = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .update({ status: next })
    .eq("id", id)
    .select("id, status")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: upd.data.status });
}
