// Bespoke scaffolding shop page. Takes priority over the generic
// /c/[slug] route by virtue of being a static segment.
//
// Layout:
//   - CategoryHero (shared with other trades)
//   - Sticky tab bar (Scaffolding Belts / Products / Holders & Tools / Work Wear)
//   - Landscape product grid filtered by the active tab
//
// Tabs drive the URL via ?tab=... so each filter is shareable, and the
// page is fully server-rendered with no client-side filtering — keeps SEO
// healthy and avoids hydration mismatch.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductRow } from "@/components/ProductRow";
import { CategoryHero } from "@/components/CategoryHero";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { supabase, type HammerexCategory, type HammerexProduct } from "@/lib/supabase";
import { absolute, breadcrumbJsonLd, BRAND } from "@/lib/seo";
import { ScaffoldingTabs } from "./Tabs";
import { SCAFFOLDING_TABS, resolveScaffoldingTab, type ScaffoldingTabId } from "./tabsConfig";

export const dynamic = "force-dynamic";

// Hand-curated belt-body slugs in the scaffolding category. These appear
// in the "Belts" tab; everything else in the scaffolding category falls
// into "Tool Holders & Tools" (spanner holders, lanyards, carabiner,
// inspection cards, bubble-level holder, etc.). Keeping this as a slug
// list (rather than a name-LIKE match) so accessory products with "belt"
// in their name — e.g. "3 Spanner Belt Holder" — don't pollute the belts
// grid.
const SCAFFOLDING_BELT_SLUGS = new Set([
  "forgex-7-station-scaffolders-belt",
  "scaffolders-apex-7-station-tool-belt",
  "scaffolders-belt-trox",
  "scaffolders-tool-belt",
  "leather-scaffolding-belt-tilted-ratchet-frog-holder",
  "heavy-duty-leather-tool-belt",
  "scaffolders-setup-kit"
]);

// Display priority for the Belts tab. Sets/kits come first (they're the
// "I want everything" pick — flagship sets at the top, then individual
// belt bodies). Slugs not in this list fall to the end in name order.
const BELTS_TAB_ORDER: string[] = [
  // Sets / kits first
  "scaffolders-setup-kit",            // Scaffolders RESOLVE Belt Set
  "heavy-duty-leather-tool-belt",     // Heavy Duty Leather Tool Belt Set
  // Individual scaffolding belt bodies
  "forgex-7-station-scaffolders-belt",
  "scaffolders-apex-7-station-tool-belt",
  "scaffolders-belt-trox",
  "scaffolders-tool-belt",
  "leather-scaffolding-belt-tilted-ratchet-frog-holder",
  // Individual standalone belts + supports
  "leather-tool-belt-2-inch",         // Hammerex 2" Heavy Duty Leather Work Belt
  "lanyard-safety-belt",
  "fast-clip-work-belt",
  "4-inch-belt-support",
  "padded-belt-support-system"        // Padded system sits with the supports
];
const BELTS_TAB_RANK = new Map(BELTS_TAB_ORDER.map((s, i) => [s, i]));

// Tool-holder categories that join the scaffolding holders/tools tab.
// Limited to the categories the owner specified: tape holders + hammer
// holders. Scaffolding-category accessories are merged in below.
const HOLDERS_TOOLS_CATS = ["tape-holders", "hammer-holders"];

const WORKWEAR_CATS = ["aprons-workwear", "gloves-ppe"];

async function loadCategoriesById() {
  const res = await supabase.from("hammerex_categories").select("id, slug, name");
  const m = new Map<string, { id: string; slug: string; name: string }>();
  for (const c of (res.data ?? []) as { id: string; slug: string; name: string }[]) {
    m.set(c.id, c);
  }
  return m;
}

