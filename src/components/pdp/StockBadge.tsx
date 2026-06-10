export function StockBadge({ count }: { count: number | null }) {
  if (count == null) return null;
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        Sold out
      </span>
    );
  }
  if (count <= 10) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
        </span>
        Only {count} left in stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      In stock — ships fast
    </span>
  );
}
