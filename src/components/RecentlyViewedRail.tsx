"use client";

import { useEffect, useState } from "react";
import { recentlyViewed } from "@/lib/recentlyViewed";
import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { ProductRow } from "./ProductRow";

export function RecentlyViewedRail() {
  const [products, setProducts] = useState<HammerexProduct[]>([]);

  useEffect(() => {
    const slugs = recentlyViewed.read();
    if (slugs.length === 0) return;
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
      setProducts(slugs.map((s) => lookup.get(s)).filter((x): x is HammerexProduct => Boolean(x)).slice(0, 6));
    })();
  }, []);

  if (products.length === 0) return null;
  return <ProductRow items={products} title="Recently viewed" viewAllHref="/" />;
}