async function loadProductsForTab(tab: ScaffoldingTabId): Promise<HammerexProduct[]> {
  const catsById = await loadCategoriesById();
  const slugToId = new Map<string, string>();
  for (const c of catsById.values()) slugToId.set(c.slug, c.id);

  const stamp = (p: HammerexProduct, fallbackSlug?: string): HammerexProduct => ({
    ...p,
    category: p.category_id
      ? (catsById.get(p.category_id) ?? null)
      : (fallbackSlug ? { id: "", slug: fallbackSlug, name: fallbackSlug } : null)
  });

  if (tab === "belts") {
    const beltsId = slugToId.get("belts");
    if (!beltsId) return [];
    // Belts in the dedicated belts category…
    const beltsCatRes = await supabase
      .from("hammerex_products")
      .select("*")
      .eq("category_id", beltsId)
      .order("home_sort_order", { ascending: true })
      .order("name");
    // …plus the hand-curated scaffolding-category belt bodies.
    const scaffBeltsRes = await supabase
      .from("hammerex_products")
      .select("*")
      .in("slug", Array.from(SCAFFOLDING_BELT_SLUGS))
      .order("home_sort_order", { ascending: true })
      .order("name");
    const rows = [
      ...((beltsCatRes.data ?? []) as HammerexProduct[]),
      ...((scaffBeltsRes.data ?? []) as HammerexProduct[])
    ];
    // De-dupe (same product could appear in both result sets if its
    // category is `belts` AND its slug is in the curated list).
    const seen = new Set<string>();
    const deduped = rows.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
    // Hand-curated display order: sets/kits first, then individual belt
    // bodies. Anything not in the order list falls to the end in name order.
    const TAIL = BELTS_TAB_ORDER.length + 1;
    deduped.sort((a, b) => {
      const ra = BELTS_TAB_RANK.get(a.slug ?? "") ?? TAIL;
      const rb = BELTS_TAB_RANK.get(b.slug ?? "") ?? TAIL;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    return deduped.map((p) => stamp(p));
  }

  if (tab === "products") {
    const scaffId = slugToId.get("scaffolding");
    if (!scaffId) return [];
    const res = await supabase
      .from("hammerex_products")
      .select("*")
      .eq("category_id", scaffId)
      .order("home_sort_order", { ascending: true })
      .order("name");
    return ((res.data ?? []) as HammerexProduct[]).map((p) => stamp(p));
  }

  if (tab === "holders-tools") {
    const scaffId = slugToId.get("scaffolding");
    const holderIds = HOLDERS_TOOLS_CATS.map((s) => slugToId.get(s)).filter((s): s is string => Boolean(s));
    // Scaffolding-category items that aren't belts (spanners, lanyards,
    // carabiners, holders, inspection cards, level holders, etc.)…
    const scaffNonBeltsRes = scaffId
      ? await supabase
          .from("hammerex_products")
          .select("*")
          .eq("category_id", scaffId)
          .order("home_sort_order", { ascending: true })
          .order("name")
      : { data: [] as HammerexProduct[] };
    // …plus the tape-holders + hammer-holders categories.
    const otherHoldersRes = holderIds.length > 0
      ? await supabase
          .from("hammerex_products")
          .select("*")
          .in("category_id", holderIds)
          .order("home_sort_order", { ascending: true })
          .order("name")
      : { data: [] as HammerexProduct[] };
    const scaffNonBelts = ((scaffNonBeltsRes.data ?? []) as HammerexProduct[])
      .filter((p) => p.slug && !SCAFFOLDING_BELT_SLUGS.has(p.slug));
    const otherHolders = (otherHoldersRes.data ?? []) as HammerexProduct[];
    const seen = new Set<string>();
    return [...scaffNonBelts, ...otherHolders]
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .map((p) => stamp(p));
  }

  if (tab === "workwear") {
    const ids = WORKWEAR_CATS.map((s) => slugToId.get(s)).filter((s): s is string => Boolean(s));
    if (ids.length === 0) return [];
    const res = await supabase
      .from("hammerex_products")
      .select("*")
      .in("category_id", ids)
      .order("home_sort_order", { ascending: true })
      .order("name");
    return ((res.data ?? []) as HammerexProduct[]).map((p) => stamp(p));
  }

  return [];
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}): Promise<Metadata> {
  const { tab } = await searchParams;
  const active = resolveScaffoldingTab(tab);
  const t = SCAFFOLDING_TABS.find((x) => x.id === active)!;
  const title = `Scaffolding · ${t.label}`;
  const description = `${t.hint} — from ${BRAND.name}. Free UK delivery on belts; flat £20 elsewhere via EMS Air Mail.`;
  // Canonical to the base URL (no ?tab) so search engines don't fragment ranking.
  return {
    title,
    description,
    alternates: { canonical: "/c/scaffolding" },
    openGraph: {
      type: "website",
      title: `${title} | ${BRAND.name}`,
      description,
      url: absolute("/c/scaffolding"),
      siteName: BRAND.name,
      images: [{ url: BRAND.logo, alt: `Scaffolding — ${BRAND.name}` }]
    },
    twitter: { card: "summary_large_image", title, description, images: [BRAND.logo] }
  };
}

export default async function ScaffoldingShopPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = resolveScaffoldingTab(tab);

  const catRes = await supabase
    .from("hammerex_categories")
    .select("id, slug, name, image_url, sort_order, is_tool_type, card_image_url, card_show_label")
    .eq("slug", "scaffolding")
    .maybeSingle();
  const category = catRes.data as HammerexCategory | null;
  if (!category) notFound();

  const products = await loadProductsForTab(active);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: category.name, url: "/c/scaffolding" }
  ]);

  return (
    <main>
      <WelcomeTrigger />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Header />
      <CategoryHero category={category} productCount={products.length} imageFit="contain" />

      <section className="mx-auto max-w-6xl px-4 pt-4">
        <nav className="text-xs text-brand-muted">
          <a href="/" className="hover:text-brand-accent">Home</a>
          <span className="mx-2">/</span>
          <span className="text-brand-text">Scaffolding</span>
          <span className="mx-2">/</span>
          <span className="text-brand-accent">{SCAFFOLDING_TABS.find((t) => t.id === active)!.label}</span>
        </nav>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <ScaffoldingTabs active={active} />
      </div>

      {products.length === 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12 text-center">
          <p className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-8 text-sm text-brand-muted">
            No products in this tab yet — try another tab above.
          </p>
        </section>
      ) : (
        <ProductRow items={products} hideHeader layout="landscape" />
      )}

      <DeliveryFooter />
    </main>
  );
}
