import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/seo";
import { SEO_LANDING_SLUGS } from "@/lib/seoLandings";
import { TRADE_OFF_TRADES, tradeOffSlugify } from "@/lib/tradeOff";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  // Try the updated_at + created_at pair first; if updated_at hasn't been
  // added to the table yet (migration 20260620 not applied), Postgres errors
  // and we fall back to the created_at-only query so the sitemap still
  // builds cleanly during the rollout window.
  const productsSelect = "slug, id, created_at, updated_at";
  let prodsRes = await supabase.from("hammerex_products").select(productsSelect);
  if (prodsRes.error?.code === "42703") {
    prodsRes = await supabase.from("hammerex_products").select("slug, id, created_at");
  }

  const [catsRes, guidesRes, tradeOffRes] = await Promise.all([
    supabase.from("hammerex_categories").select("slug").order("sort_order"),
    supabase.from("hammerex_guides").select("slug, updated_at").eq("published", true),
    supabase
      .from("hammerex_trade_off_listings")
      .select("slug, primary_trade, city, updated_at")
      .eq("status", "live")
  ]);

  // Category lastModified: most-recent product create date inside that
  // category is a reasonable proxy without an explicit updated_at column.
  const categories: MetadataRoute.Sitemap = (catsRes.data ?? [])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    }));

  const products: MetadataRoute.Sitemap = (prodsRes.data ?? [])
    .map((p) => {
      const u = (p as { updated_at?: string | null }).updated_at;
      const stamp = u ?? p.created_at ?? null;
      return {
        url: `${base}/product/${p.slug ?? p.id}`,
        lastModified: stamp ? new Date(stamp) : now,
        changeFrequency: "weekly" as const,
        priority: 0.9
      };
    });

  const guides: MetadataRoute.Sitemap = (guidesRes.data ?? [])
    .filter((g) => g.slug)
    .map((g) => ({
      url: `${base}/guides/${g.slug}`,
      lastModified: g.updated_at ? new Date(g.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));

  // SEO alias landing pages — /tool-belts, /tool-bags, /construction-tools etc.
  // These earn keyword traffic that the bare /c/[slug] category pages don't.
  const landings: MetadataRoute.Sitemap = SEO_LANDING_SLUGS.map((s) => ({
    url: `${base}/${s}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9
  }));

  // Trade Off — per-trade index pages (one per slug in TRADE_OFF_TRADES).
  const tradeOffTradeIndexes: MetadataRoute.Sitemap = TRADE_OFF_TRADES.map((t) => ({
    url: `${base}/trade-off/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  // Trade Off — public listing profiles (/trade/<slug>).
  const tradeOffListings: MetadataRoute.Sitemap = (tradeOffRes.data ?? [])
    .filter((l) => l.slug)
    .map((l) => ({
      url: `${base}/trade/${l.slug}`,
      lastModified: l.updated_at ? new Date(l.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));

  // Trade Off — city pages, deduped on (primary_trade, lower(city)).
  const cityKeys = new Set<string>();
  const tradeOffCities: MetadataRoute.Sitemap = [];
  for (const l of tradeOffRes.data ?? []) {
    if (!l.primary_trade || !l.city) continue;
    const citySlug = tradeOffSlugify(l.city);
    if (!citySlug) continue;
    const key = `${l.primary_trade}/${citySlug}`;
    if (cityKeys.has(key)) continue;
    cityKeys.add(key);
    tradeOffCities.push({
      url: `${base}/trade-off/${l.primary_trade}/${citySlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    });
  }

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/trade-off`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/trade-off/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...landings,
    ...categories,
    ...products,
    ...guides,
    ...tradeOffTradeIndexes,
    ...tradeOffListings,
    ...tradeOffCities
  ];
}
