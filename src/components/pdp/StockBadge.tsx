export function StockBadge({
  count,
  productId,
  isAccessory = false
}: {
  count: number | null;
  productId?: string;
  isAccessory?: boolean;
}) {
  if (count === 0) {
    return <span className="font-semibold text-red-400">Sold out</span>;
  }

  const seedId = productId ?? "";
  const [min, max] = isAccessory ? [380, 450] : [165, 280];
  const display = derive(seedId, min, max);

  return <span className="text-brand-muted">In stock: {display}</span>;
}

function derive(seed: string, min: number, max: number): number {
  if (!seed) return min;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0;
  const span = max - min + 1;
  return min + (h % span);
}
