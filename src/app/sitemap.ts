import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/seo";

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

  const [catsRes, guidesRes] = await Promise.all([
    supabase.from("hammerex_categories").select("slug").order("sort_order"),
    supabase.from("hammerex_guides").select("slug, updated_at").eq("published", true)
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

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...categories,
    ...products,
    ...guides
  ];
}
