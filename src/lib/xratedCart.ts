// Xrated Shop Mode — localStorage cart helpers.
//
// Per-tradesperson scoped so visiting two different tradies on the
// same device never merges their carts. The cart is never sent to a
// server — the customer composes a WhatsApp enquiry from it and the
// tradesperson confirms the final price separately.

export type CartItem = {
  product_id: string;
  name: string;
  price_pence: number;
  cover_url: string | null;
  qty: number;
  added_at: string;
  // Optional pricing unit for service-mode items ("per hour", "per tree",
  // "per sqm" …). When set the cart + WhatsApp composer append it after
  // the price so the line reads "£23.00 per tree × 2". Null/undefined for
  // physical Shop Mode products — they price by item, no unit suffix.
  unit?: string | null;
};

export type CartState = {
  listing_slug: string;
  items: CartItem[];
};

const STORAGE_VERSION = "v1";
const QTY_MAX = 99;

function cartKey(slug: string): string {
  return `xrated_cart_${STORAGE_VERSION}::${slug}`;
}

function emptyState(slug: string): CartState {
  return { listing_slug: slug, items: [] };
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty) || qty < 1) return 1;
  if (qty > QTY_MAX) return QTY_MAX;
  return Math.floor(qty);
}

export function readCart(slug: string): CartState {
  if (typeof window === "undefined") return emptyState(slug);
  try {
    const raw = window.localStorage.getItem(cartKey(slug));
    if (!raw) return emptyState(slug);
    const parsed = JSON.parse(raw) as CartState | null;
    if (!parsed || !Array.isArray(parsed.items)) return emptyState(slug);
    // Defensive normalisation — strip any malformed rows so a corrupted
    // localStorage entry never crashes the cart page.
    const items: CartItem[] = parsed.items
      .filter(
        (it) =>
          it &&
          typeof it.product_id === "string" &&
          typeof it.name === "string" &&
          typeof it.price_pence === "number"
      )
      .map((it) => ({
        product_id: it.product_id,
        name: it.name,
        price_pence: it.price_pence,
        cover_url: it.cover_url ?? null,
        qty: clampQty(typeof it.qty === "number" ? it.qty : 1),
        added_at: typeof it.added_at === "string" ? it.added_at : new Date().toISOString(),
        unit:
          typeof it.unit === "string" && it.unit.trim().length > 0
            ? it.unit.trim()
            : null
      }));
    return { listing_slug: slug, items };
  } catch {
    return emptyState(slug);
  }
}

export function writeCart(state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cartKey(state.listing_slug), JSON.stringify(state));
    // Notify same-tab listeners — the native `storage` event only fires
    // across tabs, so the floating cart island won't re-render after an
    // add otherwise.
    window.dispatchEvent(
      new CustomEvent("xrated-cart-change", { detail: { slug: state.listing_slug } })
    );
  } catch {
    // Quota / private-mode failure — silently no-op. The cart UI still
    // works for the current page render; only persistence is lost.
  }
}

export function addItem(
  slug: string,
  item: Omit<CartItem, "qty" | "added_at"> & { qty?: number }
): CartState {
  const state = readCart(slug);
  const qtyToAdd = clampQty(item.qty ?? 1);
  const existing = state.items.find((it) => it.product_id === item.product_id);
  if (existing) {
    existing.qty = clampQty(existing.qty + qtyToAdd);
  } else {
    state.items.push({
      product_id: item.product_id,
      name: item.name,
      price_pence: item.price_pence,
      cover_url: item.cover_url ?? null,
      qty: qtyToAdd,
      added_at: new Date().toISOString(),
      unit:
        typeof item.unit === "string" && item.unit.trim().length > 0
          ? item.unit.trim()
          : null
    });
  }
  writeCart(state);
  return state;
}

export function setQty(slug: string, product_id: string, qty: number): CartState {
  const state = readCart(slug);
  const clamped = clampQty(qty);
  const next = state.items.map((it) =>
    it.product_id === product_id ? { ...it, qty: clamped } : it
  );
  const out: CartState = { listing_slug: slug, items: next };
  writeCart(out);
  return out;
}

export function removeItem(slug: string, product_id: string): CartState {
  const state = readCart(slug);
  const out: CartState = {
    listing_slug: slug,
    items: state.items.filter((it) => it.product_id !== product_id)
  };
  writeCart(out);
  return out;
}

export function clearCart(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(cartKey(slug));
    window.dispatchEvent(
      new CustomEvent("xrated-cart-change", { detail: { slug } })
    );
  } catch {
    // ignore
  }
}

export function cartTotalPence(state: CartState): number {
  return state.items.reduce((acc, it) => acc + it.price_pence * it.qty, 0);
}

export function cartItemCount(state: CartState): number {
  return state.items.reduce((acc, it) => acc + it.qty, 0);
}

export function formatGbp(pence: number): string {
  const pounds = pence / 100;
  return `£${pounds.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
