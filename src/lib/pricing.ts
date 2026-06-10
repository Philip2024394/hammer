export type QtyTier = { min: number; pct: number };

export function effectivePricePerUnit(basePrice: number, tiers: QtyTier[], qty: number): number {
  const applicable = [...tiers].sort((a, b) => b.min - a.min).find((t) => qty >= t.min);
  if (!applicable) return basePrice;
  return Math.round(basePrice * (1 - applicable.pct / 100));
}

export function nextTier(tiers: QtyTier[], qty: number): QtyTier | null {
  return [...tiers].sort((a, b) => a.min - b.min).find((t) => t.min > qty) ?? null;
}

export function bundlePricing(itemPricesIdr: number[], discountPct: number) {
  const original = itemPricesIdr.reduce((s, p) => s + p, 0);
  const final = Math.round(original * (1 - discountPct / 100));
  return { original, final, savings: original - final };
}
