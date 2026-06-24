import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { absolute, breadcrumbJsonLd, clampDescription, faqJsonLd, productJsonLd, stripMarkdown, BRAND } from "@/lib/seo";
import { WORKSHOP_FAQ } from "@/lib/workshopFaq";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { BuyColumn } from "@/components/pdp/BuyColumn";
import { InTheBox } from "@/components/pdp/InTheBox";
import { ShippingReturns } from "@/components/pdp/ShippingReturns";
import { StickyBuyBar } from "@/components/pdp/StickyBuyBar";
import { PairsWith } from "@/components/pdp/PairsWith";
import { ReviewsBlock } from "@/components/pdp/ReviewsBlock";
import { QABlock } from "@/components/pdp/QABlock";
import { ProductFAQ } from "@/components/pdp/ProductFAQ";
import { WarrantyTimeline } from "@/components/pdp/WarrantyTimeline";
import {
  supabase,
  type HammerexProduct,
  type HammerexProductMedia,
  type HammerexProductSpec,
  type HammerexProductVariant,
  type HammerexWhatInBox,
  type HammerexBundle,
  type HammerexDealBreaker,
  type HammerexPairWith,
  type HammerexReview,
  type HammerexQuestion,
  type HammerexProductDeal
} from "@/lib/supabase";
import { VariantProvider } from "@/components/pdp/VariantContext";
import { DealProvider } from "@/components/pdp/DealContext";
import { BundleReturnButton } from "@/components/pdp/BundleReturnButton";
import { RetailShopsSection } from "@/components/pdp/RetailShopsSection";
import { ProductVideo } from "@/components/pdp/ProductVideo";
import { CompareSection } from "@/components/pdp/CompareSection";
import { ProductDelayNotice } from "@/components/pdp/ProductDelayNotice";
import { RecordRecentView } from "@/components/RecordRecentView";
import { ProductTicker } from "@/components/GlobalTicker";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { WelcomeExitIntent } from "@/components/WelcomeExitIntent";
import { TrackPageEvent } from "@/components/TrackPageEvent";

// PDPs are ISR-cached for fast first paint. Currency / geo personalisation
// happens client-side in BuyColumn from the hx_country cookie. Revalidate
// every 60s — content changes are catalogue edits, not real-time data.
export const revalidate = 60;

// Flagship "Hammerex Standard" slugs — only these PDPs render the Trade Off
// cross-link panel. List mirrors HAMMEREX_STANDARD_BLURBS in lib/tradeOff.ts.
const HAMMEREX_STANDARD_PDP_SLUGS = new Set<string>([
  "k9-plastering-tool-station",
  "k11-drywall-tool-station",
  "scaffolders-setup-kit",
  "electrician-pro-pouch",
  "plastering-pro-bag",
  "drywall-pro-kit"
]);

