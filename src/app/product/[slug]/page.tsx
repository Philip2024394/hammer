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
import { BundleBlock } from "@/components/pdp/BundleBlock";
import { PairsWith } from "@/components/pdp/PairsWith";
import { ReviewsBlock } from "@/components/pdp/ReviewsBlock";
import { QABlock } from "@/components/pdp/QABlock";
import { WarrantyTimeline } from "@/components/pdp/WarrantyTimeline";
import {
  supabase,
  type HammerexProduct,
  type HammerexProductMedia,
  type HammerexProductSpec,
  type HammerexWhatInBox,
  type HammerexBundle,
  type HammerexPairWith,
  type HammerexReview,
  type HammerexQuestion
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

  const [mediaRes, specsRes, boxRes, reviewsRes, qRes, pairsRes, bundleRes] = await Promise.all([
    supabase.from("hammerex_product_media").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_product_specs").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_what_in_box").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false }),
    supabase.from("hammerex_questions").select("*, hammerex_answers(*)").eq("product_id", product.id).order("created_at", { ascending: false }),
    supabase.from("hammerex_pair_with")
      .select("*, accessory:hammerex_products!hammerex_pair_with_accessory_product_id_fkey(*)")
      .eq("product_id", product.id)
      .order("sort_order"),
    supabase.from("hammerex_bundles")
      .select("*, hammerex_bundle_items(id, qty, sort_order, item:hammerex_products!hammerex_bundle_items_item_product_id_fkey(*))")
      .eq("anchor_product_id", product.id)
      .order("sort_order")
      .limit(1)
      .maybeSingle()
  ]);

  const questions: HammerexQuestion[] = (qRes.data ?? []).map((q: any) => ({
    id: q.id, product_id: q.product_id, asked_by: q.asked_by, body: q.body, created_at: q.created_at,
    answers: (q.hammerex_answers ?? []).map((a: any) => ({
      id: a.id, body: a.body, by_name: a.by_name, by_vendor: a.by_vendor, created_at: a.created_at
    }))
  }));

  const pairs: HammerexPairWith[] = (pairsRes.data ?? []).map((p: any) => ({
    id: p.id, product_id: p.product_id, accessory_product_id: p.accessory_product_id,
    reason: p.reason, sort_order: p.sort_order, accessory: p.accessory as HammerexProduct
  }));

  let bundle: HammerexBundle | null = null;
  if (bundleRes.data) {
    const b: any = bundleRes.data;
    bundle = {
      id: b.id, anchor_product_id: b.anchor_product_id, title: b.title, discount_pct: b.discount_pct,
      items: (b.hammerex_bundle_items ?? [])
        .sort((x: any, y: any) => x.sort_order - y.sort_order)
        .map((it: any) => ({ id: it.id, qty: it.qty, product: it.item as HammerexProduct }))
    };
  }

  return {
    product,
    media: (mediaRes.data ?? []) as HammerexProductMedia[],
    specs: (specsRes.data ?? []) as HammerexProductSpec[],
    box: (boxRes.data ?? []) as HammerexWhatInBox[],
    reviews: (reviewsRes.data ?? []) as HammerexReview[],
    questions,
    pairs,
    bundle
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadProduct(slug);
  if (!data) notFound();

  const { product, media, specs, box, reviews, questions, pairs, bundle } = data;
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
            <BuyColumn product={product} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8">
        <SectionAnchors />
      </div>

      <KeyFeatures features={product.features} />
      <InTheBox items={box} />
      <BundleBlock bundle={bundle} />
      <PairsWith pairs={pairs} />
      <SpecsTable specs={specs} />
      <ReviewsBlock productId={product.id} reviews={reviews} />
      <QABlock questions={questions} />
      <ShippingReturns
        warrantyYears={product.warranty_years ?? 1}
        dispatchLeadDays={product.dispatch_lead_days ?? 0}
      />
      <WarrantyTimeline warrantyYears={product.warranty_years ?? 1} />

      <StickyBuyBar product={product} image={stickyImage} />
    </main>
  );
}
