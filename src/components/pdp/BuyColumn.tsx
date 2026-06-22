"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENCIES, CURRENCY_FLAGS, formatPrice, formatPriceOrQuote, type Currency } from "@/lib/fx";
import { effectivePricePerUnit } from "@/lib/pricing";
import { cart } from "@/lib/cart";
import { sparkBurst } from "@/lib/sparks";
import type { HammerexProduct, HammerexProductSpec } from "@/lib/supabase";
import { DEFAULT_THREAD_COLOR, isFreeThreadColor, type ThreadColor } from "@/lib/threadColor";
import { StockBadge } from "./StockBadge";
import { SizeSelector } from "./SizeSelector";
import { BeltSizeSelector } from "./BeltSizeSelector";
import { beltSizingFor, variantHasBelt } from "@/lib/beltSizes";
import { ThreadColorPicker } from "./ThreadColorPicker";
import { CustomBrandingSection } from "./CustomBrandingSection";
import { customBrandingFor } from "@/lib/customBranding";
import { RepairCoverSection } from "./RepairCoverSection";
import { repairCoverFor } from "@/lib/repairCover";
import { beltUpgradeFor, beltUpgradePrice, beltUpgradeLabel, type BeltUpgradeOptionId } from "@/lib/beltUpgrade";
import { BeltUpgradeSection } from "./BeltUpgradeSection";
import { CollapsibleSection } from "./CollapsibleSection";
import { threadColorsFor } from "@/lib/threadColor";
import { BundleBlock } from "./BundleBlock";
import { BeltAddOnSection } from "./BeltAddOnSection";
import type { HammerexBundle } from "@/lib/supabase";
import { localeHintFor, countryToCurrency, HX_COUNTRY_COOKIE, type CountryLocaleHint } from "@/lib/geo";
import { PurchaseNotes } from "./PurchaseNotes";
import { DispatchCountdown } from "./DispatchCountdown";
import { QuoteSignalBadge } from "./QuoteSignalBadge";
import { useVariant } from "./VariantContext";
import { useDeal, dealDiscountPct } from "./DealContext";
import { VariantSelector } from "./VariantSelector";
import { RelatedUpsell } from "./RelatedUpsell";
import { PdpRunningBasket } from "./PdpRunningBasket";
import { StripePayNowButton } from "./StripePayNowButton";
import { YouTubeChannelButton } from "./YouTubeChannelButton";

type CategoryLite = { slug: string; name: string };

