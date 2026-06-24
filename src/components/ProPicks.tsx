import { supabase, type HammerexProduct, type HammerexCategory } from "@/lib/supabase";
import { ProductRow } from "./ProductRow";
import { cookies, headers } from "next/headers";
import { getCountryFromRequest } from "@/lib/geo";

// Surfaces the three flagship Pro Pick products. These are the brand's
// signature trade-pro purchases — a single home-page row that gives the
// catalogue a clear story instead of the previous 75-SKU dump.
//
// To change the picks: update the slugs list below OR update which
// hammerex_products rows have badge_label = 'PRO KIT'.
const PRO_PICK_SLUGS = [
  "plastering-pro-bag",
  "drywall-pro-kit",
  "scaffolders-setup-kit",
  "electrician-pro-pouch"
];

// Electrician banner is read from the `electrical` category's image_url so
// future swaps are a one-line DB update — no code change, no deploy. The card
// routes to the /c/electrical grid instead of the single-product PDP (the
// buyer should see the full range).

export async function ProPicks() {
  const [prodRes, catRes] = await Promise.all([
    supabase.from("hammerex_products").select("*").in("slug", PRO_PICK_SLUGS),
    supabase.from("hammerex_categories").select("id, slug, name, image_url")
  ]);
  const cats = new Map<string, { slug: string; name: string; image_url: string | null }>();
  for (const c of (catRes.data ?? []) as HammerexCategory[]) {
    cats.set(c.id, { slug: c.slug, name: c.name, image_url: c.image_url });
  }
  const electricianBanner =
    (catRes.data ?? []).find((c) => c.slug === "electrical")?.image_url ?? null;
  const lookup = new Map<string, HammerexProduct>();
  for (const p of (prodRes.data ?? []) as HammerexProduct[]) {
    lookup.set(p.slug ?? "", { ...p, category: p.category_id ? cats.get(p.category_id) ?? null : null });
  }
  const products = PRO_PICK_SLUGS
    .map((s) => lookup.get(s))
    .filter((p): p is HammerexProduct => Boolean(p))
    // The scaffolders pick is a kit that exists in multiple belt-body
    // variants now (Lanyard Safety, Fast Clip, 4" Support, Padded System,
    // plus the included ForgeX / RESOLVE / Heavy Duty Set). Route this
    // card to the tabbed scaffolding shop so the buyer lands on a belt
    // picker rather than the single-product PDP.
    .map((p) =>
      p.slug === "scaffolders-setup-kit"
        ? { ...p, customHref: "/c/scaffolding" }
        : p
    )
    // Electrician pick acts as a category teaser: override the card image
    // with the dedicated banner and route to the /c/electrical grid so the
    // buyer sees the full electrician range, not the anchor product PDP.
    .map((p) =>
      p.slug === "electrician-pro-pouch"
        ? {
            ...p,
            image_url: electricianBanner ?? p.image_url,
            customHref: "/c/electrical",
            customCtaLabel: "Browse electrical"
          }
        : p
    )
    // Plastering + drywall picks act as category teasers — keep their PDP
    // banner art but route the card to the trade grid so the buyer sees
    // the full range instead of the single anchor product.
    .map((p) =>
      p.slug === "plastering-pro-bag"
        ? { ...p, customHref: "/c/plastering", customCtaLabel: "Browse plastering" }
        : p.slug === "drywall-pro-kit"
          ? { ...p, customHref: "/c/drywall", customCtaLabel: "Browse drywall" }
          : p
    );
  if (products.length === 0) return null;
  const country = getCountryFromRequest(await headers(), await cookies());
  return <ProductRow items={products} title="Pro Picks" viewAllHref="/products" layout="landscape" country={country} />;
}
