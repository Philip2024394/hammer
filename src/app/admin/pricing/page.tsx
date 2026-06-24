import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PricingGrid, type PricingRow, type CategoryLite, type VariantLite } from "./PricingGrid";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const [productsRes, categoriesRes, variantsRes] = await Promise.all([
    supabaseAdmin
      .from("hammerex_products")
      .select("id, slug, name, sku, image_url, price_idr, shipping_per_unit_idr, price_idr_sea, free_shipping_sea, category_id, is_featured, home_sort_order, trade_price_gbp, moq")
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("hammerex_categories")
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("hammerex_product_variants")
      .select("id, product_id, label, sku, price_idr, price_idr_sea, is_default, sort_order, trade_price_gbp, moq")
      .order("sort_order", { ascending: true })
  ]);

  const products = (productsRes.data ?? []) as Array<{
    id: string;
    slug: string | null;
    name: string;
    sku: string | null;
    image_url: string | null;
    price_idr: number;
    shipping_per_unit_idr: number | null;
    price_idr_sea: number;
    free_shipping_sea: boolean;
    category_id: string | null;
    is_featured: boolean;
    home_sort_order: number | null;
    trade_price_gbp: number | null;
    moq: number | null;
  }>;

  const categories = (categoriesRes.data ?? []) as CategoryLite[];

  const variantsByProduct = new Map<string, VariantLite[]>();
  for (const v of (variantsRes.data ?? []) as VariantLite[]) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const rows: PricingRow[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    image_url: p.image_url,
    price_idr: p.price_idr,
    shipping_per_unit_idr: p.shipping_per_unit_idr,
    price_idr_sea: p.price_idr_sea,
    free_shipping_sea: p.free_shipping_sea,
    category_id: p.category_id,
    variants: variantsByProduct.get(p.id) ?? [],
    is_featured: p.is_featured,
    trade_price_gbp: p.trade_price_gbp,
    moq: p.moq
  }));

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Pricing</h1>
        <p className="text-xs text-brand-muted">
          Set the canonical Rp price (shown natively to Indonesia visitors,
          FX-converted for Malaysia / Vietnam). Rest-of-world visitors don&rsquo;t
          see prices &mdash; they request a quote at checkout. Rp 0 surfaces as
          &ldquo;Quoted at checkout&rdquo;. &ldquo;Free UK&rdquo; flags the
          delivery option for UK / RoW visitors; &ldquo;Free SEA&rdquo; controls
          the shipping label shown to ID / MY / VN visitors only. Switch to
          &ldquo;Trade&rdquo; to edit the GBP trade-channel price + MOQ that the
          owner quotes to UK trade buyers separately.
        </p>
      </header>

      <PricingGrid rows={rows} categories={categories} />
    </div>
  );
}