async function loadProduct(slug: string) {
  const productRes = await supabase
    .from("hammerex_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const product = productRes.data as HammerexProduct | null;
  if (!product) return null;

  const [mediaRes, specsRes, boxRes, variantsRes, productDealsRes, dealsRes, reviewsRes, qRes, pairsRes, bundleRes] = await Promise.all([
    supabase.from("hammerex_product_media").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_product_specs").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_what_in_box").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_product_variants").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_product_deals").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("hammerex_deal_breakers")
      .select("*, item:hammerex_products!hammerex_deal_breakers_item_product_id_fkey(*, variants:hammerex_product_variants(*))")
      .eq("anchor_product_id", product.id)
      .order("sort_order"),
    supabase.from("hammerex_reviews").select("*").eq("product_id", product.id).eq("status", "approved").order("created_at", { ascending: false }),
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

  const dealBreakers: HammerexDealBreaker[] = (dealsRes.data ?? [])
    .filter((d: any) => d.item)
    .map((d: any) => {
      const { variants, ...itemNoVariants } = d.item;
      return {
        id: d.id,
        anchor_product_id: d.anchor_product_id,
        item_product_id: d.item_product_id,
        deal_price_idr: d.deal_price_idr,
        sort_order: d.sort_order,
        item: itemNoVariants as HammerexProduct,
        variants: (variants ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      };
    });

  const compareWith = (product.compare_with ?? []).filter(Boolean) as string[];
  let compareProducts: HammerexProduct[] = [];
  if (compareWith.length > 0) {
    const res = await supabase
      .from("hammerex_products")
      .select("*")
      .in("slug", compareWith);
    const bySlug = new Map<string, HammerexProduct>();
    for (const p of (res.data ?? []) as HammerexProduct[]) {
      bySlug.set(p.slug ?? "", p);
    }
    compareProducts = compareWith.map((s) => bySlug.get(s)).filter((p): p is HammerexProduct => Boolean(p));
  }

  // Belt add-on picker: shown on Electrician Single/Double Pouch Belt Slide
  // PDPs. The two belt SKUs are loaded server-side so they hydrate the
  // accordion immediately (no flash). Empty array on every other PDP.
  const BELT_ADDON_HOST_SKUS = new Set(["HX-ESP-001", "HX-EDP-001"]);
  const BELT_ADDON_SKUS = ["HX-LB2-001", "HX-FCB-001"];
  let beltAddOns: HammerexProduct[] = [];
  if (product.sku && BELT_ADDON_HOST_SKUS.has(product.sku)) {
    const res = await supabase
      .from("hammerex_products")
      .select("*")
      .in("sku", BELT_ADDON_SKUS);
    const bySku = new Map<string, HammerexProduct>();
    for (const p of (res.data ?? []) as HammerexProduct[]) {
      if (p.sku) bySku.set(p.sku, p);
    }
    beltAddOns = BELT_ADDON_SKUS.map((s) => bySku.get(s)).filter((p): p is HammerexProduct => Boolean(p));
  }

  return {
    product,
    media: (mediaRes.data ?? []) as HammerexProductMedia[],
    specs: (specsRes.data ?? []) as HammerexProductSpec[],
    box: (boxRes.data ?? []) as HammerexWhatInBox[],
    variants: (variantsRes.data ?? []) as HammerexProductVariant[],
    productDeals: (productDealsRes.data ?? []) as HammerexProductDeal[],
    dealBreakers,
    compareProducts,
    reviews: (reviewsRes.data ?? []) as HammerexReview[],
    questions,
    pairs,
    bundle,
    beltAddOns
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await supabase
    .from("hammerex_products")
    .select("name, slug, subtitle, overview, description, image_url, sku")
    .eq("slug", slug)
    .maybeSingle();
  const p = res.data;
  if (!p) return { title: "Product not found" };

  // Strip markdown so `**bold**` / `### heading` / bullets don't bleed into
  // the SERP description or the OG/Twitter preview cards.
  const description = clampDescription(
    stripMarkdown(p.subtitle ?? p.overview ?? p.description ?? BRAND.description)
  );
  const image = p.image_url ?? BRAND.logo;
  const url = absolute(`/product/${p.slug ?? slug}`);
  const refSuffix = p.sku ? ` · Ref ${p.sku}` : "";

  return {
    title: `${p.name}${refSuffix}`,
    description,
    alternates: { canonical: `/product/${p.slug ?? slug}` },
    // OG type=product on PDPs so Facebook / WhatsApp / Slack render the
    // rich product preview rather than a generic website card.
    openGraph: {
      type: "website", // Next's typed enum doesn't list "product"; OG validators accept the override below.
      title: `${p.name}${refSuffix}`,
      description,
      url,
      siteName: BRAND.name,
      images: [{ url: image, alt: p.name, width: 1200, height: 1200 }]
    },
    other: {
      "og:type": "product"
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name}${refSuffix}`,
      description,
      images: [image]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadProduct(slug);
  if (!data) notFound();

  const { product, media, specs, box, variants, productDeals, dealBreakers, compareProducts, reviews, questions, pairs, bundle, beltAddOns } = data;
  const stickyImage = media.find((m) => m.kind === "image")?.url ?? product.image_url;

  const categoryRes = product.category_id
    ? await supabase
        .from("hammerex_categories")
        .select("id, slug, name, image_url, card_image_url, card_show_label, sort_order")
        .eq("id", product.category_id)
        .maybeSingle()
    : null;
  const category = categoryRes?.data ?? null;

  const allCategoriesRes = await supabase
    .from("hammerex_categories")
    .select("slug, name")
    .order("name");
  const allCategories = (allCategoriesRes.data ?? []) as { slug: string; name: string }[];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    ...(category ? [{ name: category.name, url: `/c/${category.slug}` }] : []),
    { name: product.name, url: `/product/${product.slug ?? product.id}` }
  ]);

  return (
    <main className="pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
      <RecordRecentView slug={product.slug} />
      <WelcomeTrigger />
      <WelcomeExitIntent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, category)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* FAQPage JSON-LD — combines the product-specific FAQ (if any) with
          the brand-wide workshop FAQ. Every PDP gets at least 12 Q&As of
          structured data, which gives Google "People also ask" coverage on
          shipping, dispatch, custom branding, warranty, etc. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd([...(product.faq ?? []), ...WORKSHOP_FAQ]))
        }}
      />
      <Header />
      <TrackPageEvent eventType="pdp_view" productId={product.id} />
      <BundleReturnButton />

      <nav className="mx-auto max-w-6xl px-4 pt-4 text-xs text-brand-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-brand-text">Hammerex</a></li>
          <li>/</li>
          <li><a href="/products" className="hover:text-brand-text">Products</a></li>
          <li>/</li>
          <li className="text-brand-text">{product.name}</li>
        </ol>
      </nav>

      <ProductDelayNotice slug={product.slug} />

      <VariantProvider variants={variants}>
        <DealProvider deals={productDeals} unitPriceIdr={product.price_idr} productName={product.name}>
          <section className="mx-auto max-w-6xl px-4 pt-6">
            {/* Full-width running ticker — sits ABOVE the product image / buy
                column so it's visible immediately on page load, not buried
                under the long buy column. Reads product.running_notice;
                falls back to the brand-wide rotation when that's null.
                Extra horizontal padding here keeps the pill clear of the
                screen edges on mobile (the parent section already has px-4,
                this adds another rung on top of that). */}
            <div className="mb-4 px-2 sm:px-4">
              <ProductTicker productNotice={product.running_notice ?? null} />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <ProductGallery media={media} fallbackImage={product.image_url} name={product.name} />
              <div id="pdp-buy-sentinel">
                <BuyColumn
                  product={product}
                  currentCategory={category ? { slug: category.slug, name: category.name } : null}
                  allCategories={allCategories}
                  specs={specs}
                  bundle={bundle}
                  beltAddOns={beltAddOns}
                />
              </div>
            </div>
          </section>
          <StickyBuyBar product={product} image={stickyImage} />
        </DealProvider>
      </VariantProvider>

      {product.video_url && (
        <ProductVideo
          url={product.video_url}
          title={product.name}
          coverUrl={product.video_cover_url}
        />
      )}

      <InTheBox
        items={box}
        fallbackImage={product.image_url}
        {...(product.slug === "trowel-leg-pouch"
          ? { title: "In your package", subtitle: "This is what you receive in your delivery package." }
          : product.slug === "plastering-caddy"
          ? { title: "In the Roll", subtitle: "This is what you receive in your delivery roll." }
          : product.slug === "electrician-sling-bag"
          ? {
              title: "In the Package",
              subtitle: "This is what you receive in your delivery package.",
              overlayImage:
                "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2020,%202026,%2005_57_18%20AM.png"
            }
          : {})}
      />
      {HAMMEREX_STANDARD_PDP_SLUGS.has(product.slug ?? "") && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl bg-brand-accent p-6 text-black sm:p-7">
            <h3 className="text-base font-bold sm:text-lg">
              Tradespeople — get your free Trade Off listing.
            </h3>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed">
              Hammerex Trade Off is our free UK directory for working tradies.
              Free for life. WhatsApp direct. No middleman.
            </p>
            <a
              href="/trade-off/signup"
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-black/90 px-5 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              Claim your free listing →
            </a>
          </div>
        </section>
      )}
      <CompareSection currentProduct={product} others={compareProducts} />
      <RetailShopsSection productName={product.name} productSku={product.sku} />
      <PairsWith pairs={pairs} />
      <ReviewsBlock
        productId={product.id}
        productName={product.name}
        reviews={reviews}
      />
      <ProductFAQ faq={product.faq} />
      <QABlock questions={questions} />
      <ShippingReturns
        warrantyYears={product.warranty_years ?? 1}
        dispatchLeadDays={product.dispatch_lead_days ?? 0}
        shippingPerUnitIdr={product.shipping_per_unit_idr}
      />
      <WarrantyTimeline warrantyYears={product.warranty_years ?? 1} />
    </main>
  );
}
