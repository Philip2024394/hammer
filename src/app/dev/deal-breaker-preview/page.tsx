import { Header } from "@/components/Header";
import { DealBreakerCard } from "@/components/pdp/DealBreakerCard";
import type { HammerexDealBreaker, HammerexProduct } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mockProduct(over: Partial<HammerexProduct>): HammerexProduct {
  return {
    id: crypto.randomUUID(),
    category_id: null,
    name: "",
    description: null,
    price_idr: 0,
    image_url: null,
    is_featured: false,
    slug: null,
    sku: null,
    brand: "Hammerex",
    model_number: null,
    weight_kg: null,
    dispatch_cutoff_local: null,
    warranty_years: 1,
    country_of_assembly: "United Kingdom",
    overview: null,
    features: null,
    stock_count: 25,
    compare_at_idr: null,
    qty_discount_tiers: null,
    is_accessory: true,
    rating_avg: null,
    rating_count: null,
    base_currency: "GBP",
    sizes: null,
    dispatch_lead_days: 3,
    delivery_quote_only: true,
    purchase_notes: null,
    badge_label: null,
    subtitle: null,
    home_sort_order: null,
    thread_color_option_idr: null,
    backpack_straps_option_idr: null,
    is_universal: null,
    ...over
  };
}

const items: HammerexDealBreaker[] = [
  {
    id: "demo-1",
    anchor_product_id: "demo-anchor",
    item_product_id: "",
    deal_price_idr: 100000,
    sort_order: 0,
    item: mockProduct({
      name: "Hammerex Tool Lanyard 1.5m",
      sku: "HX-LNYRD-001",
      price_idr: 160000,
      slug: "tool-lanyard",
      image_url: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/43bdfe459efc8152.png"
    })
  },
  {
    id: "demo-2",
    anchor_product_id: "demo-anchor",
    item_product_id: "",
    deal_price_idr: 80000,
    sort_order: 1,
    item: mockProduct({
      name: "Heavy Duty Glove Clip",
      sku: "HX-GCLIP-001",
      price_idr: 120000,
      slug: "glove-clip",
      image_url: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/43bdfe459efc8152.png"
    })
  },
  {
    id: "demo-3",
    anchor_product_id: "demo-anchor",
    item_product_id: "",
    deal_price_idr: 160000,
    sort_order: 2,
    item: mockProduct({
      name: "Scaffolders Gloves (Pair)",
      sku: "HX-SGLV-001",
      price_idr: 240000,
      slug: "scaffolders-gloves",
      image_url: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/5535b7fef7189ab1.png"
    })
  },
  {
    id: "demo-4",
    anchor_product_id: "demo-anchor",
    item_product_id: "",
    deal_price_idr: 440000,
    sort_order: 3,
    item: mockProduct({
      name: "Hammerex Heavy Duty Tool Bag",
      sku: "HX-TBAG-001",
      price_idr: 600000,
      slug: "tool-bag",
      image_url: "https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/ec67e01ec9d8c050.png?tr=w-200,q-85,f-auto"
    })
  }
];

export default function DealBreakerPreview() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 rounded-xl border border-brand-line bg-brand-surface p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Preview</p>
          <p className="mt-1 text-xs text-brand-muted">
            Mock data — no DB rows touched. Tap the yellow card to expand. If you tick add-ons
            and tap &ldquo;Add to cart&rdquo;, the demo items will land in your cart at the
            sample Deal Breaker prices (clear them after).
          </p>
        </div>

        <div className="rounded-2xl border border-brand-line bg-brand-bg p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-muted">
            Buy column (simulated)
          </h2>
          <DealBreakerCard items={items} currency="IDR" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-10 rounded-full bg-brand-accent/30 text-center text-xs leading-10 text-brand-text">
              Size selector (placeholder)
            </div>
            <div className="h-10 rounded-full bg-brand-accent/30 text-center text-xs leading-10 text-brand-text">
              Add to cart (placeholder)
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-brand-muted">
          On a real PDP this card sits between the variant selector and the size selector,
          inside the buy column. Self-hides when no Deal Breaker rows exist for that product.
        </p>
      </section>
    </main>
  );
}
