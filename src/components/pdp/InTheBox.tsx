import type { HammerexWhatInBox } from "@/lib/supabase";

export function InTheBox({ items }: { items: HammerexWhatInBox[] }) {
  if (!items.length) return null;
  return (
    <section id="in-the-box" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-lg font-semibold text-brand-text">In the box</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((b) => (
            <li key={b.id} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
              <div className="aspect-square overflow-hidden bg-black">
                {b.image_url && <img src={b.image_url} alt={b.label} className="h-full w-full object-cover" />}
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs font-medium text-brand-text">{b.label}</span>
                {b.qty > 1 && <span className="text-xs text-brand-muted">× {b.qty}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
