import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { ProductRow } from "@/components/ProductRow";
import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { logSearchQuery } from "@/lib/track";
import { cookies, headers } from "next/headers";
import { HX_COUNTRY_COOKIE } from "@/lib/geo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  alternates: { canonical: "/search" }
};

// Case-insensitive substring search across product name, subtitle and SKU.
// Postgres ILIKE pattern uses % wildcards; the Supabase `.or()` filter strings
// each condition with comma separators. A %-escape on the user input keeps it
// safe from operator injection.
async function searchProducts(q: string): Promise<HammerexProduct[]> {
  const term = q.trim();
  if (!term) return [];
  const safe = term.replace(/[%,]/g, " ");
  const filter = `name.ilike.%${safe}%,subtitle.ilike.%${safe}%,sku.ilike.%${safe}%`;
  // hide_from_upsell doubles as a generic "exclude from discovery" flag —
  // applied here so non-canonical products (e.g. Scaffolders Gloves, Glove
  // Clip when "leather work gloves" is the canonical hit) don't pollute
  // a buyer's results when they search a generic category word.
  const res = await supabase
    .from("hammerex_products")
    .select("*")
    .or(filter)
    .eq("hide_from_upsell", false)
    .order("is_featured", { ascending: false })
    .order("rating_count", { ascending: false, nullsFirst: false })
    .limit(60);
  return (res.data ?? []) as HammerexProduct[];
}

async function loadCategoriesById() {
  const res = await supabase
    .from("hammerex_categories")
    .select("id, slug, name");
  const m = new Map<string, { slug: string; name: string }>();
  for (const c of (res.data ?? []) as HammerexCategory[]) {
    m.set(c.id, { slug: c.slug, name: c.name });
  }
  return m;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query ? await searchProducts(query) : [];

  if (query) {
    const c = await cookies();
    const h = await headers();
    const country =
      c.get(HX_COUNTRY_COOKIE)?.value?.toUpperCase() ||
      h.get("x-vercel-ip-country")?.toUpperCase() ||
      h.get("cf-ipcountry")?.toUpperCase() ||
      null;
    await logSearchQuery({ q: query, results_count: products.length, country });
  }

  const cats = await loadCategoriesById();
  const items = products.map((p) => ({
    ...p,
    category: p.category_id ? cats.get(p.category_id) ?? null : null
  })) as HammerexProduct[];

  return (
    <main className="pb-12">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-text sm:text-3xl">
          Search
        </h1>
        {query ? (
          <p className="mt-2 text-sm text-brand-muted">
            <span className="font-bold text-brand-text">{items.length}</span>{" "}
            result{items.length === 1 ? "" : "s"} for{" "}
            <span className="font-semibold text-brand-accent">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-brand-muted">
            Type into the search box at the top of the page and press enter.
          </p>
        )}
      </section>

      {query && items.length > 0 && (
        <ProductRow items={items} title="" hideHeader />
      )}

      {query && items.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="text-sm font-semibold text-brand-text">No products match that search.</p>
            <p className="mt-2 text-xs text-brand-muted">
              Try a shorter term (e.g. &ldquo;trowel&rdquo; instead of &ldquo;plastering trowel
              18 inch&rdquo;), or browse the trade categories from the menu.
            </p>
            <a
              href="/"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-widest text-black transition active:scale-95 hover:opacity-90"
            >
              Browse trades
            </a>
          </div>
        </section>
      )}

      <DeliveryFooter />
    </main>
  );
}