export function BuyColumn({
  product,
  currentCategory,
  allCategories,
  specs,
  preferredCurrency,
  localeHint,
  bundle,
  beltAddOns
}: {
  product: HammerexProduct;
  currentCategory?: CategoryLite | null;
  allCategories?: CategoryLite[];
  specs?: HammerexProductSpec[];
  preferredCurrency?: Currency | null;
  localeHint?: CountryLocaleHint | null;
  // Optional bundle data — when present, the Bundle and Save accordion is
  // rendered inline in the BuyColumn (right under the upsell stack).
  bundle?: HammerexBundle | null;
  // Optional belt add-on products — when set, an "Add a belt" picker is
  // shown above the bundle accordion. Each ticked belt is pushed into the
  // cart as its own line when the buyer hits Add to cart.
  beltAddOns?: HammerexProduct[] | null;
}) {
  const [overviewView, setOverviewView] = useState<"description" | "specs" | "features">("description");
  const variantCtx = useVariant();
  const dealCtx = useDeal();
  const activeVariant = variantCtx?.active ?? null;
  const activeDeal = dealCtx?.active ?? null;
  const dealPct = activeDeal ? dealDiscountPct(activeDeal, product.price_idr) : 0;
  const displayName = activeDeal?.name ?? product.name;
  const displayOverview = activeDeal?.description
    ?? (activeDeal
      ? `${activeDeal.qty}× ${product.name}${dealPct > 0 ? ` — save ${dealPct}% on the unit price` : ""}. Shipping is calculated at checkout and is not discounted.`
      : product.overview);
  const variantBaseIdr = activeVariant?.price_idr ?? product.price_idr;
  // Multi-buy deals are stored as an absolute total computed off the *base*
  // product price. When a variant is selected we re-apply the deal's discount
  // % to that variant's base so the displayed pack price tracks the chosen
  // option (e.g. pouch-only vs pouch+belt).
  const variantPriceIdr = activeDeal
    ? Math.floor((variantBaseIdr * activeDeal.qty * (1 - dealPct / 100)) / 100) * 100
    : variantBaseIdr;
  const variantSku = activeVariant?.sku ?? product.sku;
  const variantImage = activeVariant?.image_url ?? product.image_url;
  const variantStock = activeVariant?.stock_count ?? product.stock_count;
  // preferredCurrency comes from the buyer's geo-detected country (page.tsx).
  // base_currency is the product's stored sell currency. Geo wins because
  // that's the cleanest "this is your currency" signal for the buyer; the
  // currency dropdown still lets them override if the auto-pick is wrong.
  const defaultCurrency: Currency = preferredCurrency ?? (product.base_currency as Currency | undefined) ?? "IDR";
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  // The shipping panel & locale-flavoured copy follow the *selected* currency,
  // not raw geo — buyers viewing in GBP shouldn't see Indonesia copy, etc.
  const CURRENCY_TO_COUNTRY: Record<Currency, string> = {
    GBP: "GB", USD: "US", EUR: "DE", AUD: "AU", SGD: "SG", IDR: "ID"
  };
  const effectiveLocale: CountryLocaleHint = useMemo(
    () => localeHintFor(CURRENCY_TO_COUNTRY[currency]),
    [currency]
  );
  // Client-side geo resolution: PDPs are statically cached (ISR), so the
  // server can't pass the buyer's preferred currency. We hydrate from the
  // hx_country cookie (set by middleware or GeoBridge) on mount once, and
  // only if the buyer hasn't manually selected a currency yet.
  const hasResolvedGeo = useRef(false);
  useEffect(() => {
    if (hasResolvedGeo.current) return;
    if (typeof document === "undefined") return;
    if (preferredCurrency) return; // server already provided one — keep it
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${HX_COUNTRY_COOKIE}=([^;]+)`)
    );
    if (!match) return;
    const detected = countryToCurrency(match[1].toUpperCase());
    if (detected && detected !== currency) setCurrency(detected);
    hasResolvedGeo.current = true;
  }, [currency, preferredCurrency]);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const threadDelta = product.thread_color_option_idr ?? 0;
  const threadOptionEnabled = threadDelta > 0;
  const [threadColor, setThreadColor] = useState<ThreadColor | null>(
    threadOptionEnabled ? DEFAULT_THREAD_COLOR : null
  );
  const strapDelta = product.backpack_straps_option_idr ?? 0;
  const strapOptionEnabled = strapDelta > 0;
  const [backpackStraps, setBackpackStraps] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [beltSize, setBeltSize] = useState<string | null>(null);
  const [beltSizeError, setBeltSizeError] = useState(false);
  const [confirmedDealId, setConfirmedDealId] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const brandingConfig = customBrandingFor(product.slug);
  const [brandingEnabled, setBrandingEnabled] = useState(false);
  const [brandingName, setBrandingName] = useState("");

  const repairCoverConfig = repairCoverFor(product.slug);
  const [repairCover, setRepairCover] = useState(false);

  const beltUpgradeConfig = beltUpgradeFor(product.slug);
  const [beltUpgrade, setBeltUpgrade] = useState<BeltUpgradeOptionId | null>(null);
  // IDs of belt add-ons the buyer has ticked. Each ticked product is pushed
  // into the cart as its own line when Add to cart fires.
  const [selectedBeltAddOnIds, setSelectedBeltAddOnIds] = useState<Set<string>>(() => new Set());
  const beltUpgradeDelta = beltUpgradePrice(beltUpgradeConfig, beltUpgrade);

  const beltConfig = beltSizingFor(product.slug);
  const productVariantsCount = variantCtx?.variants.length ?? 0;
  // Two cases:
  //   - variant-gated belt: product has variants AND active one is belt-bearing
  //   - whole-product belt: product is itself a belt (no variants), show always
  const beltActive = !!beltConfig && (
    productVariantsCount === 0
      ? true
      : variantHasBelt(activeVariant?.label)
  );
  // Drop the picked belt size if the buyer switches back to a non-belt variant.
  useEffect(() => {
    if (!beltActive && beltSize) {
      setBeltSize(null);
      setBeltSizeError(false);
    }
  }, [beltActive, beltSize]);

  // Whenever the buyer selects a different multi-buy deal (or clears it),
  // force them to re-confirm which variant the pack applies to.
  useEffect(() => {
    setConfirmedDealId(null);
  }, [activeDeal?.id]);

  const variantsCount = variantCtx?.variants.length ?? 0;
  const needsDealConfirm = !!activeDeal && variantsCount >= 2 && confirmedDealId !== activeDeal.id;

  const sizes = product.sizes ?? [];
  const tiers = product.qty_discount_tiers ?? [];
  const basePrice = useMemo(() => effectivePricePerUnit(variantPriceIdr, tiers, qty), [variantPriceIdr, tiers, qty]);
  const threadCharged = threadColor && !isFreeThreadColor(threadColor);
  const brandingActive = brandingEnabled && !!brandingConfig && brandingName.trim().length > 0;
  const brandingDelta = brandingActive && brandingConfig ? brandingConfig.priceIdr : 0;
  const repairCoverActive = repairCover && !!repairCoverConfig;
  const repairCoverDelta = repairCoverActive && repairCoverConfig ? repairCoverConfig.priceIdr : 0;
  const unitPrice = basePrice + (threadCharged ? threadDelta : 0) + (backpackStraps ? strapDelta : 0) + brandingDelta + repairCoverDelta + beltUpgradeDelta;

  const baseDispatchDays = product.dispatch_lead_days ?? 3;
  const customThreadDispatchDelay = threadOptionEnabled && threadCharged ? 2 : 0;
  const dispatchDays = baseDispatchDays + customThreadDispatchDelay;
  const lineTotal = unitPrice * qty;
  const savedPct = product.compare_at_idr && product.compare_at_idr > variantPriceIdr
    ? Math.round(((product.compare_at_idr - variantPriceIdr) / product.compare_at_idr) * 100)
    : 0;

  const soldOut = variantStock === 0;

  const onAdd = (): boolean => {
    if (needsDealConfirm) {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.([20, 40, 20]); } catch {}
      }
      document.getElementById("hx-deal-variant-confirm")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (sizes.length && !size) {
      setSizeError(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.([20, 40, 20]); } catch {}
      }
      document.getElementById("hx-size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (beltActive && !beltSize) {
      setBeltSizeError(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.([20, 40, 20]); } catch {}
      }
      document.getElementById("hx-belt-size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate?.([10, 30, 10]); } catch {}
    }
    cart.add({
      productId: product.id,
      slug: product.slug ?? product.id,
      name: product.name,
      sku: variantSku ?? null,
      image: variantImage,
      unitPriceIdr: unitPrice,
      qty,
      size,
      baseCurrency: product.base_currency ?? "IDR",
      threadColor,
      variantId: activeVariant?.id ?? null,
      variantLabel: activeVariant?.label ?? null,
      backpackStraps,
      // Multi-buy deals discount the PRODUCT only — never shipping. A 2-pack
      // / 3-pack line is qty=1 in the cart but represents `activeDeal.qty`
      // physical units, so scale the per-unit shipping override by that
      // pack size. This way the cart's shipping math (qty × shippingPerUnitIdr)
      // charges full shipping for every unit in the pack.
      //
      // Country surcharge: products configured for "free UK delivery"
      // (shipping_per_unit_idr === 0) charge non-UK buyers a flat £10
      // (= 238,270 IDR) per unit to cover air freight. UK buyers stay free.
      shippingPerUnitIdr: (() => {
        if (product.shipping_per_unit_idr == null) return null;
        const isFreeUkProduct = product.shipping_per_unit_idr === 0;
        const isNonUkBuyer = effectiveLocale.country !== "GB";
        const perUnit = isFreeUkProduct && isNonUkBuyer
          ? 238270 // £10 air freight surcharge for non-UK buyers on free-UK-shipping products
          : product.shipping_per_unit_idr;
        return perUnit * (activeDeal?.qty ?? 1);
      })(),
      beltSize: beltActive ? beltSize : null,
      customBrandName: brandingActive ? brandingName.trim() : null,
      repairCover: repairCoverActive,
      beltUpgrade: beltUpgradeLabel(beltUpgradeConfig, beltUpgrade)
    });
    // Belt add-ons (electrician pouch slides): each ticked belt is a fully
    // separate cart line — its own productId, own SKU, own per-unit
    // shipping — so it doesn't merge with the host pouch line and the
    // composite cart key stays correct.
    if (beltAddOns && selectedBeltAddOnIds.size > 0) {
      for (const belt of beltAddOns) {
        if (!selectedBeltAddOnIds.has(belt.id)) continue;
        cart.add({
          productId: belt.id,
          slug: belt.slug ?? belt.id,
          name: belt.name,
          sku: belt.sku ?? null,
          image: belt.image_url ?? null,
          unitPriceIdr: belt.price_idr,
          qty: 1,
          size: null,
          baseCurrency: belt.base_currency ?? "IDR",
          threadColor: null,
          variantId: null,
          variantLabel: null,
          backpackStraps: false,
          shippingPerUnitIdr: belt.shipping_per_unit_idr ?? null,
          beltSize: null,
          customBrandName: null,
          repairCover: false,
          beltUpgrade: null
        });
      }
    }
    sparkBurst(addButtonRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    return true;
  };

  const onBuyNow = () => {
    if (onAdd()) {
      window.location.href = "/checkout";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
        <span className="font-semibold text-brand-text">{product.brand ?? "Hammerex"}</span>
        <StockBadge count={variantStock} productId={product.id} isAccessory={product.is_accessory ?? false} />
      </div>

      <h1 className="text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{displayName}</h1>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {/* Mirror the live unit price from further down the buy column so
              the small headline price stays in sync as the buyer ticks
              upgrades (belt swap, thread colour, branding, trade cover) or
              picks a multi-buy deal. unitPrice already folds the deal /
              tier discounts in via basePrice. */}
          <span className="text-xl font-bold text-brand-text">{formatPriceOrQuote(unitPrice, currency)}</span>
          {activeDeal && dealPct > 0 && (
            <>
              <span className="text-sm text-brand-muted line-through">{formatPrice(variantBaseIdr * activeDeal.qty, currency)}</span>
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">−{dealPct}%</span>
            </>
          )}
          {!activeDeal && product.shipping_per_unit_idr === 0 && (
            <>
              <span className="text-brand-muted">—</span>
              <span className="font-semibold text-brand-accent">Free Shipping</span>
            </>
          )}
        </div>
        {variantSku && (
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-accent">
            Ref: <span className="text-brand-text">{variantSku}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="text-brand-accent" fill={i < 4 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-brand-muted">
            {product.rating_count ? `${product.rating_avg?.toFixed(1)} · ${product.rating_count} reviews` : "Be the first to review"}
          </span>
        </div>
        <YouTubeChannelButton />
      </div>

      <div role="tablist" aria-label="Product information" className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-brand-line pt-2">
        {[
          { key: "description" as const, label: "Description", available: !!displayOverview },
          { key: "specs"       as const, label: "Specs",       available: !!(specs && specs.length > 0) },
          { key: "features"    as const, label: "Features",    available: !!(product.features && product.features.length > 0) }
        ].filter((t) => t.available).map((t) => {
          const isActive = overviewView === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setOverviewView(t.key)}
              className={`relative -mb-px pb-2 text-sm font-semibold tracking-wide transition ${
                isActive
                  ? "text-brand-text"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {t.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brand-accent transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {overviewView === "description" && displayOverview && (
        <div className="flex flex-col gap-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">{displayOverview}</p>
          <p className="mt-4 border-t border-brand-line pt-5 text-xs leading-relaxed text-brand-muted">
            <span className="font-bold uppercase tracking-widest text-brand-accent">Ships fast</span>
            <span aria-hidden="true"> · </span>
            Dispatched <span className="font-semibold text-brand-text">48 hours</span> to postal service
            {customThreadDispatchDelay > 0 && (
              <span className="ml-1 text-brand-accent">(+{customThreadDispatchDelay} working days for custom thread)</span>
            )}
          </p>
        </div>
      )}
      {overviewView === "specs" && specs && specs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
          {Object.entries(
            specs.reduce<Record<string, HammerexProductSpec[]>>((acc, s) => {
              (acc[s.group_name] ||= []).push(s);
              return acc;
            }, {})
          ).map(([group, rows], i) => (
            <div key={group} className={i > 0 ? "border-t border-brand-line" : ""}>
              <h3 className="border-b border-brand-line bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
                {group}
              </h3>
              <dl className="divide-y divide-brand-line">
                {rows.map((r) => (
                  <div key={r.id} className="grid grid-cols-2 gap-3 px-4 py-2">
                    <dt className="text-xs uppercase tracking-wider text-brand-muted">{r.label}</dt>
                    <dd className="text-xs font-medium text-brand-text">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
      {overviewView === "features" && product.features && product.features.length > 0 && (
        <ul className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface divide-y divide-brand-line">
          {product.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 px-4 py-2.5 text-sm text-brand-text">
              <span className="mt-0.5 text-brand-accent" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Optional-upsells header — sits between the "Ships fast" line and
          the slider stack to frame all the accordions below as opt-in
          design tweaks rather than required choices. */}
      <div className="mt-2 flex flex-col gap-0.5 border-t border-brand-line pt-3">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-accent">
          Optional
        </span>
        <span className="text-xs text-brand-muted">
          Update your above belt design with the following options
        </span>
      </div>

      {/* Upsell + bundle accordions — moved here so they sit directly under
          the "Ships fast" line at the end of the description tab and stay
          visible regardless of which tab is active. Order matches the PDP
          spec: belt waist size → belt upgrade → thread → branding → trade
          cover → bundle → related products. */}
      {beltActive && beltConfig && (
        <CollapsibleSection
          title="Belt Sized To Fit Free"
          selectedLabel={
            beltSize
              ? `Selected: ${beltSize} · cut to your waist`
              : `No upcharge · default 44" ships if not selected`
          }
          defaultOpen={beltSizeError}
          closeOnSelection={beltSize}
        >
          <p className="mb-3 text-xs leading-relaxed text-brand-muted">
            <span className="font-semibold text-brand-accent">If no size is selected we ship the default 44".</span>{" "}
            For the best fit, pick the waist that fits you today — leather belts are cut to
            your number, not punched with extra holes. Allow{" "}
            <span className="font-semibold text-brand-text">3" up or down</span> of headroom for
            future weight gain or loss; beyond that the belt won't sit right.
          </p>
          <BeltSizeSelector
            sizes={beltConfig.sizes}
            value={beltSize}
            onChange={(s) => { setBeltSize(s); setBeltSizeError(false); }}
            guideUrl={beltConfig.guideUrl}
            flashFirst={beltSizeError}
          />
        </CollapsibleSection>
      )}

      {beltUpgradeConfig && (
        <BeltUpgradeSection
          config={beltUpgradeConfig}
          selected={beltUpgrade}
          onSelect={setBeltUpgrade}
          currency={currency}
        />
      )}

      {threadOptionEnabled && (() => {
        const palette = threadColorsFor(product.slug);
        const activeLabel = threadColor
          ? palette.find((c) => c.value === threadColor)?.label ?? null
          : null;
        const selectedLabel = activeLabel
          ? `Selected: ${activeLabel}${threadCharged ? ` · +${formatPrice(threadDelta, currency)}` : " · standard"}`
          : `Black free · others +${formatPrice(threadDelta, currency)}`;
        return (
          <CollapsibleSection title="Thread colour" selectedLabel={selectedLabel} closeOnSelection={threadColor}>
            <ThreadColorPicker
              productSlug={product.slug}
              value={threadColor}
              onChange={(c) => setThreadColor(c)}
              threadDeltaIdr={threadDelta}
              currency={currency}
            />
          </CollapsibleSection>
        );
      })()}

      {brandingConfig && (
        <CollapsibleSection
          title="Your company brand name"
          selectedLabel={
            brandingActive
              ? `Selected: "${brandingName.trim()}" · +${formatPrice(brandingConfig.priceIdr, currency)}`
              : `Optional · +${formatPrice(brandingConfig.priceIdr, currency)} each`
          }
          // Do NOT auto-close once branding is enabled — the buyer still
          // needs the company-name input visible to type their brand name.
          // The flash animation on the input handles the "look here next"
          // cue without forcing the slider to stay user-managed.
        >
          <CustomBrandingSection
            config={brandingConfig}
            enabled={brandingEnabled}
            onToggle={setBrandingEnabled}
            name={brandingName}
            onNameChange={setBrandingName}
            currency={currency}
          />
        </CollapsibleSection>
      )}

      {repairCoverConfig && (
        <CollapsibleSection
          title="Hammerex Pro Trade Cover"
          selectedLabel={
            repairCoverActive
              ? `Added: 3 years of trade-grade servicing · +${formatPrice(repairCoverConfig.priceIdr, currency)}`
              : `Optional · +${formatPrice(repairCoverConfig.priceIdr, currency)} one-off · 3 years`
          }
          closeOnSelection={repairCover}
        >
          <RepairCoverSection
            config={repairCoverConfig}
            enabled={repairCover}
            onToggle={setRepairCover}
            currency={currency}
          />
        </CollapsibleSection>
      )}

      {beltAddOns && beltAddOns.length > 0 && (
        <BeltAddOnSection
          options={beltAddOns}
          selected={selectedBeltAddOnIds}
          onToggle={(id, next) =>
            setSelectedBeltAddOnIds((prev) => {
              const nextSet = new Set(prev);
              if (next) nextSet.add(id);
              else nextSet.delete(id);
              return nextSet;
            })
          }
          currency={currency}
        />
      )}

      {bundle?.items.length ? (
        <BundleBlock bundle={bundle} anchorSlug={product.slug} currency={currency} inline />
      ) : null}

      {allCategories && allCategories.length > 0 && (
        <RelatedUpsell
          currentProductId={product.id}
          currentProductSlug={product.slug ?? product.id}
          currentProductName={product.name}
          currentCategory={currentCategory ?? null}
          categories={allCategories}
        />
      )}

      {/* "In Cart Now" panel — always shows the current product as the
          standard line (with currently-selected options' price) and any
          other items the buyer added from elsewhere on the page. Red
          delete on each row to drop a line. Standard-row qty is shared
          with the BuyColumn's main +/- via qty + setQty. */}
      <PdpRunningBasket
        product={product}
        unitPriceIdr={unitPrice}
        currency={currency}
        qty={qty}
        onQtyChange={setQty}
        stockCap={variantStock ?? null}
      />

      {/* Extra breathing room between the last upsell slider and the
          shipping/price section — visually separates "design your order"
          (sliders above) from "what you'll pay" (shipping + price below). */}
      <div aria-hidden="true" className="mt-6 border-t border-brand-line pt-6" />

      <DispatchCountdown cutoffHHMM={product.dispatch_cutoff_local} />

      <QuoteSignalBadge productId={product.id} />

      <div className="flex items-end justify-between border-t border-brand-line pt-4">
        <div>
          <div className="flex items-baseline gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className="bg-transparent text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer pr-1"
            >
              {CURRENCIES.map((c) => <option key={c} value={c} className="bg-brand-surface">{CURRENCY_FLAGS[c]} {c}</option>)}
            </select>
            {/* Big headline price now reflects qty × unit so it physically
                grows as the buyer adds quantity — the number they're about
                to actually pay, not a static per-unit anchor. The per-unit
                price moves to a smaller line below. */}
            <span className="text-2xl font-bold text-brand-text">{formatPriceOrQuote(lineTotal, currency)}</span>
            {activeDeal && dealPct > 0 ? (
              <>
                <span className="text-sm text-brand-muted line-through">{formatPrice(variantBaseIdr * activeDeal.qty * qty, currency)}</span>
                <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">−{dealPct}%</span>
              </>
            ) : (
              <>
                {product.compare_at_idr && product.compare_at_idr > unitPrice && (
                  <span className="text-sm text-brand-muted line-through">{formatPrice(product.compare_at_idr * qty, currency)}</span>
                )}
                {savedPct > 0 && (
                  <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-semibold text-brand-accent">−{savedPct}%</span>
                )}
              </>
            )}
          </div>
          {/* Per-unit price under the big headline — always visible so the
              buyer can sanity-check the maths (qty × unit = headline). */}
          <div className="text-xs text-brand-muted">
            {qty > 1 ? (
              <>
                {qty} × <span className="font-semibold text-brand-text">{formatPriceOrQuote(unitPrice, currency)}</span> per unit
              </>
            ) : (
              <>
                Per unit · <span className="font-semibold text-brand-text">{formatPriceOrQuote(unitPrice, currency)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-xl font-bold text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >−</button>
          <span className="w-7 text-center text-base font-bold text-brand-text" aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(variantStock ?? 99, q + 1))}
            aria-label="Increase quantity"
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-accent text-xl font-bold text-black shadow-[0_2px_8px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >+</button>
        </div>
      </div>

      {/* Shipping panel — sits directly under the price + qty controls so
          the buyer sees what they pay and how it ships in the same beat.
          Free-UK case renders as inline text (no container) — keeps the
          layout calm when nothing needs to be paid. The other two cases
          keep their container since they're carrying a price / quote
          signal that deserves emphasis. All copy names EMS as the carrier
          since we don't run our own delivery network. */}
      {effectiveLocale.country && (() => {
        const isFreeUkProduct = (product.shipping_per_unit_idr ?? null) === 0;
        const isUk = effectiveLocale.country === "GB";
        const isFreeForBuyer = isFreeUkProduct && isUk;
        if (isFreeForBuyer) {
          return (
            <p className="px-1 text-xs leading-relaxed text-brand-text">
              <span className="font-bold uppercase tracking-widest text-brand-accent">Free shipping to UK</span>
              <span className="text-brand-muted"> — delivered free via EMS · 4–5 working days dispatch · ~5–7 days air freight.</span>
            </p>
          );
        }
        if (isFreeUkProduct && !isUk) {
          return (
            <div className="flex items-center gap-3 rounded-xl border border-brand-line bg-brand-surface p-3">
              <span className="text-2xl leading-none" aria-hidden="true">{effectiveLocale.flag || "\u{1F30D}"}</span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                  Shipping to {effectiveLocale.countryName || effectiveLocale.country}
                </span>
                <span className="text-xs text-brand-text">
                  <span className="font-semibold">+{formatPrice(238270, currency)} air freight via EMS</span> · free for UK · 4–5 day dispatch · ~5–7 days air freight
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-3 rounded-xl border border-brand-line bg-brand-surface p-3">
            <span className="text-2xl leading-none" aria-hidden="true">{effectiveLocale.flag || "\u{1F30D}"}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Shipping to {effectiveLocale.countryName || effectiveLocale.country}
              </span>
              <span className="text-xs text-brand-muted">
                Shipped via EMS · 4–5 day dispatch · ~5–7 days air freight (sea ~3–4 weeks) · price confirmed on WhatsApp at checkout
              </span>
            </div>
          </div>
        );
      })()}

      {variantCtx && variantCtx.variants.length > 0 && <VariantSelector currency={currency} />}

      {/* DealBreakerCard intentionally removed from PDPs (per user 2026-06-15).
          The "Deal Breakers" mechanic now lives on the checkout page as a
          curated 5-item universal add-on lot. See CheckoutDealBreakers. */}

      {sizes.length > 0 && (
        <div id="hx-size-selector">
          <SizeSelector
            sizes={sizes}
            value={size}
            onChange={(s) => { setSize(s); setSizeError(false); }}
            flashFirst={sizeError}
          />
        </div>
      )}

      {strapOptionEnabled && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              Backpack straps
            </span>
            <span className="text-xs text-brand-muted">
              Standard carry free · add straps +{formatPrice(strapDelta, currency)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Backpack straps option">
            <button
              type="button"
              role="radio"
              aria-checked={!backpackStraps}
              onClick={() => setBackpackStraps(false)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                !backpackStraps ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent"
              }`}
            >
              Standard carry
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={backpackStraps}
              onClick={() => setBackpackStraps(true)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                backpackStraps ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-accent"
              }`}
            >
              Add backpack straps
              <span className="text-xs font-semibold text-brand-accent">+{formatPrice(strapDelta, currency)}</span>
            </button>
          </div>
        </div>
      )}

      {needsDealConfirm && activeDeal && variantCtx && (
        <div
          id="hx-deal-variant-confirm"
          className="rounded-2xl border-2 border-brand-accent bg-brand-accent/10 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Confirm your {activeDeal.qty}-pack option
            </span>
            <span className="text-xs uppercase tracking-widest text-brand-muted">
              Required
            </span>
          </div>
          <p className="mb-3 text-xs text-brand-muted">
            All {activeDeal.qty} units in this pack will be the same option.
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Confirm multi-buy option">
            {variantCtx.variants.map((v) => {
              const isPicked = variantCtx.active?.id === v.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    onClick={() => {
                      variantCtx.setActiveId(v.id);
                      setConfirmedDealId(activeDeal.id);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                      isPicked
                        ? "border-brand-accent bg-brand-bg"
                        : "border-brand-line bg-brand-surface hover:border-brand-accent"
                    }`}
                  >
                    {v.image_url && (
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.image_url} alt={v.label} className="h-full w-full object-contain p-1" />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-semibold leading-tight text-brand-text">
                        {activeDeal.qty} × {v.label}
                      </span>
                      <span className="text-xs text-brand-muted">Tap to confirm</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          ref={addButtonRef}
          type="button"
          onClick={onAdd}
          disabled={soldOut || needsDealConfirm}
          className="relative h-12 overflow-visible rounded-full border-2 border-brand-accent bg-transparent px-3 text-xs font-bold uppercase tracking-wider text-brand-accent transition active:scale-[0.97] hover:bg-brand-accent/10 disabled:opacity-40 sm:text-sm"
        >
          {soldOut
            ? "Notify me when back"
            : needsDealConfirm
              ? "Confirm option above"
              : added
                ? "Added ✓"
                : sizeError
                  ? "Pick a size"
                  : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          disabled={soldOut || needsDealConfirm}
          className="h-12 rounded-full bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-[0.97] hover:opacity-90 disabled:opacity-40 sm:text-sm"
        >
          {needsDealConfirm ? "Confirm option above" : "Buy now →"}
        </button>
      </div>

      {/* Stripe Pay-now CTA — feature-flagged off by default. Only renders
          when NEXT_PUBLIC_STRIPE_ENABLED=true AND the product ships free
          to the UK. The button reads cart at click time, hits the
          /api/checkout/stripe route, then redirects to Stripe-hosted
          checkout. Capture is manual on the server side so the dispatch
          buffer is preserved. */}
      <StripePayNowButton productHasFreeUkDelivery={product.shipping_per_unit_idr === 0} />

      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-brand-line bg-brand-surface/60 p-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          Payment arranged via WhatsApp · all major methods accepted
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://ik.imagekit.io/9mrgsv2rp/Untitledsdfsdfsdfdfdf-removebg-preview.png?updatedAt=1781804828663"
          alt="Visa, Mastercard, Amex, PayPal, Apple Pay, bank transfer and WhatsApp accepted"
          className="h-8 w-auto max-w-full"
        />
      </div>

      <a
        href="/cart"
        className="grid h-12 place-items-center rounded-full border border-brand-line bg-brand-surface text-sm font-semibold text-brand-text hover:border-brand-accent"
      >
        View cart
      </a>

      <PurchaseNotes notes={product.purchase_notes} />

      <a
        href="/terms-and-conditions#warranty-and-repair"
        className="block rounded-xl border border-brand-accent/40 bg-brand-accent/5 p-3 text-xs text-brand-muted transition hover:border-brand-accent"
      >
        <div className="flex items-center gap-2 text-brand-accent">
          <Shield />
          <span className="font-bold uppercase tracking-widest">1-year warranty · 3-year repair service</span>
        </div>
        <p className="mt-1 leading-relaxed">
          <span className="font-semibold text-brand-text">Year 1:</span> faulty on arrival or
          a manufacturing defect within 12 months — we repair or replace free, return postage
          covered both ways.{" "}
          <span className="font-semibold text-brand-text">Years 2–3:</span> zippers, stitching,
          fasteners and clings eventually wear under daily site use. We&apos;ll still repair
          smaller issues at our workshop — you cover postage both ways, we cover parts and
          labour. Every order recorded by CCTV at dispatch.{" "}
          <span className="font-semibold text-brand-text">See terms →</span>
        </p>
      </a>

      <ul className="grid grid-cols-2 gap-2 text-xs font-bold text-black">
        <li className="flex items-center gap-2 rounded-lg bg-brand-accent p-2 shadow-[0_2px_8px_rgba(255,179,0,0.35)]">
          <Shield /> Authentic
        </li>
        <li className="flex items-center gap-2 rounded-lg bg-brand-accent p-2 shadow-[0_2px_8px_rgba(255,179,0,0.35)]">
          <Calendar /> 1-yr warranty · 3-yr repair
        </li>
        <li className="flex items-center gap-2 rounded-lg bg-brand-accent p-2 shadow-[0_2px_8px_rgba(255,179,0,0.35)]">
          <Return /> 72-hour returns
        </li>
        <li className="flex items-center gap-2 rounded-lg bg-brand-accent p-2 shadow-[0_2px_8px_rgba(255,179,0,0.35)]">
          <Lock /> Secure checkout
        </li>
      </ul>

    </div>
  );
}

function Shield() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/><path d="m9 12 2 2 4-4"/></svg>;
}
function Calendar() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function Return() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 5v5h5"/></svg>;
}
function Lock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

