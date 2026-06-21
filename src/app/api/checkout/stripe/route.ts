// POST /api/checkout/stripe
// Creates a Stripe Checkout Session for the buyer's current cart. Uses
// `payment_intent_data.capture_method: manual` so the card is *authorized*
// at checkout but not *captured* until the admin marks the order
// dispatched (see /api/admin/orders/[id]/capture). That's the operational
// buffer that lets you batch dispatches without holding the buyer's money.

import { NextResponse, type NextRequest } from "next/server";
import { STRIPE_ENABLED, getStripe, idrToGbpPence } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/seo";

// CartLine subset the client posts. We don't accept the unit price from the
// client (security) — we re-read each product's current price_idr from
// Supabase server-side before computing the Stripe line items.
type ClientCartLine = {
  productId: string;
  qty: number;
  size?: string | null;
  variantLabel?: string | null;
  beltSize?: string | null;
  threadColor?: string | null;
  customBrandName?: string | null;
  repairCover?: boolean;
  beltUpgrade?: string | null;
  backpackStraps?: boolean;
};

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { error: "Stripe checkout is not enabled on this deployment." },
      { status: 503 }
    );
  }

  let body: { lines: ClientCartLine[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Re-read each product from DB so the buyer can't tamper with prices.
  const productIds = Array.from(new Set(body.lines.map((l) => l.productId)));
  const prodRes = await supabase
    .from("hammerex_products")
    .select("id, name, slug, price_idr, image_url, shipping_per_unit_idr")
    .in("id", productIds);
  if (prodRes.error) {
    return NextResponse.json({ error: prodRes.error.message }, { status: 500 });
  }
  const byId = new Map((prodRes.data ?? []).map((p) => [p.id, p]));

  // Gate this checkout to free-UK products only (the hybrid model agreed
  // with the owner: cold UK retail flows through Stripe, B2B / non-UK
  // stays on WhatsApp).
  for (const l of body.lines) {
    const p = byId.get(l.productId);
    if (!p) {
      return NextResponse.json(
        { error: `Product ${l.productId} not found.` },
        { status: 400 }
      );
    }
    if (p.shipping_per_unit_idr !== 0) {
      return NextResponse.json(
        {
          error:
            "Pay-now checkout is only available on free-UK-delivery products at this stage."
        },
        { status: 400 }
      );
    }
  }

  const lineItems = body.lines.map((l) => {
    const p = byId.get(l.productId)!;
    const description = [
      l.variantLabel,
      l.size && `Size ${l.size}`,
      l.beltSize && `Belt ${l.beltSize}`,
      l.threadColor && `Thread ${l.threadColor}`,
      l.beltUpgrade && `Belt upgrade: ${l.beltUpgrade}`,
      l.customBrandName && `Branded: "${l.customBrandName}"`,
      l.repairCover && "+ Hammerex Pro Trade Cover",
      l.backpackStraps && "+ Backpack straps"
    ].filter(Boolean).join(" · ") || undefined;

    return {
      price_data: {
        currency: "gbp",
        product_data: {
          name: p.name,
          description,
          images: p.image_url ? [p.image_url] : undefined
        },
        unit_amount: idrToGbpPence(p.price_idr)
      },
      quantity: Math.max(1, Math.min(99, l.qty))
    };
  });

  const stripe = getStripe();
  const origin = siteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    // Authorize now, capture on dispatch — preserves the operational
    // buffer the owner needs to batch.
    payment_intent_data: {
      capture_method: "manual",
      description: "Hammerex order — authorised, captured on dispatch."
    },
    shipping_address_collection: { allowed_countries: ["GB"] },
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60 // 30 min
  });

  // Persist a pending order row so the admin dashboard can see it the
  // moment the buyer hits the Stripe-hosted page (webhook will flip
  // status → authorized on completion).
  const subtotalPence = lineItems.reduce(
    (s, l) => s + l.price_data.unit_amount * l.quantity,
    0
  );
  await supabase.from("hammerex_orders").insert({
    stripe_session_id: session.id,
    line_items: body.lines,
    currency: "GBP",
    subtotal_pence: subtotalPence,
    shipping_pence: 0,
    total_pence: subtotalPence,
    status: "pending"
  });

  return NextResponse.json({ url: session.url });
}
