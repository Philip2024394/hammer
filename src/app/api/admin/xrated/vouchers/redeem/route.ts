// POST /api/admin/xrated/vouchers/redeem
// Body (JSON or form-encoded): {
//   id: string,                                            // voucher.id
//   status: "redeemed" | "unused" | "revoked" | "expired",
//   order_ref?: string,
//   admin_note?: string
// }
//
// Used by the admin voucher console to flip a voucher between states.
// "redeemed" stamps redeemed_at to now() and stores the order reference;
// any other status clears redeemed_at + redeemed_order_ref so an ops
// correction lands the row back in a clean state.
//
// Form-encoded submits get a 303 redirect back to /admin/xrated/vouchers
// so the page re-renders without client JS. JSON submits return JSON.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const VALID_STATUSES = new Set(["redeemed", "unused", "revoked", "expired"]);

type ParsedBody = {
  id: string;
  status: "redeemed" | "unused" | "revoked" | "expired";
  order_ref: string | null;
  admin_note: string | null;
  isForm: boolean;
};

async function parseBody(req: NextRequest): Promise<ParsedBody | null> {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  let raw: Record<string, unknown> = {};
  let isForm = false;
  try {
    if (ct.includes("application/json")) {
      raw = (await req.json()) as Record<string, unknown>;
    } else {
      isForm = true;
      const fd = await req.formData();
      raw = Object.fromEntries(fd.entries());
    }
  } catch {
    return null;
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const status = typeof raw.status === "string" ? raw.status.trim() : "";
  if (!id || !VALID_STATUSES.has(status)) return null;
  const order_ref =
    typeof raw.order_ref === "string" && raw.order_ref.trim()
      ? raw.order_ref.trim().slice(0, 80)
      : null;
  const admin_note =
    typeof raw.admin_note === "string" && raw.admin_note.trim()
      ? raw.admin_note.trim().slice(0, 2000)
      : null;
  return {
    id,
    status: status as ParsedBody["status"],
    order_ref,
    admin_note,
    isForm
  };
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Bad request — needs id + valid status" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {
    status: body.status,
    admin_note: body.admin_note
  };
  if (body.status === "redeemed") {
    update.redeemed_at = new Date().toISOString();
    update.redeemed_order_ref = body.order_ref;
  } else {
    update.redeemed_at = null;
    update.redeemed_order_ref = null;
  }

  const upd = await supabaseAdmin
    .from("hammerex_xrated_vouchers")
    .update(update)
    .eq("id", body.id)
    .select("id, status")
    .maybeSingle();

  if (upd.error) {
    return NextResponse.json(
      { ok: false, error: upd.error.message },
      { status: 500 }
    );
  }
  if (!upd.data) {
    return NextResponse.json(
      { ok: false, error: "Voucher not found" },
      { status: 404 }
    );
  }

  if (body.isForm) {
    const url = new URL("/admin/xrated/vouchers", req.url);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json({ ok: true, status: upd.data.status });
}
