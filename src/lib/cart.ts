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
  // Belt-bearing variants (e.g. "Pouch + Leather Belt") require a waist size.
  // Must be part of the cart key so two beltSize choices for the same variant
  // don't silently merge into one line.
  beltSize?: string | null;
  // Custom branding — buyer's company name laser-printed onto the belt
  // holders. Included in the cart key so two different company orders for
  // the same belt line stay distinct.
  customBrandName?: string | null;
  // 3-Year Pro Repair Cover add-on (£15). Customer pays inbound + outbound
  // postage on any claim; we cover the repair labour + materials only.
  repairCover?: boolean;
  // Belt-set upgrade label (e.g. "Lanyard Leather Belt"). Replaces — does NOT
  // add to — the standard belt that ships with the set; the upcharge is
  // already baked into unitPriceIdr. Must be part of the cart key so two
  // different belt-upgrade choices for the same set stay distinct lines.
  beltUpgrade?: string | null;
};

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

function key(
  productId: string,
  size: string | null,
  threadColor: string | null,
  variantId: string | null,
  backpackStraps: boolean,
  beltSize: string | null = null,
  customBrandName: string | null = null,
  repairCover: boolean = false,
  beltUpgrade: string | null = null
) {
  return `${productId}::${size ?? ""}::${threadColor ?? ""}::${variantId ?? ""}::${backpackStraps ? "bp1" : "bp0"}::${beltSize ?? ""}::${customBrandName ?? ""}::${repairCover ? "rc1" : "rc0"}::${beltUpgrade ?? ""}`;
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
    const k = key(line.productId, line.size, line.threadColor, line.variantId, line.backpackStraps, line.beltSize ?? null, line.customBrandName ?? null, line.repairCover ?? false, line.beltUpgrade ?? null);
    const existing = lines.find(
      (l) => key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps, l.beltSize ?? null, l.customBrandName ?? null, l.repairCover ?? false, l.beltUpgrade ?? null) === k
    );
    if (existing) {
      existing.qty = Math.min(99, existing.qty + line.qty);
    } else {
      lines.push({ ...line, qty: Math.max(1, line.qty) });
    }
    write(lines);
  },
  setQty(
    productId: string,
    size: string | null,
    threadColor: string | null,
    variantId: string | null,
    backpackStraps: boolean,
    qty: number,
    beltSize: string | null = null,
    customBrandName: string | null = null,
    repairCover: boolean = false,
    beltUpgrade: string | null = null
  ) {
    const target = key(productId, size, threadColor, variantId, backpackStraps, beltSize, customBrandName, repairCover, beltUpgrade);
    const lines = read().map((l) =>
      key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps, l.beltSize ?? null, l.customBrandName ?? null, l.repairCover ?? false, l.beltUpgrade ?? null) === target
        ? { ...l, qty: Math.max(1, Math.min(99, qty)) }
        : l
    );
    write(lines);
  },
  remove(
    productId: string,
    size: string | null,
    threadColor: string | null,
    variantId: string | null,
    backpackStraps: boolean,
    beltSize: string | null = null,
    customBrandName: string | null = null,
    repairCover: boolean = false,
    beltUpgrade: string | null = null
  ) {
    const target = key(productId, size, threadColor, variantId, backpackStraps, beltSize, customBrandName, repairCover, beltUpgrade);
    write(read().filter((l) => key(l.productId, l.size, l.threadColor, l.variantId, l.backpackStraps, l.beltSize ?? null, l.customBrandName ?? null, l.repairCover ?? false, l.beltUpgrade ?? null) !== target));
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
