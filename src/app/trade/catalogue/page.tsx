// /trade/catalogue — wholesale catalogue grid for signed-in trade accounts.
//
// Server component. Steps:
//   1. Resolve the signed-in trade account (middleware already gated the
//      coarse auth-cookie check; here we run the full whitelist check).
//      If unauthenticated → notFound() so the deeper path stays invisible.
//   2. Pull all products that have `trade_price_gbp` set (NOT NULL).
//      Products without trade pricing never reach the trade buyer.
//   3. Pull variant rows for those products so the card can show "4 sizes"
//      / "3 colours" without an N+1.
//   4. Pull categories so the filter rail knows the full taxonomy.
//   5. Hand off to `<CatalogueClient>` which owns filter state + URL sync.
//
// Pagination: deferred. Today there are 119 products in the table — a
// single page render is fine. Client paginates 60-at-a-time via "Load more".

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { getCurrentTradeAccount } from "@/lib/trade-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CatalogueClient, type TradeCatalogueProduct, type TradeCatalogueCategory } from "./CatalogueClient";

export const metadata: Metadata = {
  title: "Trade Catalogue",
  description: "Hammerex wholesale catalogue. Signed-in trade buyers only.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function TradeCataloguePage() {
  const account = await getCurrentTradeAccount();
  if (!account) notFound();

  // 1. Products with trade pricing.
  const productsRes = await supabaseAdmin
    .from("hammerex_products")
    .select(
      "id, slug, name, sku, image_url, price_idr, trade_price_gbp, moq, stock_count, category_id, created_at, sizes, thread_color_option_idr"
    )
    .not("trade_price_gbp", "is", null)
    .order("home_sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  const products = (productsRes.data ?? []) as Array<{
    id: string;
    slug: string | null;
    name: string;
    sku: string | null;
    image_url: string | null;
    price_idr: number;
    trade_price_gbp: number | null;
    moq: number | null;
    stock_count: number | null;
    category_id: string | null;
    created_at: string;
    sizes: string[] | null;
    thread_color_option_idr: number | null;
  }>;

  const productIds = products.map((p) => p.id);

  // 2. Variants for those products. Count "sizes" / colours per product.
  const variantsRes = productIds.length
    ? await supabaseAdmin
        .from("hammerex_product_variants")
        .select("id, product_id, label, sku, trade_price_gbp, moq, stock_count")
        .in("product_id", productIds)
    : { data: [], error: null as null | { message: string } };

  const variantsByProduct = new Map<string, number>();
  for (const v of (variantsRes.data ?? []) as Array<{ product_id: string }>) {
    variantsByProduct.set(v.product_id, (variantsByProduct.get(v.product_id) ?? 0) + 1);
  }

  // 3. Categories — the trade rail needs both trade (is_tool_type=false)
  //    and tool-type taxonomies, plus the primary category each product
  //    sits in. Also need the cross-list junction so a product mapped to
  //    several trades surfaces under each trade filter chip.
  const [allCatsRes, junctionRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_categories")
      .select("id, slug, name, is_tool_type")
      .order("sort_order", { ascending: true }),
    productIds.length
      ? supabaseAdmin
          .from("hammerex_product_trades")
          .select("product_id, category_id")
          .in("product_id", productIds)
      : Promise.resolve({ data: [] as Array<{ product_id: string; category_id: string }>, error: null })
  ]);

  const catsById = new Map<string, { slug: string; name: string; is_tool_type: boolean }>();
  const trades: TradeCatalogueCategory[] = [];
  const tools: TradeCatalogueCategory[] = [];
  for (const c of (allCatsRes.data ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
    is_tool_type: boolean | null;
  }>) {
    const entry = { slug: c.slug, name: c.name, is_tool_type: !!c.is_tool_type };
    catsById.set(c.id, entry);
    if (c.is_tool_type) tools.push({ slug: c.slug, name: c.name });
    else trades.push({ slug: c.slug, name: c.name });
  }

  // Build a per-product set of trade-category slugs (primary + cross-listed).
  const productTradeSlugs = new Map<string, Set<string>>();
  for (const p of products) {
    const set = new Set<string>();
    if (p.category_id) {
      const cat = catsById.get(p.category_id);
      if (cat && !cat.is_tool_type) set.add(cat.slug);
    }
    productTradeSlugs.set(p.id, set);
  }
  for (const j of (junctionRes.data ?? []) as Array<{ product_id: string; category_id: string }>) {
    const cat = catsById.get(j.category_id);
    if (!cat) continue;
    const set = productTradeSlugs.get(j.product_id);
    if (set && !cat.is_tool_type) set.add(cat.slug);
  }

  // Same again for tool-type categories (primary only — junction rows are
  // currently the trade cross-list, not tool-type).
  const productToolSlugs = new Map<string, string | null>();
  for (const p of products) {
    if (!p.category_id) { productToolSlugs.set(p.id, null); continue; }
    const cat = catsById.get(p.category_id);
    productToolSlugs.set(p.id, cat && cat.is_tool_type ? cat.slug : null);
  }

  // 4. Compose the final view-model for the client. Keep it shallow / JSON-safe.
  const cards: TradeCatalogueProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    image_url: p.image_url,
    price_idr: p.price_idr,
    trade_price_gbp: Number(p.trade_price_gbp ?? 0),
    moq: p.moq ?? 1,
    stock_count: p.stock_count ?? 0,
    created_at: p.created_at,
    variants_count: variantsByProduct.get(p.id) ?? 0,
    sizes_count: Array.isArray(p.sizes) ? p.sizes.length : 0,
    has_thread_color: p.thread_color_option_idr != null && p.thread_color_option_idr > 0,
    trades: Array.from(productTradeSlugs.get(p.id) ?? []),
    tool_slug: productToolSlugs.get(p.id) ?? null
  }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg">
        <CatalogueClient
          account={{
            id: account.id,
            trade_account_no: account.trade_account_no,
            company_name: account.company_name,
            contact_email: account.contact_email,
            currency: account.currency
          }}
          products={cards}
          trades={trades.sort((a, b) => a.name.localeCompare(b.name))}
          tools={tools.sort((a, b) => a.name.localeCompare(b.name))}
        />
      </main>
      <DeliveryFooter />
    </>
  );
}
