"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { wishlist } from "@/lib/wishlist";
import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { ProductRow } from "@/components/ProductRow";
import { useCountry } from "@/components/CountryProvider";

export default function SavedPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<HammerexProduct[]>([]);
  const [ready, setReady] = useState(false);
  const country = useCountry();

  useEffect(() => {
    const sync = () => setSlugs(wishlist.read());
    sync();
    setReady(true);
    return wishlist.subscribe(sync);
  }, []);

  useEffect(() => {
    if (slugs.length === 0) {
      setProducts([]);
      return;
    }
    (async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("hammerex_products").select("*").in("slug", slugs),
        supabase.from("hammerex_categories").select("id, slug, name")
      ]);
      const cats = new Map<string, { slug: string; name: string }>();
      for (const c of (catRes.data ?? []) as HammerexCategory[]) {
        cats.set(c.id, { slug: c.slug, name: c.name });
      }
      const lookup = new Map<string, HammerexProduct>();
      for (const p of (prodRes.data ?? []) as HammerexProduct[]) {
        lookup.set(p.slug ?? "", { ...p, category: p.category_id ? cats.get(p.category_id) ?? null : null });
      }
      setProducts(slugs.map((s) => lookup.get(s)).filter((x): x is HammerexProduct => Boolean(x)));
    })();
  }, [slugs]);

  return (
    <main className="pb-12">
      <Header />
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-text">Saved products</h1>
          {slugs.length > 0 && (
            <button
              type="button"
              onClick={() => wishlist.clear()}
              className="rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:border-red-500/60 hover:text-red-300"
            >Clear all</button>
          )}
        </div>

        {ready && slugs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">No saved products yet.</p>
            <p className="mt-1 text-xs text-brand-muted">Tap the heart on any product to save it here. Survives across visits.</p>
            <a href="/" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90">Browse products</a>
          </div>
        )}
      </section>

      {products.length > 0 && <ProductRow items={products} hideHeader country={country} />}
    </main>
  );
}
