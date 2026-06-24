"use client";

// Catalogue client orchestrator. Owns:
//   - filter state (trades, tools, price band, moq band, margin band, has
//     variants, in stock, new arrivals)
//   - URL sync (mirror filters into searchParams so a reload preserves them)
//   - active-filter chips bar
//   - "Added to cart" toast banner
//   - pagination cursor (`visible` cap, "Load more" bumps by PAGE_SIZE)
//
// The grid itself + the rail are dumb children; they get props and call
// back via setters. Keeping orchestration in one place makes the URL ↔
// state ↔ chips wiring much easier to reason about.

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BRAND } from "@/lib/seo";
import type { Currency } from "@/lib/fx";
import { FilterRail } from "./FilterRail";
import { TradeProductCard } from "./TradeProductCard";
import { marginOffRrp } from "@/lib/trade-fx";
import { QuickOrderBar } from "@/components/trade/QuickOrderBar";
import { BulkGridView } from "@/components/trade/BulkGridView";
import type { BulkGridProduct } from "@/components/trade/bulkAddTypes";

export type TradeCatalogueCategory = { slug: string; name: string };

export type TradeCatalogueProduct = {
  id: string;
  slug: string | null;
  name: string;
  sku: string | null;
  image_url: string | null;
  price_idr: number;
  trade_price_gbp: number;
  moq: number;
  stock_count: number;
  created_at: string;
  variants_count: number;
  sizes_count: number;
  has_thread_color: boolean;
  trades: string[];
  tool_slug: string | null;
};

export type TradeCatalogueAccount = {
  id: string;
  trade_account_no: string;
  company_name: string;
  contact_email: string;
  currency: string;
};

export type PriceBand = "u10" | "10-50" | "50-200" | "200+";
export type MoqBand = "<=6" | "<=12" | "<=48" | "50+";
export type MarginBand = "30" | "40" | "50";

const PAGE_SIZE = 60;

// Hard-coded for now (per spec). Phase 3 can pull from a settings table.
const ACCOUNT_MANAGER_EMAIL = "philip@hammerexdirect.com";

function priceBandBounds(band: PriceBand): [number, number] {
  // Bounds expressed in the buyer's account currency. The card values are
  // already in account currency by the time we filter (we convert in JS),
  // so a single bound set in account currency is what we compare against.
  // The bounds themselves are anchored to the GBP scale defined in the
  // spec — when the account is USD/EUR/IDR the bands still mean the same
  // bracket, just rendered in their currency.
  if (band === "u10") return [0, 10];
  if (band === "10-50") return [10, 50];
  if (band === "50-200") return [50, 200];
  return [200, Number.POSITIVE_INFINITY];
}

function moqBandMatch(moq: number, band: MoqBand): boolean {
  if (band === "<=6") return moq <= 6;
  if (band === "<=12") return moq <= 12;
  if (band === "<=48") return moq <= 48;
  return moq >= 50;
}

function inLast30Days(iso: string): boolean {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < 30 * 24 * 60 * 60 * 1000;
}

