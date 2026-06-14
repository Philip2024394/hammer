import { formatPrice } from "./fx";
import type { CartLine } from "./cart";
import { threadColorLabel } from "./threadColor";

export type FreightChoice = "sea" | "air";

const FREIGHT_LABEL: Record<FreightChoice, string> = {
  sea: "Sea freight (4–6 weeks transit · most economical)",
  air: "Air freight (5–6 days transit worldwide)"
};

export type QuoteInput = {
  lines: CartLine[];
  freight: FreightChoice;
  name: string;
  country: string;
  address: string;
  whatsapp: string;
  email: string;
};

export function buildQuoteMessage(input: QuoteInput): string {
  const items = input.lines.length
    ? input.lines.map((l) => {
        const variant = l.variantLabel && l.variantLabel !== "WELCOME GIFT" ? ` — ${l.variantLabel}` : "";
        const size = l.size ? ` (${l.size})` : "";
        const thread = l.threadColor ? ` — Thread: ${threadColorLabel(l.threadColor)}` : "";
        const straps = l.backpackStraps ? " — + Backpack straps add-on" : "";
        const ref = l.sku ? ` [Ref ${l.sku}]` : "";
        const isGift = l.variantLabel === "WELCOME GIFT";
        const price = isGift
          ? "FREE — welcome gift 🎁"
          : l.baseCurrency && l.baseCurrency !== "IDR"
            ? formatPrice(l.unitPriceIdr, l.baseCurrency as any)
            : formatPrice(l.unitPriceIdr, "IDR");
        const suffix = isGift ? "" : " each";
        return `• ${l.qty}× ${l.name}${variant}${size}${thread}${straps}${ref} — ${price}${suffix}`;
      }).join("\n")
    : "(empty cart)";

  const subtotal = input.lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);

  return [
    "Hi Hammerex — please quote my delivery.",
    "",
    "📦 Items:",
    items,
    "",
    `🚚 Freight: ${FREIGHT_LABEL[input.freight]}`,
    "",
    `💰 Subtotal (excl. delivery): ${formatPrice(subtotal, "IDR")}`,
    "",
    "👤 Customer details:",
    `Name: ${input.name}`,
    `Country: ${input.country}`,
    `Address: ${input.address}`,
    `WhatsApp: ${input.whatsapp}`,
    `Email: ${input.email}`,
    "",
    "Please confirm a delivery price and total — thank you."
  ].join("\n");
}

export function quoteUrl(message: string, target: string): string {
  const digits = target.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function adminWhatsapp(): string {
  return process.env.NEXT_PUBLIC_HAMMEREX_WHATSAPP ?? "+6281392000050";
}
