// POST /api/quote-requests
// JSON body from the checkout form. Inserts the cart snapshot + buyer
// contact into hammerex_quote_requests as status='pending' and returns
// the public reference code (Q-XXXXXX) so the buyer's thank-you page
// can quote it back. Uses the service-role client because the table is
// locked down to admin reads only.
//
// Validation is intentionally minimal — the form is behind a multi-step
// checkout, so volume is low. Email + WhatsApp shape-checked, not
// full-blown validated. No honeypot: password managers were silently
// failing real submissions by filling hidden fields. If spam ever shows
// up we'll add proper per-IP rate limiting (same pattern as the admin
// login throttle), not a client-side trap.

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type LineIn = {
  productId?: unknown;
  slug?: unknown;
  name?: unknown;
  sku?: unknown;
  image?: unknown;
  unitPriceIdr?: unknown;
  qty?: unknown;
  size?: unknown;
  variantLabel?: unknown;
  threadColor?: unknown;
  backpackStraps?: unknown;
  beltSize?: unknown;
  beltUpgrade?: unknown;
  customBrandName?: unknown;
  repairCover?: unknown;
};

function s(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function int(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

// Q-XXXXXX. Excludes 0/O/1/I to avoid handwritten-vs-typed confusion.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateReference(): string {
  let out = "Q-";
  for (let i = 0; i < 6; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name     = s(body.name);
  const email    = s(body.email);
  const whatsapp = s(body.whatsapp);
  const country  = s(body.country);
  const address  = s(body.address);

  if (!name || !email || !whatsapp || !country || !address) {
    return NextResponse.json({ ok: false, error: "Name, email, phone, country and delivery address are required." }, { status: 400 });
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email looks invalid." }, { status: 400 });
  }
  if (!/[0-9].*[0-9].*[0-9].*[0-9]/.test(whatsapp)) {
    return NextResponse.json({ ok: false, error: "WhatsApp number looks invalid." }, { status: 400 });
  }

  const rawLines = Array.isArray(body.lines) ? (body.lines as LineIn[]) : [];
  if (rawLines.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty." }, { status: 400 });
  }

  const lines = rawLines.map((l) => ({
    productId: s(l.productId),
    slug: s(l.slug),
    name: s(l.name) ?? "(unnamed)",
    sku: s(l.sku),
    image: s(l.image),
    unitPriceIdr: Math.max(0, int(l.unitPriceIdr)),
    qty: Math.max(1, Math.min(99, int(l.qty) || 1)),
    size: s(l.size),
    variantLabel: s(l.variantLabel),
    threadColor: s(l.threadColor),
    backpackStraps: l.backpackStraps === true,
    beltSize: s(l.beltSize),
    beltUpgrade: s(l.beltUpgrade),
    customBrandName: s(l.customBrandName),
    repairCover: l.repairCover === true
  }));
  const subtotal_idr = lines.reduce((sum, l) => sum + l.unitPriceIdr * l.qty, 0);

  // Generate a reference and retry on the rare collision (unique constraint).
  let reference = generateReference();
  for (let attempt = 0; attempt < 3; attempt++) {
    const insert = await supabaseAdmin
      .from("hammerex_quote_requests")
      .insert({
        reference,
        buyer_name: name.slice(0, 120),
        buyer_email: email.slice(0, 160),
        buyer_whatsapp: whatsapp.slice(0, 40),
        buyer_country: country.slice(0, 80),
        buyer_address: address.slice(0, 1000),
        line_items: lines,
        subtotal_idr,
        status: "pending"
      })
      .select("id, reference")
      .single();
    if (!insert.error && insert.data) {
      return NextResponse.json({ ok: true, reference: insert.data.reference });
    }
    if (insert.error?.code !== "23505") {
      console.error("[api/quote-requests] insert failed:", insert.error);
      return NextResponse.json(
        { ok: false, error: `Could not save quote request: ${insert.error?.message ?? "unknown"}` },
        { status: 500 }
      );
    }
    reference = generateReference();
  }
  console.error("[api/quote-requests] reference collision exhausted retries");
  return NextResponse.json({ ok: false, error: "Could not allocate reference, please retry." }, { status: 500 });
}
