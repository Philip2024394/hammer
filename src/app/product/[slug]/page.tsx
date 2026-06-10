import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { BuyColumn } from "@/components/pdp/BuyColumn";
import { KeyFeatures } from "@/components/pdp/KeyFeatures";
import { InTheBox } from "@/components/pdp/InTheBox";
import { SpecsTable } from "@/components/pdp/SpecsTable";
import { ShippingReturns } from "@/components/pdp/ShippingReturns";
import { StickyBuyBar } from "@/components/pdp/StickyBuyBar";
import { SectionAnchors } from "@/components/pdp/SectionAnchors";
import {
  supabase,
  type HammerexProduct,
  type HammerexProductMedia,
  type HammerexProductSpec,
  type HammerexWhatInBox,
  type HammerexShippingZone
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadProduct(slug: string) {
  const productRes = await supabase
    .from("hammerex_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const product = productRes.data as HammerexProduct | null;
  if (!product) return null;

  const [mediaRes, specsRes, boxRes, zonesRes] = await Promise.all([
    supabase.from("hammerex_product_media").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_product_specs").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_what_in_box").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_shipping_zones").select("*").order("country_name")
  ]);

  return {
    product,
    media: (mediaRes.data ?? []) as HammerexProductMedia[],
    specs: (specsRes.data ?? []) as HammerexProductSpec[],
    box: (boxRes.data ?? []) as HammerexWhatInBox[],
    zones: (zonesRes.data ?? []) as HammerexShippingZone[]
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadProduct(slug);
  if (!data) notFound();

  const { product, media, specs, box, zones } = data;
  const stickyImage = media.find((m) => m.kind === "image")?.url ?? product.image_url;

  return (
    <main>
      <Header />

      <nav className="mx-auto max-w-6xl px-4 pt-4 text-xs text-brand-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-brand-text">Hammerex</a></li>
          <li>/</li>
          <li><a href="/products" className="hover:text-brand-text">Products</a></li>
          <li>/</li>
          <li className="text-brand-text">{product.name}</li>
        </ol>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductGallery media={media} fallbackImage={product.image_url} name={product.name} />
          <div id="pdp-buy-sentinel">
            <BuyColumn product={product} zones={zones} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8">
        <SectionAnchors />
      </div>

      <KeyFeatures features={product.features} />
      <InTheBox items={box} />
      <SpecsTable specs={specs} />
      <ShippingReturns
        zones={zones}
        weightKg={Number(product.weight_kg ?? 1)}
        warrantyYears={product.warranty_years ?? 1}
      />

      <StickyBuyBar product={product} image={stickyImage} />
    </main>
  );
}
