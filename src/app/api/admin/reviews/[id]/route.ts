// POST /api/admin/reviews/[id]
// Body: { action: "approve" | "reject" }
// Gated by the admin cookie. Approving stamps `reviewed_at` and flips
// status to 'approved' so the PDP starts rendering the row; rejecting
// flips to 'rejected' (rows are kept around so the admin can see the
// audit trail in the moderation queue).

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  let action: string;
  try {
    const body = await req.json();
    action = String(body?.action ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  const next = action === "approve" ? "approved" : "rejected";
  const upd = await supabaseAdmin
    .from("hammerex_reviews")
    .update({ status: next, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();

  if (upd.error || !upd.data) {
    return NextResponse.json(
      { ok: false, error: upd.error?.message ?? "Not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
