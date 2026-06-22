// POST /api/admin/product-requests/[id]
// Body: { action: "mark_responded" | "mark_closed" | "reopen", admin_notes?: string }
// Admin-cookie gated. Same shape as the /api/admin/quote-requests
// endpoint, just different status verbs (responded vs quoted).

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Action = "mark_responded" | "mark_closed" | "reopen";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
  const action = String(body.action ?? "") as Action;
  if (action !== "mark_responded" && action !== "mark_closed" && action !== "reopen") {
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (action === "mark_responded") {
    patch.status = "responded";
    patch.responded_at = now;
    patch.closed_at = null;
  } else if (action === "mark_closed") {
    patch.status = "closed";
    patch.closed_at = now;
  } else {
    patch.status = "pending";
    patch.responded_at = null;
    patch.closed_at = null;
  }
  if (typeof body.admin_notes === "string") {
    patch.admin_notes = body.admin_notes.trim().slice(0, 2000) || null;
  }

  const upd = await supabaseAdmin
    .from("hammerex_product_requests")
    .update(patch)
    .eq("id", id)
    .select("id, status")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json({ ok: false, error: upd.error?.message ?? "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, status: upd.data.status });
}
