"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { imageUrl } from "@/lib/imageUrl";
import { FX } from "@/lib/fx";
import { useDraft, type Draft } from "./useDraft";

// Admin-only £ sanity preview. Storage stays IDR-canonical — this is just
// "if I sold this at the current FX, that's about £X.XX" so the owner can
// cross-check that the Rp input isn't off by an order of magnitude. Hidden
// from customers; never round-tripped through the API.
const IDR_PER_GBP = 1 / FX.GBP.perIDR;
function idrToGbp(idr: number): number {
  return idr / IDR_PER_GBP;
}
function idrToGbpPreview(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return "";
  const gbp = idrToGbp(n);
  if (gbp < 0.01) return "≈ £0.00";
  return `≈ £${gbp.toFixed(2)}`;
}

// Margin hint shown under the trade-£ input when both retail (IDR) and
// trade (GBP) prices are set. Converts the retail IDR to GBP at current FX
// and reports what discount the trade price represents off the would-be RRP.
// FX is indicative — the helper text on the page already says so for retail,
// and the same caveat applies here.
function tradeMarginHint(retailIdr: number, tradeGbpRaw: string): string | null {
  const tradeGbp = Number(tradeGbpRaw);
  if (!Number.isFinite(tradeGbp) || tradeGbp <= 0) return null;
  if (!retailIdr || retailIdr <= 0) return null;
  const retailGbp = idrToGbp(retailIdr);
  if (retailGbp <= 0) return null;
  if (tradeGbp >= retailGbp) {
    // Trade price ≥ RRP — almost certainly a typo, surface it so the owner notices.
    return `≈ trade ≥ RRP £${retailGbp.toFixed(2)}`;
  }
  const offPct = Math.round(((retailGbp - tradeGbp) / retailGbp) * 100);
  return `≈ ${offPct}% off RRP £${retailGbp.toFixed(2)}`;
}

export type VariantLite = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price_idr: number;
  price_idr_sea: number;
  is_default: boolean;
  sort_order: number;
  trade_price_gbp: number | null;
  moq: number | null;
};

export type PricingRow = {
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
  variants: VariantLite[];
  is_featured: boolean;
  trade_price_gbp: number | null;
  moq: number | null;
};

export type CategoryLite = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

type RetailParentFields = { idr: string; freeUk: boolean; seaIdr: string; freeSea: boolean };
type RetailVariantFields = { idr: string; seaIdr: string };
type TradeParentFields  = { tradeGbp: string; moq: string };
type TradeVariantFields = { tradeGbp: string; moq: string };

type Mode = "retail" | "trade";

function idrString(idr: number): string {
  if (!idr) return "";
  return String(idr);
}

// trade_price_gbp is numeric(12,2) — the driver returns it as either a
// number or a string depending on the supabase-js version. Normalise here so
// the form input always sees the canonical "12.50"-style representation
// (and missing → "").
function gbpString(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2);
}

