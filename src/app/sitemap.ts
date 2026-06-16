import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const [catsRes, prodsRes, guidesRes] = await Promise.all([
    supabase.from("hammerex_categories").select("slug").order("sort_order"),
    supabase.from("hammerex_products").select("slug, id, created_at"),
    supabase.from("hammerex_guides").select("slug, updated_at").eq("published", true)
  ]);

  const categories: MetadataRoute.Sitemap = (catsRes.data ?? [])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    }));

  const products: MetadataRoute.Sitemap = (prodsRes.data ?? [])
    .map((p) => ({
      url: `${base}/product/${p.slug ?? p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9
    }));

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
