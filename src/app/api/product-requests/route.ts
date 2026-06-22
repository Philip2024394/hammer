// POST /api/product-requests
// JSON body from the ProductRequestModal ("Submit your project" /
// out-of-stock / custom-spec enquiry). Inserts into
// hammerex_product_requests as status='pending' and returns the public
// reference (P-XXXXXX). Distinct from /api/quote-requests — no cart
// snapshot, just qty + free-text project details.

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function s(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateReference(): string {
  let out = "P-";
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
  const phone    = s(body.phone);
  const country  = s(body.country);
  const quantity = s(body.quantity);
  const details  = s(body.details);

  if (!name || !email || !phone || !country || !quantity || !details) {
    return NextResponse.json(
      { ok: false, error: "Name, email, phone, country, quantity and project details are all required." },
      { status: 400 }
    );
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email looks invalid." }, { status: 400 });
  }
  if (!/[0-9].*[0-9].*[0-9].*[0-9]/.test(phone)) {
    return NextResponse.json({ ok: false, error: "Phone number looks invalid." }, { status: 400 });
  }

  let reference = generateReference();
  for (let attempt = 0; attempt < 3; attempt++) {
    const insert = await supabaseAdmin
      .from("hammerex_product_requests")
      .insert({
        reference,
        buyer_name: name.slice(0, 120),
        buyer_email: email.slice(0, 160),
        buyer_phone: phone.slice(0, 40),
        buyer_country: country.slice(0, 80),
        quantity: quantity.slice(0, 80),
        details: details.slice(0, 4000),
        status: "pending"
      })
      .select("id, reference")
      .single();
    if (!insert.error && insert.data) {
      return NextResponse.json({ ok: true, reference: insert.data.reference });
    }
    if (insert.error?.code !== "23505") {
      console.error("[api/product-requests] insert failed:", insert.error);
      return NextResponse.json(
        { ok: false, error: `Could not save request: ${insert.error?.message ?? "unknown"}` },
        { status: 500 }
      );
    }
    reference = generateReference();
  }
  console.error("[api/product-requests] reference collision exhausted retries");
  return NextResponse.json({ ok: false, error: "Could not allocate reference, please retry." }, { status: 500 });
}