function moqString(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function PricingGrid({ rows, categories }: { rows: PricingRow[]; categories: CategoryLite[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode: Mode = searchParams.get("mode") === "trade" ? "trade" : "retail";

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [zeroOnly, setZeroOnly] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function setMode(next: Mode) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "trade") params.set("mode", "trade");
    else params.delete("mode");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Retail draft state — parent rows.
  const retailParent = useDraft<RetailParentFields>(() => {
    const out: Record<string, RetailParentFields> = {};
    for (const r of rows) {
      out[r.id] = {
        idr: idrString(r.price_idr),
        freeUk: r.shipping_per_unit_idr === 0,
        seaIdr: idrString(r.price_idr_sea),
        freeSea: r.free_shipping_sea === true
      };
    }
    return out;
  });

  // Retail draft state — variants.
  const retailVariants = useDraft<RetailVariantFields>(() => {
    const out: Record<string, RetailVariantFields> = {};
    for (const r of rows) {
      for (const v of r.variants) {
        out[v.id] = { idr: idrString(v.price_idr), seaIdr: idrString(v.price_idr_sea) };
      }
    }
    return out;
  });

  // Trade draft state — parent rows.
  const tradeParent = useDraft<TradeParentFields>(() => {
    const out: Record<string, TradeParentFields> = {};
    for (const r of rows) {
      out[r.id] = { tradeGbp: gbpString(r.trade_price_gbp), moq: moqString(r.moq) };
    }
    return out;
  });

  // Trade draft state — variants.
  const tradeVariants = useDraft<TradeVariantFields>(() => {
    const out: Record<string, TradeVariantFields> = {};
    for (const r of rows) {
      for (const v of r.variants) {
        out[v.id] = { tradeGbp: gbpString(v.trade_price_gbp), moq: moqString(v.moq) };
      }
    }
    return out;
  });

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [zoom]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (categoryId !== "all" && r.category_id !== categoryId) return false;
      if (zeroOnly && r.price_idr !== 0) return false;
      if (q) {
        const hay = `${r.name} ${r.sku ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, categoryId, zeroOnly]);

  // --- Save handlers ---------------------------------------------------------

  async function saveRetailParent(id: string) {
    await retailParent.save(id, async (draft) => {
      const idr = draft.idr.trim() === "" ? 0 : Number(draft.idr);
      if (!Number.isFinite(idr) || idr < 0) return { ok: false, error: "Rp price must be a number ≥ 0." };
      const seaIdr = draft.seaIdr.trim() === "" ? 0 : Number(draft.seaIdr);
      if (!Number.isFinite(seaIdr) || seaIdr < 0) return { ok: false, error: "Rp SEA price must be a number ≥ 0." };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_idr: Math.round(idr),
          free_uk_delivery: draft.freeUk,
          price_idr_sea: Math.round(seaIdr),
          free_shipping_sea: draft.freeSea
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) return { ok: false, error: json.error || `Save failed (${res.status}).` };
      return { ok: true };
    });
  }

  async function saveRetailVariant(id: string) {
    await retailVariants.save(id, async (draft) => {
      const idr = draft.idr.trim() === "" ? 0 : Number(draft.idr);
      if (!Number.isFinite(idr) || idr < 0) return { ok: false, error: "Rp price must be a number ≥ 0." };
      const seaIdr = draft.seaIdr.trim() === "" ? 0 : Number(draft.seaIdr);
      if (!Number.isFinite(seaIdr) || seaIdr < 0) return { ok: false, error: "Rp SEA price must be a number ≥ 0." };
      const res = await fetch(`/api/admin/product-variants/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_idr: Math.round(idr), price_idr_sea: Math.round(seaIdr) })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) return { ok: false, error: json.error || `Save failed (${res.status}).` };
      return { ok: true };
    });
  }

  async function saveTradeParent(id: string) {
    await tradeParent.save(id, async (draft) => {
      const tradeRaw = draft.tradeGbp.trim();
      const moqRaw = draft.moq.trim();
      let tradeGbp: number | null = null;
      if (tradeRaw !== "") {
        const n = Number(tradeRaw);
        if (!Number.isFinite(n) || n <= 0) return { ok: false, error: "Trade £ must be > 0 or blank." };
        tradeGbp = Math.round(n * 100) / 100;
      }
      let moq: number | null = null;
      if (moqRaw !== "") {
        const n = Number(moqRaw);
        if (!Number.isInteger(n) || n < 1) return { ok: false, error: "MOQ must be an integer ≥ 1 or blank." };
        moq = n;
      }
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_price_gbp: tradeGbp, moq })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) return { ok: false, error: json.error || `Save failed (${res.status}).` };
      return { ok: true };
    });
  }

  async function saveTradeVariant(id: string) {
    await tradeVariants.save(id, async (draft) => {
      const tradeRaw = draft.tradeGbp.trim();
      const moqRaw = draft.moq.trim();
      let tradeGbp: number | null = null;
      if (tradeRaw !== "") {
        const n = Number(tradeRaw);
        if (!Number.isFinite(n) || n <= 0) return { ok: false, error: "Trade £ must be > 0 or blank." };
        tradeGbp = Math.round(n * 100) / 100;
      }
      let moq: number | null = null;
      if (moqRaw !== "") {
        const n = Number(moqRaw);
        if (!Number.isInteger(n) || n < 1) return { ok: false, error: "MOQ must be an integer ≥ 1 or blank." };
        moq = n;
      }
      const res = await fetch(`/api/admin/product-variants/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_price_gbp: tradeGbp, moq })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) return { ok: false, error: json.error || `Save failed (${res.status}).` };
      return { ok: true };
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3">
        <div className="inline-flex rounded-full border border-brand-line bg-brand-bg p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("retail")}
            className={`rounded-full px-4 py-1.5 transition ${
              mode === "retail" ? "bg-brand-accent text-black" : "text-brand-muted hover:text-brand-text"
            }`}
            aria-pressed={mode === "retail"}
          >
            Retail
          </button>
          <button
            type="button"
            onClick={() => setMode("trade")}
            className={`rounded-full px-4 py-1.5 transition ${
              mode === "trade" ? "bg-brand-accent text-black" : "text-brand-muted hover:text-brand-text"
            }`}
            aria-pressed={mode === "trade"}
          >
            Trade
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or Ref…"
          className="h-10 flex-1 min-w-[180px] rounded-full border border-brand-line bg-brand-bg px-4 text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 rounded-full border border-brand-line bg-brand-bg px-3 text-xs font-semibold text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {mode === "retail" && (
          <label className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-xs font-semibold text-brand-text">
            <input
              type="checkbox"
              checked={zeroOnly}
              onChange={(e) => setZeroOnly(e.target.checked)}
              className="h-4 w-4 accent-brand-accent"
            />
            Only Rp 0
          </label>
        )}
        <span className="ml-auto text-xs text-brand-muted">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const dRetail = retailParent.drafts[r.id];
          const dTrade  = tradeParent.drafts[r.id];
          const thumb = imageUrl(r.image_url, 320) ?? r.image_url ?? null;
          const big   = imageUrl(r.image_url, 1600) ?? r.image_url ?? null;
          const hasVariants = r.variants.length > 0;
          const isOpen = expanded[r.id] === true;
          return (
            <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => big && setZoom({ src: big, alt: r.name })}
                  aria-label={`Enlarge ${r.name}`}
                  className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand-line bg-black transition hover:border-brand-accent"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={r.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-brand-muted">No img</span>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-brand-text">{r.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-brand-muted">
                    {r.sku ? (
                      <span className="font-mono font-semibold text-brand-accent">Ref: {r.sku}</span>
                    ) : (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-300">No Ref</span>
                    )}
                    {hasVariants && (
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [r.id]: !isOpen }))}
                        aria-expanded={isOpen}
                        className={`rounded-full px-2 py-0.5 font-semibold transition ${
                          isOpen
                            ? "bg-brand-accent text-black"
                            : "bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25"
                        }`}
                      >
                        {isOpen ? "▾" : "▸"} {r.variants.length} variants
                      </button>
                    )}
                    {r.is_featured && (
                      <span className="rounded-full border border-brand-line bg-black/30 px-2 py-0.5">Featured</span>
                    )}
                    {r.slug && (
                      <a href={`/product/${r.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">PDP →</a>
                    )}
                  </div>
                </div>
              </div>

              {mode === "retail" ? (
                <RetailParentBlock
                  row={r}
                  draft={dRetail}
                  hasVariants={hasVariants}
                  onField={retailParent.setField}
                  onSave={saveRetailParent}
                />
              ) : (
                <TradeParentBlock
                  row={r}
                  draft={dTrade}
                  onField={tradeParent.setField}
                  onSave={saveTradeParent}
                />
              )}

              {hasVariants && isOpen && (
                <div className="rounded-xl border border-brand-line bg-black/30 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Variants</div>
                  <ul className="flex flex-col gap-2">
                    {r.variants.map((v) => {
                      if (mode === "retail") {
                        const vd = retailVariants.drafts[v.id];
                        return (
                          <RetailVariantRow
                            key={v.id}
                            variant={v}
                            draft={vd}
                            onField={retailVariants.setField}
                            onSave={saveRetailVariant}
                          />
                        );
                      }
                      const vd = tradeVariants.drafts[v.id];
                      return (
                        <TradeVariantRow
                          key={v.id}
                          variant={v}
                          parentRetailIdr={r.price_idr}
                          draft={vd}
                          onField={tradeVariants.setField}
                          onSave={saveTradeVariant}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-muted">
          No products match.
        </p>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.src}
            alt={zoom.alt}
            onClick={(e) => e.stopPropagation()}
            className="block max-h-[88vh] max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Close"
            className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-brand-accent text-black shadow-[0_2px_10px_rgba(255,179,0,0.4)] transition active:scale-95 hover:opacity-90"
          >×</button>
        </div>
      )}
    </>
  );
}

// --- Mode-specific blocks ----------------------------------------------------

function RetailParentBlock({
  row, draft, hasVariants, onField, onSave
}: {
  row: PricingRow;
  draft: Draft<RetailParentFields> | undefined;
  hasVariants: boolean;
  onField: <K extends keyof RetailParentFields>(id: string, key: K, value: RetailParentFields[K]) => void;
  onSave: (id: string) => Promise<void>;
}) {
  const d = draft;
  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 min-w-[140px]">
          <span className="flex items-baseline justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            <span>{hasVariants ? "Canonical price (Rp) — parent" : "Canonical price (Rp)"}</span>
            <span className="font-mono text-brand-accent normal-case tracking-normal">
              {idrToGbpPreview(d?.idr ?? "")}
            </span>
          </span>
          <div className="flex h-10 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
            <span className="text-xs text-brand-muted">Rp</span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="0 = Quoted at checkout"
              value={d?.idr ?? ""}
              onChange={(e) => onField(row.id, "idr", e.target.value)}
              className="h-full w-full bg-transparent pl-1 pr-3 text-sm font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
        </label>
        <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-3 text-xs font-semibold text-brand-text">
          <input
            type="checkbox"
            checked={d?.freeUk ?? false}
            onChange={(e) => onField(row.id, "freeUk", e.target.checked)}
            className="h-4 w-4 accent-brand-accent"
          />
          Free UK
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-brand-line bg-black/30 p-2">
        <label className="flex flex-1 flex-col gap-1 min-w-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            SEA override (Rp) <span className="text-brand-accent">ID · MY · VN</span>
          </span>
          <div className="flex h-10 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
            <span className="text-xs text-brand-muted">Rp</span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="0 = Quoted at checkout"
              value={d?.seaIdr ?? ""}
              onChange={(e) => onField(row.id, "seaIdr", e.target.value)}
              className="h-full w-full bg-transparent pl-1 pr-3 text-sm font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
        </label>
        <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-3 text-xs font-semibold text-brand-text">
          <input
            type="checkbox"
            checked={d?.freeSea ?? false}
            onChange={(e) => onField(row.id, "freeSea", e.target.checked)}
            className="h-4 w-4 accent-brand-accent"
          />
          Free SEA
        </label>
        <button
          type="button"
          disabled={d?.saving}
          onClick={() => onSave(row.id)}
          className={`grid h-10 shrink-0 place-items-center rounded-full px-4 text-xs font-bold uppercase tracking-widest transition disabled:opacity-40 ${
            d?.saved ? "bg-green-500 text-black" : "bg-brand-accent text-black hover:opacity-90"
          }`}
        >
          {d?.saving ? "…" : d?.saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {d?.err && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300">
          {d.err}
        </p>
      )}
    </>
  );
}

function TradeParentBlock({
  row, draft, onField, onSave
}: {
  row: PricingRow;
  draft: Draft<TradeParentFields> | undefined;
  onField: <K extends keyof TradeParentFields>(id: string, key: K, value: TradeParentFields[K]) => void;
  onSave: (id: string) => Promise<void>;
}) {
  const d = draft;
  const marginHint = tradeMarginHint(row.price_idr, d?.tradeGbp ?? "");
  return (
    <>
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-brand-line bg-black/30 p-2">
        <label className="flex flex-1 flex-col gap-1 min-w-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            Trade price (£) <span className="text-brand-accent">UK trade</span>
          </span>
          <div className="flex h-10 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
            <span className="text-xs text-brand-muted">£</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="Blank = no trade price"
              value={d?.tradeGbp ?? ""}
              onChange={(e) => onField(row.id, "tradeGbp", e.target.value)}
              className="h-full w-full bg-transparent pl-1 pr-3 text-sm font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
          {marginHint && (
            <span className="font-mono text-[10px] text-brand-accent">{marginHint}</span>
          )}
        </label>
        <label className="flex w-28 flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">MOQ</span>
          <div className="flex h-10 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
            <input
              type="number"
              step="1"
              min="1"
              inputMode="numeric"
              placeholder="—"
              value={d?.moq ?? ""}
              onChange={(e) => onField(row.id, "moq", e.target.value)}
              className="h-full w-full bg-transparent pr-3 text-sm font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
        </label>
        <button
          type="button"
          disabled={d?.saving}
          onClick={() => onSave(row.id)}
          className={`grid h-10 shrink-0 place-items-center rounded-full px-4 text-xs font-bold uppercase tracking-widest transition disabled:opacity-40 ${
            d?.saved ? "bg-green-500 text-black" : "bg-brand-accent text-black hover:opacity-90"
          }`}
        >
          {d?.saving ? "…" : d?.saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {d?.err && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300">
          {d.err}
        </p>
      )}
    </>
  );
}

function RetailVariantRow({
  variant, draft, onField, onSave
}: {
  variant: VariantLite;
  draft: Draft<RetailVariantFields> | undefined;
  onField: <K extends keyof RetailVariantFields>(id: string, key: K, value: RetailVariantFields[K]) => void;
  onSave: (id: string) => Promise<void>;
}) {
  const v = variant;
  const vd = draft;
  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-brand-text">
            {v.label}
            {v.is_default && (
              <span className="ml-2 rounded-full border border-brand-line bg-black/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-muted">
                Default
              </span>
            )}
          </div>
          {v.sku && (
            <div className="truncate font-mono text-[10px] text-brand-accent">Ref: {v.sku}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex h-9 w-32 shrink-0 items-center rounded-full border border-brand-line bg-brand-bg pl-3" title="Canonical (UK/RoW) price">
            <span className="text-xs text-brand-muted">Rp</span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="0"
              value={vd?.idr ?? ""}
              onChange={(e) => onField(v.id, "idr", e.target.value)}
              className="h-full w-full bg-transparent pl-1 pr-3 text-xs font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
          <span className="font-mono text-[9px] text-brand-accent">
            {idrToGbpPreview(vd?.idr ?? "")}
          </span>
        </div>
        <div className="flex h-9 w-32 shrink-0 items-center rounded-full border border-brand-line bg-brand-bg pl-3" title="SEA override (Rp) — 0 inherits parent">
          <span className="text-xs text-brand-muted">Rp</span>
          <input
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            placeholder="0"
            value={vd?.seaIdr ?? ""}
            onChange={(e) => onField(v.id, "seaIdr", e.target.value)}
            className="h-full w-full bg-transparent pl-1 pr-3 text-xs font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={vd?.saving}
          onClick={() => onSave(v.id)}
          className={`grid h-9 shrink-0 place-items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-widest transition disabled:opacity-40 ${
            vd?.saved ? "bg-green-500 text-black" : "border border-brand-line text-brand-text hover:border-brand-accent"
          }`}
        >
          {vd?.saving ? "…" : vd?.saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {vd?.err && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
          {vd.err}
        </p>
      )}
    </li>
  );
}

function TradeVariantRow({
  variant, parentRetailIdr, draft, onField, onSave
}: {
  variant: VariantLite;
  parentRetailIdr: number;
  draft: Draft<TradeVariantFields> | undefined;
  onField: <K extends keyof TradeVariantFields>(id: string, key: K, value: TradeVariantFields[K]) => void;
  onSave: (id: string) => Promise<void>;
}) {
  const v = variant;
  const vd = draft;
  // Variant retail IDR falls back to parent retail when the variant has 0
  // (inherit-parent convention used elsewhere in the codebase). Margin hint
  // is best-effort.
  const retailForMargin = v.price_idr && v.price_idr > 0 ? v.price_idr : parentRetailIdr;
  const marginHint = tradeMarginHint(retailForMargin, vd?.tradeGbp ?? "");
  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-brand-text">
            {v.label}
            {v.is_default && (
              <span className="ml-2 rounded-full border border-brand-line bg-black/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-muted">
                Default
              </span>
            )}
          </div>
          {v.sku && (
            <div className="truncate font-mono text-[10px] text-brand-accent">Ref: {v.sku}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex h-9 w-32 shrink-0 items-center rounded-full border border-brand-line bg-brand-bg pl-3" title="Trade price (£) — variant override (blank inherits parent)">
            <span className="text-xs text-brand-muted">£</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="—"
              value={vd?.tradeGbp ?? ""}
              onChange={(e) => onField(v.id, "tradeGbp", e.target.value)}
              className="h-full w-full bg-transparent pl-1 pr-3 text-xs font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
            />
          </div>
          {marginHint && (
            <span className="font-mono text-[9px] text-brand-accent">{marginHint}</span>
          )}
        </div>
        <div className="flex h-9 w-24 shrink-0 items-center rounded-full border border-brand-line bg-brand-bg pl-3" title="Minimum order quantity (variant override)">
          <input
            type="number"
            step="1"
            min="1"
            inputMode="numeric"
            placeholder="MOQ"
            value={vd?.moq ?? ""}
            onChange={(e) => onField(v.id, "moq", e.target.value)}
            className="h-full w-full bg-transparent pr-3 text-xs font-semibold text-brand-text placeholder:text-brand-muted/60 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={vd?.saving}
          onClick={() => onSave(v.id)}
          className={`grid h-9 shrink-0 place-items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-widest transition disabled:opacity-40 ${
            vd?.saved ? "bg-green-500 text-black" : "border border-brand-line text-brand-text hover:border-brand-accent"
          }`}
        >
          {vd?.saving ? "…" : vd?.saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {vd?.err && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
          {vd.err}
        </p>
      )}
    </li>
  );
}
