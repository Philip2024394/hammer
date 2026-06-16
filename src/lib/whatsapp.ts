import { formatPrice } from "./fx";
import type { CartLine } from "./cart";
import { threadColorLabel } from "./threadColor";
import {
  FLAT_SHIPPING_LABEL_GBP,
  TIER_1_SHIPPING_LABEL_GBP,
  TIER_2_THRESHOLD_IDR,
  shippingForSubtotal
} from "./shipping";

// Legacy alias retained for any older imports — only "air" is used now that
// shipping is a single flat fee. Anything new should just drop this entirely.
export type FreightChoice = "air";

export type QuoteInput = {
  lines: CartLine[];
  name: string;
  country: string;
  address: string;
  whatsapp: string;
  email: string;
};

export function buildQuoteMessage(input: QuoteInput): string {
  const items = input.lines.length
    ? input.lines.map((l) => {
        const variant = l.variantLabel && l.variantLabel !== "WELCOME GIFT" && l.variantLabel !== "DEAL BREAKER" ? ` — ${l.variantLabel}` : "";
        const size = l.size ? ` (${l.size})` : "";
        const thread = l.threadColor ? ` — Thread: ${threadColorLabel(l.threadColor)}` : "";
        const straps = l.backpackStraps ? " — + Backpack straps add-on" : "";
        const ref = l.sku ? ` [Ref ${l.sku}]` : "";
        const isGift = l.variantLabel === "WELCOME GIFT";
        const isDealBreaker = l.variantLabel === "DEAL BREAKER";
        const price = isGift
          ? "FREE — welcome gift 🎁"
          : l.baseCurrency && l.baseCurrency !== "IDR"
            ? formatPrice(l.unitPriceIdr, l.baseCurrency as any)
            : formatPrice(l.unitPriceIdr, "IDR");
        const suffix = isGift ? "" : isDealBreaker ? " each ⚡ Deal Breaker · 15% off" : " each";
        return `• ${l.qty}× ${l.name}${variant}${size}${thread}${straps}${ref} — ${price}${suffix}`;
      }).join("\n")
    : "(empty cart)";

  const subtotal = input.lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  const shipping = shippingForSubtotal(subtotal);
  const orderTotal = subtotal + shipping;
  const tier2Reached = subtotal >= TIER_2_THRESHOLD_IDR;
  const shippingLabel = tier2Reached
    ? `${FLAT_SHIPPING_LABEL_GBP} flat — UK / USA / AU`
    : `${TIER_1_SHIPPING_LABEL_GBP} small-parcel — UK / USA / AU`;

  return [
    "Hi Hammerex — confirming my order below.",
    "",
    "📦 Items:",
    items,
    "",
    "🚚 Shipping: EMS Air Mail (5–6 days transit worldwide)",
    "",
    `💰 Subtotal: ${formatPrice(subtotal, "IDR")}`,
    `📮 Shipping (${shippingLabel} · other countries confirmed below): ${formatPrice(shipping, "IDR")}`,
    `🧾 Order total: ${formatPrice(orderTotal, "IDR")}`,
    "",
    "👤 Customer details:",
    `Name: ${input.name}`,
    `Country: ${input.country}`,
    `Address: ${input.address}`,
    `WhatsApp: ${input.whatsapp}`,
    `Email: ${input.email}`,
    "",
    "Please confirm shipping (if I'm outside UK / USA / AU) and send the payment instructions — thank you."
  ].join("\n");
}

export function quoteUrl(message: string, target: string): string {
  const digits = target.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function adminWhatsapp(): string {
  return process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP ?? "+6281392000050";
}
