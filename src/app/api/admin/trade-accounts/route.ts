// POST /api/admin/trade-accounts
// Body: {
//   company_name: string (required),
//   contact_name?: string | null,
//   contact_email: string (required, will be lowercased),
//   contact_phone?: string | null,
//   country: string (required, ISO-2 uppercase),
//   currency: "GBP" | "USD" | "EUR" | "IDR" (default GBP),
//   notes?: string | null
// }
// Generates a sequential HMX-T-NNNN trade_account_no, inserts the
// row with status='pending'. Magic-link delivery is wired by
// Agent C — this route only owns the directory write.
//
// Race note: trade_account_no is derived from MAX()+1 inside a
// best-effort retry loop. trade_account_no is UNIQUE, so a
// duplicate would surface as a Postgres 23505 — we retry up to 3
// times before bailing.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const CURRENCIES = new Set(["GBP", "USD", "EUR", "IDR"]);

const TRADE_NO_PREFIX = "HMX-T-";

function pad(n: number, width: number): string {
  const s = String(n);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

async function nextTradeAccountNo(): Promise<string> {
  // Pull the lexicographically last HMX-T-* and increment. Works fine
  // until we cross 5 digits — at which point a numeric sort would be
  // needed. We pad to 4 today; reassess at HMX-T-9999.
  const { data, error } = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("trade_account_no")
    .like("trade_account_no", `${TRADE_NO_PREFIX}%`)
    .order("trade_account_no", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const last = data?.[0]?.trade_account_no as string | undefined;
  let nextN = 1;
  if (last) {
    const tail = last.slice(TRADE_NO_PREFIX.length);
    const parsed = parseInt(tail, 10);
    if (Number.isFinite(parsed) && parsed > 0) nextN = parsed + 1;
  }
  return TRADE_NO_PREFIX + pad(nextN, 4);
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const company_name = typeof body.company_name === "string" ? body.company_name.trim() : "";
  if (!company_name) {
    return NextResponse.json({ ok: false, error: "company_name is required." }, { status: 400 });
  }

  const contact_email_raw = typeof body.contact_email === "string" ? body.contact_email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(contact_email_raw)) {
    return NextResponse.json({ ok: false, error: "contact_email is not a valid email." }, { status: 400 });
  }

  const country_raw = typeof body.country === "string" ? body.country.trim().toUpperCase() : "";
  if (!COUNTRY_RE.test(country_raw)) {
    return NextResponse.json(
      { ok: false, error: "country must be a 2-letter ISO code (e.g. GB, ID, US)." },
      { status: 400 }
    );
  }

  const currency_raw = typeof body.currency === "string" ? body.currency.toUpperCase() : "GBP";
  const currency = CURRENCIES.has(currency_raw) ? currency_raw : "GBP";

  const contact_name = typeof body.contact_name === "string" ? body.contact_name.trim().slice(0, 200) || null : null;
  const contact_phone = typeof body.contact_phone === "string" ? body.contact_phone.trim().slice(0, 60) || null : null;
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;

  // Reject duplicate emails up front with a friendly message; the DB
  // would otherwise return a 23505 which is less obvious.
  const existing = await supabaseAdmin
    .from("hammerex_trade_accounts")
    .select("id")
    .eq("contact_email", contact_email_raw)
    .maybeSingle();
  if (existing.error && existing.error.code !== "PGRST116") {
    return NextResponse.json({ ok: false, error: existing.error.message }, { status: 500 });
  }
  if (existing.data) {
    return NextResponse.json(
      { ok: false, error: "A trade account with that contact email already exists." },
      { status: 409 }
    );
  }

  // Retry on trade_account_no collisions (rare; only happens if two
  // admin creates race each other).
  let lastErr: string | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let trade_account_no: string;
    try {
      trade_account_no = await nextTradeAccountNo();
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }

    const ins = await supabaseAdmin
      .from("hammerex_trade_accounts")
      .insert({
        trade_account_no,
        company_name,
        contact_name,
        contact_email: contact_email_raw,
        contact_phone,
        country: country_raw,
        currency,
        status: "pending",
        notes,
        created_by_admin: "admin",
        login_count: 0,
        total_session_seconds: 0
      })
      .select("id, trade_account_no")
      .single();

    if (!ins.error && ins.data) {
      return NextResponse.json({
        ok: true,
        id: ins.data.id,
        trade_account_no: ins.data.trade_account_no
      });
    }

    // 23505 = unique_violation. If it's on trade_account_no, retry.
    // If it's on contact_email, surface the friendly message.
    const msg = ins.error?.message ?? "Insert failed";
    if (ins.error?.code === "23505" && msg.includes("contact_email")) {
      return NextResponse.json(
        { ok: false, error: "A trade account with that contact email already exists." },
        { status: 409 }
      );
    }
    if (ins.error?.code === "23505") {
      lastErr = msg;
      continue;
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  return NextResponse.json(
    { ok: false, error: `Could not allocate a unique trade_account_no after 3 attempts: ${lastErr ?? "unknown"}` },
    { status: 500 }
  );
}
