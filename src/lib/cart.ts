"use client";

const KEY = "hammerex_cart_v1";
const EVENT = "hammerex:cart";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  sku: string | null;
  image: string | null;
  unitPriceIdr: number;
  qty: number;
  size: string | null;
  baseCurrency: string;
  threadColor: string | null;
  variantId: string | null;
  variantLabel: string | null;
  backpackStraps: boolean;
  // Optional per-unit shipping override (IDR). If set, this line contributes
  // qty × shippingPerUnitIdr to the cart's shipping total instead of falling
  // back to the tier-based shippingForSubtotal model.
  shippingPerUnitIdr?: number | null;
};

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

function key(productId: string, size: string | null, threadColor: string | null, variantId: string | null, backpackStraps: boolean) {
  return `${productId}::${size ?? ""}::${threadColor ?? ""}::${variantId ?? ""}::${backpackStraps ? "bp1" : "bp0"}`;
}

export const cart = {
  read,
  count(): number {
    return read().reduce((s, l) => s + l.qty, 0);
  },
  subtotalIdr(): number {
    return read().reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);
  },
  add(line: CartLine) {
    const lines = read();
    const k = key(line.productId, line.size, line.threadColor, line.variantId, line.backpackStraps);
    const existing = lines.find((l) => key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps) === k);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + line.qty);
    } else {
      lines.push({ ...line, qty: Math.max(1, line.qty) });
    }
    write(lines);
  },
  setQty(productId: string, size: string | null, threadColor: string | null, variantId: string | null, backpackStraps: boolean, qty: number) {
    const lines = read().map((l) =>
      key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps) === key(productId, size, threadColor, variantId, backpackStraps)
        ? { ...l, qty: Math.max(1, Math.min(99, qty)) }
        : l
    );
    write(lines);
  },
  remove(productId: string, size: string | null, threadColor: string | null, variantId: string | null, backpackStraps: boolean) {
    write(read().filter((l) => key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps) !== key(productId, size, threadColor, variantId, backpackStraps)));
  },
  clear() {
    write([]);
  },
  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }
};
