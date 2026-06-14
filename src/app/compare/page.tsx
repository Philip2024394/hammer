"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { compare } from "@/lib/compare";
import {
  supabase,
  type HammerexProduct,
  type HammerexProductSpec
} from "@/lib/supabase";
import { formatPrice } from "@/lib/fx";

type Loaded = { product: HammerexProduct; specs: HammerexProductSpec[] };

export default function ComparePage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [rows, setRows] = useState<Loaded[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSlugs(compare.read());
    sync();
    setReady(true);
    return compare.subscribe(sync);
  }, []);

  useEffect(() => {
    if (slugs.length === 0) {
      setRows([]);
      return;
    }
    (async () => {
      const prodRes = await supabase.from("hammerex_products").select("*").in("slug", slugs);
      const products = (prodRes.data ?? []) as HammerexProduct[];
      const ids = products.map((p) => p.id);
      const specsRes = await supabase
        .from("hammerex_product_specs")
        .select("*")
        .in("product_id", ids)
        .order("sort_order");
      const allSpecs = (specsRes.data ?? []) as HammerexProductSpec[];
      const byId = new Map<string, HammerexProductSpec[]>();
      for (const s of allSpecs) {
        const arr = byId.get(s.product_id) ?? [];
        arr.push(s);
        byId.set(s.product_id, arr);
      }
      const lookup = new Map<string, Loaded>();
      for (const p of products) {
        lookup.set(p.slug ?? "", { product: p, specs: byId.get(p.id) ?? [] });
      }
      setRows(slugs.map((s) => lookup.get(s)).filter((x): x is Loaded => Boolean(x)));
    })();
  }, [slugs]);

  // Build a unified list of all spec labels seen across the compared products,
  // grouped by group_name preserving DB sort order.
  const groupedLabels = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    const groupOrder: string[] = [];
    for (const r of rows) {
      for (const s of r.specs) {
        if (!groups.has(s.group_name)) {
          groups.set(s.group_name, new Set());
          groupOrder.push(s.group_name);
        }
        groups.get(s.group_name)!.add(s.label);
      }
    }
    return groupOrder.map((g) => ({ group: g, labels: [...(groups.get(g) ?? [])] }));
  }, [rows]);

  return (
    <main className="pb-32">
      <Header />
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-text">Compare products</h1>
          {slugs.length > 0 && (
            <button
              type="button"
              onClick={() => compare.clear()}
              className="rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:border-red-500/60 hover:text-red-300"
            >Clear all</button>
          )}
        </div>

        {ready && slugs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">Nothing to compare yet.</p>
            <p className="mt-1 text-xs text-brand-muted">Tap the three-line icon on any product card to add it here (up to 3).</p>
            <a href="/" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90">Browse products</a>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-brand-bg text-left text-brand-muted" />
                  {rows.map((r) => (
                    <th key={r.product.id} className="p-2 text-left align-top">
                      <a href={`/product/${r.product.slug}`} className="block">
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-black">
                          {r.product.image_url && (
                            <img src={r.product.image_url} alt={r.product.name} className="h-full w-full object-contain" />
                          )}
                        </div>
                        <div className="mt-2 text-sm font-bold text-brand-text hover:text-brand-accent">{r.product.name}</div>
                        <div className="text-brand-accent">{formatPrice(r.product.price_idr, (r.product.base_currency as any) ?? "IDR")}</div>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedLabels.map((g) => (
                  <Fragment key={`g-${g.group}`}>
                    <tr>
                      <td colSpan={rows.length + 1} className="bg-brand-surface px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">{g.group}</td>
                    </tr>
                    {g.labels.map((label) => (
                      <tr key={`g-${g.group}-${label}`} className="border-b border-brand-line">
                        <td className="sticky left-0 z-10 bg-brand-bg p-2 font-semibold text-brand-muted">{label}</td>
                        {rows.map((r) => {
                          const v = r.specs.find((s) => s.group_name === g.group && s.label === label);
                          return (
                            <td key={r.product.id + label + g.group} className="border-l border-brand-line p-2 text-brand-text">
                              {v?.value ?? <span className="text-brand-muted">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