export function CatalogueClient({
  account,
  products,
  trades,
  tools
}: {
  account: TradeCatalogueAccount;
  products: TradeCatalogueProduct[];
  trades: TradeCatalogueCategory[];
  tools: TradeCatalogueCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // -------- filter state initialised from URL --------
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(
    () => new Set((searchParams.get("trades") ?? "").split(",").filter(Boolean))
  );
  const [selectedTools, setSelectedTools] = useState<Set<string>>(
    () => new Set((searchParams.get("tools") ?? "").split(",").filter(Boolean))
  );
  const [priceBand, setPriceBand] = useState<PriceBand | null>(
    () => (searchParams.get("price") as PriceBand | null) ?? null
  );
  const [moqBand, setMoqBand] = useState<MoqBand | null>(
    () => (searchParams.get("moq") as MoqBand | null) ?? null
  );
  const [marginBand, setMarginBand] = useState<MarginBand | null>(
    () => (searchParams.get("margin") as MarginBand | null) ?? null
  );
  const [hasVariants, setHasVariants] = useState<boolean>(
    () => searchParams.get("variants") === "1"
  );
  const [inStock, setInStock] = useState<boolean>(
    () => searchParams.get("stock") === "1"
  );
  const [newArrivals, setNewArrivals] = useState<boolean>(
    () => searchParams.get("new") === "1"
  );

  // -------- URL sync --------
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTrades.size) params.set("trades", Array.from(selectedTrades).join(","));
    if (selectedTools.size) params.set("tools", Array.from(selectedTools).join(","));
    if (priceBand) params.set("price", priceBand);
    if (moqBand) params.set("moq", moqBand);
    if (marginBand) params.set("margin", marginBand);
    if (hasVariants) params.set("variants", "1");
    if (inStock) params.set("stock", "1");
    if (newArrivals) params.set("new", "1");
    const q = params.toString();
    const next = q ? `${pathname}?${q}` : pathname;
    startTransition(() => {
      router.replace(next, { scroll: false });
    });
  }, [selectedTrades, selectedTools, priceBand, moqBand, marginBand, hasVariants, inStock, newArrivals, pathname, router]);

  // -------- filtered list --------
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedTrades.size > 0) {
        const hit = p.trades.some((t) => selectedTrades.has(t));
        if (!hit) return false;
      }
      if (selectedTools.size > 0) {
        if (!p.tool_slug || !selectedTools.has(p.tool_slug)) return false;
      }
      if (priceBand) {
        // Compare in GBP since the band thresholds are GBP-anchored. We
        // convert only the trade price to GBP, which is itself — i.e. the
        // GBP figure straight off the row.
        const [lo, hi] = priceBandBounds(priceBand);
        const gbp = p.trade_price_gbp;
        if (!(gbp >= lo && gbp < hi)) return false;
      }
      if (moqBand && !moqBandMatch(p.moq ?? 1, moqBand)) return false;
      if (marginBand) {
        const m = marginOffRrp(p.trade_price_gbp, p.price_idr);
        const want = Number(marginBand);
        if (m == null || m < want) return false;
      }
      if (hasVariants && p.variants_count === 0 && p.sizes_count === 0 && !p.has_thread_color) {
        return false;
      }
      if (inStock && !(p.stock_count > 0)) return false;
      if (newArrivals && !inLast30Days(p.created_at)) return false;
      return true;
    });
  }, [products, selectedTrades, selectedTools, priceBand, moqBand, marginBand, hasVariants, inStock, newArrivals]);

  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => { setVisible(PAGE_SIZE); }, [filtered.length]);
  const visibleProducts = filtered.slice(0, visible);

  // -------- chips for active filters --------
  type Chip = { key: string; label: string; clear: () => void };
  const chips: Chip[] = [];
  for (const slug of selectedTrades) {
    const cat = trades.find((c) => c.slug === slug);
    if (!cat) continue;
    chips.push({
      key: `t-${slug}`,
      label: `Trade: ${cat.name}`,
      clear: () => setSelectedTrades((s) => { const n = new Set(s); n.delete(slug); return n; })
    });
  }
  for (const slug of selectedTools) {
    const cat = tools.find((c) => c.slug === slug);
    if (!cat) continue;
    chips.push({
      key: `c-${slug}`,
      label: `Category: ${cat.name}`,
      clear: () => setSelectedTools((s) => { const n = new Set(s); n.delete(slug); return n; })
    });
  }
  if (priceBand) {
    const labels: Record<PriceBand, string> = {
      "u10": "Under £10",
      "10-50": "£10–£50",
      "50-200": "£50–£200",
      "200+": "£200+"
    };
    chips.push({ key: "price", label: `Price: ${labels[priceBand]}`, clear: () => setPriceBand(null) });
  }
  if (moqBand) {
    const labels: Record<MoqBand, string> = {
      "<=6": "MOQ ≤ 6",
      "<=12": "MOQ ≤ 12",
      "<=48": "MOQ ≤ 48",
      "50+": "MOQ 50+"
    };
    chips.push({ key: "moq", label: labels[moqBand], clear: () => setMoqBand(null) });
  }
  if (marginBand) {
    chips.push({ key: "margin", label: `${marginBand}%+ off RRP`, clear: () => setMarginBand(null) });
  }
  if (hasVariants) chips.push({ key: "variants", label: "Has variants", clear: () => setHasVariants(false) });
  if (inStock) chips.push({ key: "stock", label: "In stock now", clear: () => setInStock(false) });
  if (newArrivals) chips.push({ key: "new", label: "New arrivals", clear: () => setNewArrivals(false) });

  function clearAll() {
    setSelectedTrades(new Set());
    setSelectedTools(new Set());
    setPriceBand(null);
    setMoqBand(null);
    setMarginBand(null);
    setHasVariants(false);
    setInStock(false);
    setNewArrivals(false);
  }

  // -------- toast (Add to cart confirmation) --------
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // -------- mobile filter drawer --------
  const [mobileOpen, setMobileOpen] = useState(false);

  // -------- view mode (cards | grid) --------
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");

  // -------- product list for BulkGridView (mapped from TradeCatalogueProduct) --------
  // Variants are NOT included in the catalogue query — bulk-grid shows parent
  // SKUs only. Buyers needing per-variant qty use the card view + PDP, or
  // paste variant SKUs directly into QuickOrderBar.
  const bulkProducts: BulkGridProduct[] = useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        sku: p.sku ?? "",
        name: p.name,
        trade_price_gbp: p.trade_price_gbp,
        moq: p.moq,
        variants: []
      })),
    [filtered]
  );

  const accountCurrency = (account.currency || "GBP") as Currency;
  const waDigits = BRAND.whatsapp.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
      {/* ---------- welcome strip ---------- */}
      <section className="rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Trade Catalogue
            </p>
            <h1 className="mt-1 text-lg font-bold text-brand-text sm:text-xl">
              Welcome back, {account.company_name}.
            </h1>
            <p className="mt-1 text-xs text-brand-muted">
              Trade account:{" "}
              <span className="font-mono text-brand-text">{account.trade_account_no}</span>
              {" · "}
              Currency: <span className="text-brand-text">{accountCurrency}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-brand-line bg-brand-bg p-3 text-xs">
            <p className="font-semibold text-brand-text">Your contact: Philip O'Farrell</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-accent underline-offset-2 hover:underline"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${ACCOUNT_MANAGER_EMAIL}`}
                className="text-brand-accent underline-offset-2 hover:underline"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <QuickOrderBar onSwitchToGrid={() => setViewMode("grid")} />
        </div>
      </section>

      {/* ---------- chips bar ---------- */}
      {chips.length > 0 && (
        <section className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
            Filters:
          </span>
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
            >
              {c.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-xs font-semibold uppercase tracking-wider text-brand-muted underline-offset-2 hover:text-brand-accent hover:underline"
          >
            Clear all
          </button>
        </section>
      )}

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ---------- filter rail (desktop) ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-brand-line bg-brand-surface p-4">
            <FilterRail
              trades={trades}
              tools={tools}
              selectedTrades={selectedTrades}
              setSelectedTrades={setSelectedTrades}
              selectedTools={selectedTools}
              setSelectedTools={setSelectedTools}
              priceBand={priceBand}
              setPriceBand={setPriceBand}
              moqBand={moqBand}
              setMoqBand={setMoqBand}
              marginBand={marginBand}
              setMarginBand={setMarginBand}
              hasVariants={hasVariants}
              setHasVariants={setHasVariants}
              inStock={inStock}
              setInStock={setInStock}
              newArrivals={newArrivals}
              setNewArrivals={setNewArrivals}
            />
          </div>
        </aside>

        {/* ---------- mobile filter toggle ---------- */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-full items-center justify-between rounded-xl border border-brand-line bg-brand-surface px-4 text-xs font-bold uppercase tracking-widest text-brand-text"
          >
            <span>Filters{chips.length ? ` (${chips.length})` : ""}</span>
            <span aria-hidden="true">{mobileOpen ? "▴" : "▾"}</span>
          </button>
          {mobileOpen && (
            <div className="mt-3 rounded-2xl border border-brand-line bg-brand-surface p-4">
              <FilterRail
                trades={trades}
                tools={tools}
                selectedTrades={selectedTrades}
                setSelectedTrades={setSelectedTrades}
                selectedTools={selectedTools}
                setSelectedTools={setSelectedTools}
                priceBand={priceBand}
                setPriceBand={setPriceBand}
                moqBand={moqBand}
                setMoqBand={setMoqBand}
                marginBand={marginBand}
                setMarginBand={setMarginBand}
                hasVariants={hasVariants}
                setHasVariants={setHasVariants}
                inStock={inStock}
                setInStock={setInStock}
                newArrivals={newArrivals}
                setNewArrivals={setNewArrivals}
              />
            </div>
          )}
        </div>

        {/* ---------- grid ---------- */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
              {filtered.length !== products.length ? ` of ${products.length}` : ""}
            </p>
            <div className="inline-flex overflow-hidden rounded-full border border-brand-line bg-brand-surface text-[13px] font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                className={`px-3 py-1.5 transition ${
                  viewMode === "cards"
                    ? "bg-brand-accent text-black"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`px-3 py-1.5 transition ${
                  viewMode === "grid"
                    ? "bg-brand-accent text-black"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                Bulk grid
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState message="No trade pricing set on any products yet. Contact your account manager." />
          ) : filtered.length === 0 ? (
            <EmptyState message="No products match these filters. Try clearing one." />
          ) : viewMode === "grid" ? (
            <BulkGridView products={bulkProducts} />
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5">
                {visibleProducts.map((p) => (
                  <li key={p.id}>
                    <TradeProductCard
                      product={p}
                      accountCurrency={accountCurrency}
                      onAdded={(qty, bumped) => {
                        setToast(
                          bumped
                            ? `Added ${qty}× — bumped up to MOQ ${qty}.`
                            : `Added ${qty}× to cart.`
                        );
                      }}
                      onError={(msg) => setToast(`Couldn't add: ${msg}`)}
                    />
                  </li>
                ))}
              </ul>

              {visible < filtered.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-brand-accent bg-brand-accent/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-brand-accent transition hover:bg-brand-accent hover:text-black"
                  >
                    Load more ({filtered.length - visible} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ---------- toast banner ---------- */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit max-w-[92vw] rounded-full border border-brand-accent bg-brand-bg px-4 py-2 text-xs font-semibold text-brand-text shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-8 text-center">
      <p className="text-sm font-semibold text-brand-text">{message}</p>
    </div>
  );
}
