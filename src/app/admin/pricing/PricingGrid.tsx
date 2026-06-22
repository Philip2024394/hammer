"use client";

import { useEffect, useMemo, useState } from "react";
import { imageUrl } from "@/lib/imageUrl";
import { FX } from "@/lib/fx";

export type VariantLite = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price_idr: number;
  is_default: boolean;
  sort_order: number;
};

export type PricingRow = {
  id: string;
  slug: string | null;
  name: string;
  sku: string | null;
  image_url: string | null;
  price_idr: number;
  shipping_per_unit_idr: number | null;
  category_id: string | null;
  variants: VariantLite[];
  is_featured: boolean;
};

export type CategoryLite = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

const IDR_PER_GBP = 1 / FX.GBP.perIDR;

function idrToGbpString(idr: number): string {
  if (!idr) return "";
  return (idr / IDR_PER_GBP).toFixed(2);
}

type ParentDraft = { gbp: string; freeUk: boolean; saving: boolean; saved: boolean; err: string | null };
type ParentDraftMap = Record<string, ParentDraft>;

type VariantDraft = { gbp: string; saving: boolean; saved: boolean; err: string | null };
type VariantDraftMap = Record<string, VariantDraft>;

export function PricingGrid({ rows, categories }: { rows: PricingRow[]; categories: CategoryLite[] }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [zeroOnly, setZeroOnly] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [drafts, setDrafts] = useState<ParentDraftMap>(() => {
    const out: ParentDraftMap = {};
    for (const r of rows) {
      out[r.id] = {
        gbp: idrToGbpString(r.price_idr),
        freeUk: r.shipping_per_unit_idr === 0,
        saving: false,
        saved: false,
        err: null
      };
    }
    return out;
  });

  const [variantDrafts, setVariantDrafts] = useState<VariantDraftMap>(() => {
    const out: VariantDraftMap = {};
    for (const r of rows) {
      for (const v of r.variants) {
        out[v.id] = {
          gbp: idrToGbpString(v.price_idr),
          saving: false,
          saved: false,
          err: null
        };
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

  function setParentField<K extends keyof ParentDraft>(id: string, key: K, value: ParentDraft[K]) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: value, saved: false, err: null } }));
  }

  async function saveParent(id: string) {
    const draft = drafts[id];
    const gbp = parseFloat(draft.gbp);
    if (!Number.isFinite(gbp) || gbp < 0) {
      setParentField(id, "err", "Price must be a number ≥ 0.");
      return;
    }
    setParentField(id, "saving", true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_gbp: gbp, free_uk_delivery: draft.freeUk })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, err: json.error || `Save failed (${res.status}).` } }));
        return;
      }
      setDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, saved: true, err: null } }));
      window.setTimeout(() => {
        setDrafts((d) => d[id] ? { ...d, [id]: { ...d[id], saved: false } } : d);
      }, 1800);
    } catch (e) {
      setDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, err: (e as Error).message } }));
    }
  }

  function setVariantGbp(id: string, gbp: string) {
    setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], gbp, saved: false, err: null } }));
  }

  async function saveVariant(id: string) {
    const draft = variantDrafts[id];
    const gbp = parseFloat(draft.gbp);
    if (!Number.isFinite(gbp) || gbp < 0) {
      setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], err: "Price must be a number ≥ 0." } }));
      return;
    }
    setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], saving: true } }));
    try {
      const res = await fetch(`/api/admin/product-variants/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_gbp: gbp })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, err: json.error || `Save failed (${res.status}).` } }));
        return;
      }
      setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, saved: true, err: null } }));
      window.setTimeout(() => {
        setVariantDrafts((d) => d[id] ? { ...d, [id]: { ...d[id], saved: false } } : d);
      }, 1800);
    } catch (e) {
      setVariantDrafts((d) => ({ ...d, [id]: { ...d[id], saving: false, err: (e as Error).message } }));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-3">
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
        <label className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-xs font-semibold text-brand-text">
          <input
            type="checkbox"
            checked={zeroOnly}
            onChange={(e) => setZeroOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-accent"
          />
          Only £0
        </label>
        <span className="ml-auto text-xs text-brand-muted">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const d = drafts[r.id];
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

              <div className="flex items-end gap-2">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    {hasVariants ? "Parent / fallback price (£)" : "Price (£)"}
                  </span>
                  <div className="flex h-10 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
                    <span className="text-xs text-brand-muted">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={d?.gbp ?? ""}
                      onChange={(e) => setParentField(r.id, "gbp", e.target.value)}
                      className="h-full w-full bg-transparent pl-1 pr-3 text-sm font-semibold text-brand-text focus:outline-none"
                    />
                  </div>
                </label>
                <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-3 text-xs font-semibold text-brand-text">
                  <input
                    type="checkbox"
                    checked={d?.freeUk ?? false}
                    onChange={(e) => setParentField(r.id, "freeUk", e.target.checked)}
                    className="h-4 w-4 accent-brand-accent"
                  />
                  Free UK
                </label>
                <button
                  type="button"
                  disabled={d?.saving}
                  onClick={() => saveParent(r.id)}
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

              {hasVariants && isOpen && (
                <div className="rounded-xl border border-brand-line bg-black/30 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Variants</div>
                  <ul className="flex flex-col gap-2">
                    {r.variants.map((v) => {
                      const vd = variantDrafts[v.id];
                      return (
                        <li key={v.id} className="flex flex-col gap-1">
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
                            <div className="flex h-9 w-28 shrink-0 items-center rounded-full border border-brand-line bg-brand-bg pl-3">
                              <span className="text-xs text-brand-muted">£</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                inputMode="decimal"
                                value={vd?.gbp ?? ""}
                                onChange={(e) => setVariantGbp(v.id, e.target.value)}
                                className="h-full w-full bg-transparent pl-1 pr-3 text-xs font-semibold text-brand-text focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={vd?.saving}
                              onClick={() => saveVariant(v.id)}
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
