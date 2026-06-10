"use client";

const KEY = "hammerex_cart_v1";
const EVENT = "hammerex:cart";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPriceIdr: number;
  qty: number;
  size: string | null;
  baseCurrency: string;
};

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

function key(productId: string, size: string | null) {
  return `${productId}::${size ?? ""}`;
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
    const k = key(line.productId, line.size);
    const existing = lines.find((l) => key(l.productId, l.size) === k);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + line.qty);
    } else {
      lines.push({ ...line, qty: Math.max(1, line.qty) });
    }
    write(lines);
  },
  setQty(productId: string, size: string | null, qty: number) {
    const lines = read().map((l) =>
      key(l.productId, l.size) === key(productId, size)
        ? { ...l, qty: Math.max(1, Math.min(99, qty)) }
        : l
    );
    write(lines);
  },
  remove(productId: string, size: string | null) {
    write(read().filter((l) => key(l.productId, l.size) !== key(productId, size)));
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
