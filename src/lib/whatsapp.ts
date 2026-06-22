import { formatPrice } from "./fx";
import type { CartLine } from "./cart";
import { threadColorLabel } from "./threadColor";

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
        const belt = l.beltSize ? ` — Belt: ${l.beltSize}` : "";
        const thread = l.threadColor ? ` — Thread: ${threadColorLabel(l.threadColor)}` : "";
        const straps = l.backpackStraps ? " — + Backpack straps add-on" : "";
        const branding = l.customBrandName ? ` — Branded: "${l.customBrandName}" (artwork to follow on WhatsApp)` : "";
        const cover = l.repairCover ? " — + Hammerex Pro Trade Cover" : "";
        const beltUp = l.beltUpgrade ? ` — Belt upgrade: ${l.beltUpgrade}` : "";
        const ref = l.sku ? ` [Ref ${l.sku}]` : "";
        const isGift = l.variantLabel === "WELCOME GIFT";
        const isDealBreaker = l.variantLabel === "DEAL BREAKER";
        const price = isGift
          ? "FREE — welcome gift 🎁"
          : l.baseCurrency && l.baseCurrency !== "IDR"
            ? formatPrice(l.unitPriceIdr, l.baseCurrency as any)
            : formatPrice(l.unitPriceIdr, "IDR");
        const suffix = isGift ? "" : isDealBreaker ? " each ⚡ Deal Breaker · 15% off" : " each";
        return `• ${l.qty}× ${l.name}${variant}${size}${belt}${thread}${straps}${branding}${cover}${beltUp}${ref} — ${price}${suffix}`;
      }).join("\n")
    : "(empty cart)";

  const subtotal = input.lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);

  return [
    "Hi Hammerex — please quote my delivery for the order below.",
    "",
    "📦 Items:",
    items,
    "",
    `💰 Items subtotal: ${formatPrice(subtotal, "IDR")}`,
    "🚚 Delivery: to be priced by the Hammerex team within 24 hours as a single package (best rate, not per item).",
    "",
    "👤 Customer details:",
    `Name: ${input.name}`,
    `Country: ${input.country}`,
    `Address: ${input.address}`,
    `WhatsApp: ${input.whatsapp}`,
    `Email: ${input.email}`,
    "",
    "Please send the delivery quote and payment instructions — thank you."
  ].join("\n");
}

export function quoteUrl(message: string, target: string): string {
  const digits = target.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function adminWhatsapp(): string {
  return process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP ?? "+6281392000050";
}
