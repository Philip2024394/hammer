"use client";

// ShopModeEditor — product CRUD for the Shop Mode add-on. Lists existing
// products with edit/archive; modal-style inline editor for create/edit.
// Cover + gallery uploads reuse /api/trade-off/upload-photo (same as the
// rest of the dashboard so we don't fork the storage path).

import { useMemo, useRef, useState } from "react";
import type { HammerexXratedProduct } from "@/lib/supabase";

type Mode = "list" | "create" | { kind: "edit"; product: HammerexXratedProduct };

type FormState = {
  id: string;
  name: string;
  description: string;
  price_pounds: string;
  stock_count: string;
  dispatch_days: string;
  cover_url: string;
  gallery_urls: string[];
  compare_with: string[];
  sort_order: string;
  status: "live" | "archived";
  // Services Prices add-on fields. Editable when kind='service' — both
  // hidden in product-mode, where the API silently defaults unit=null and
  // category=null on save.
  unit: string;
  category: string;
};

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  description: "",
  price_pounds: "",
  stock_count: "",
  dispatch_days: "",
  cover_url: "",
  gallery_urls: [],
  compare_with: [],
  sort_order: "0",
  status: "live",
  unit: "",
  category: ""
};

const UNIT_CHIPS = [
  "per hour",
  "per item",
  "per sqm",
  "per day",
  "per tree",
  "per kg"
] as const;

const CATEGORY_CHIPS = [
  "Gardening",
  "Machinery",
  "Hire",
  "Cleaning",
  "Labour",
  "Callout"
] as const;

function poundsToPence(input: string): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function penceToPounds(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "0.00";
  return (p / 100).toFixed(2);
}

function productToForm(p: HammerexXratedProduct): FormState {
  return {
    id: p.id,
    name: p.name ?? "",
    description: p.description ?? "",
    price_pounds: penceToPounds(p.price_pence ?? 0),
    stock_count:
      p.stock_count === null || p.stock_count === undefined
        ? ""
        : String(p.stock_count),
    dispatch_days:
      p.dispatch_days === null || p.dispatch_days === undefined
        ? ""
        : String(p.dispatch_days),
    cover_url: p.cover_url ?? "",
    gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
    compare_with: Array.isArray(p.compare_with) ? p.compare_with : [],
    sort_order:
      typeof p.sort_order === "number" ? String(p.sort_order) : "0",
    status: p.status === "archived" ? "archived" : "live",
    unit: typeof p.unit === "string" ? p.unit : "",
    category: typeof p.category === "string" ? p.category : ""
  };
}

export function ShopModeEditor({
  slug,
  editToken,
  initialProducts,
  kind = "product"
}: {
  slug: string;
  editToken: string;
  initialProducts: HammerexXratedProduct[];
  /** Switches the editor between Shop Mode (kind='product') and the
   *  Services Prices add-on (kind='service'). When 'service':
   *   – Header + row labels read "Service" instead of "Product".
   *   – Stock count + dispatch-day labels reshape ("Days from booking
   *     to first appointment", stock hidden — services never run out).
   *   – Unit becomes required & visible; category becomes visible.
   *   – Defaults persisted as service-rows so the public Services Grid
   *     picks them up. */
  kind?: "product" | "service";
}) {
  const isService = kind === "service";
  const noun = isService ? "service" : "product";
  const NounCap = isService ? "Service" : "Product";
  // Filter the in-editor list to the active kind so a tradesperson who
  // runs both add-ons never sees their products mixed in with their
  // services (or vice versa) on the editor surface.
  const [products, setProducts] = useState<HammerexXratedProduct[]>(
    initialProducts.filter((p) => (p.kind ?? "product") === kind)
  );
  const [mode, setMode] = useState<Mode>("list");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const liveProducts = useMemo(
    () => products.filter((p) => p.status === "live"),
    [products]
  );
  const compareOptions = useMemo(
    () =>
      products
        .filter((p) => p.status === "live" && p.id !== form.id)
        .map((p) => ({ id: p.id, name: p.name })),
    [products, form.id]
  );

  function startCreate() {
    setForm({ ...EMPTY_FORM, sort_order: String(products.length) });
    setErr(null);
    setMsg(null);
    setMode("create");
  }
  function startEdit(p: HammerexXratedProduct) {
    setForm(productToForm(p));
    setErr(null);
    setMsg(null);
    setMode({ kind: "edit", product: p });
  }
  function cancel() {
    setForm(EMPTY_FORM);
    setErr(null);
    setMode("list");
  }
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setErr(null);
    setMsg(null);
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setErr("Name is required.");
      return;
    }
    const price_pence = poundsToPence(form.price_pounds);
    if (price_pence <= 0) {
      setErr("Set a price greater than £0.");
      return;
    }
    const trimmedUnit = form.unit.trim();
    if (isService && trimmedUnit.length === 0) {
      setErr('Unit is required for services — e.g. "per hour", "per tree".');
      return;
    }
    setSubmitting(true);
    try {
      // In service-mode stock is hidden (services don't run out) — force
      // null so an old edited row with a leftover stock value gets cleared.
      const stockN = isService
        ? null
        : form.stock_count.trim().length === 0
          ? null
          : Number(form.stock_count);
      const dispN = form.dispatch_days.trim().length === 0 ? null : Number(form.dispatch_days);
      const sortN = Number(form.sort_order);
      const product = {
        ...(form.id ? { id: form.id } : {}),
        kind,
        name: trimmedName.slice(0, 80),
        description: form.description.trim().slice(0, 1000),
        price_pence,
        stock_count: stockN === null || !Number.isFinite(stockN) || stockN < 0 ? null : Math.round(stockN),
        dispatch_days: dispN === null || !Number.isFinite(dispN) || dispN < 0 ? null : Math.round(dispN),
        cover_url: form.cover_url.trim(),
        gallery_urls: form.gallery_urls.slice(0, 3),
        compare_with: form.compare_with.slice(0, 10),
        status: form.status,
        sort_order: Number.isFinite(sortN) && sortN >= 0 ? Math.round(sortN) : 0,
        unit: trimmedUnit.length > 0 ? trimmedUnit.slice(0, 32) : null,
        category:
          form.category.trim().length > 0
            ? form.category.trim().slice(0, 40)
            : null
      };
      const res = await fetch("/api/trade-off/products/upsert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, edit_token: editToken, product })
      });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Save failed.");
        return;
      }
      const saved = json.product as HammerexXratedProduct;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx === -1) return [...prev, saved];
        const next = [...prev];
        next[idx] = saved;
        return next;
      });
      setMsg(form.id ? "Updated." : "Added.");
      setForm(EMPTY_FORM);
      setMode("list");
    } catch {
      setErr("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function archive(p: HammerexXratedProduct) {
    if (!confirm(`Archive "${p.name}"? Customers won't see it any more.`)) return;
    setErr(null);
    try {
      const res = await fetch("/api/trade-off/products/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, edit_token: editToken, product_id: p.id })
      });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Archive failed.");
        return;
      }
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, status: "archived" } : x))
      );
    } catch {
      setErr("Network error — try again.");
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-line bg-brand-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">
            Your {isService ? "services" : "products"}
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            {liveProducts.length} live · {products.length - liveProducts.length} archived
          </p>
        </div>
        {mode === "list" && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-11 items-center rounded-lg bg-brand-accent px-4 text-xs font-bold text-black transition hover:opacity-90"
          >
            + Add {noun}
          </button>
        )}
      </div>

      {err && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
          {err}
        </p>
      )}
      {msg && (
        <p className="rounded-lg border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-brand-accent">
          {msg}
        </p>
      )}

      {mode === "list" ? (
        <ProductList
          products={products}
          onEdit={startEdit}
          onArchive={archive}
          isService={isService}
        />
      ) : (
        <ProductForm
          form={form}
          update={update}
          slug={slug}
          editToken={editToken}
          compareOptions={compareOptions}
          submitting={submitting}
          onCancel={cancel}
          onSubmit={submit}
          mode={mode === "create" ? "create" : "edit"}
          isService={isService}
          NounCap={NounCap}
        />
      )}
    </div>
  );
}

function ProductList({
  products,
  onEdit,
  onArchive,
  isService
}: {
  products: HammerexXratedProduct[];
  onEdit: (p: HammerexXratedProduct) => void;
  onArchive: (p: HammerexXratedProduct) => void;
  isService: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-brand-line bg-brand-bg px-4 py-6 text-center text-xs text-brand-muted">
        No {isService ? "services" : "products"} yet. Tap &ldquo;Add{" "}
        {isService ? "service" : "product"}&rdquo; to list your first{" "}
        {isService ? "service" : "item"}.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li
          key={p.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-line bg-brand-bg p-3"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-brand-line bg-brand-surface">
            {p.cover_url ? (
              <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-brand-muted">
                No img
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-text">{p.name}</p>
            <p className="text-xs text-brand-muted">
              £{penceToPounds(p.price_pence ?? 0)}
              {isService
                ? p.unit
                  ? ` ${p.unit}`
                  : ""
                : ` · ${stockLabel(p.stock_count)}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
              p.status === "live"
                ? "border-brand-accent/60 bg-brand-accent/10 text-brand-accent"
                : "border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >
            {p.status}
          </span>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => onEdit(p)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-brand-line bg-brand-surface px-3 text-xs font-bold text-brand-text transition hover:border-brand-accent hover:text-brand-accent sm:flex-none"
            >
              Edit
            </button>
            {p.status === "live" && (
              <button
                type="button"
                onClick={() => onArchive(p)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/5 px-3 text-xs font-bold text-red-300 transition hover:bg-red-500/15 sm:flex-none"
              >
                Archive
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function stockLabel(s: number | null): string {
  if (s === null || s === undefined) return "Unlimited stock";
  if (s <= 0) return "Out of stock";
  if (s <= 5) return `${s} left`;
  return `${s} in stock`;
}

function ProductForm({
  form,
  update,
  slug,
  editToken,
  compareOptions,
  submitting,
  onCancel,
  onSubmit,
  mode,
  isService,
  NounCap
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  slug: string;
  editToken: string;
  compareOptions: { id: string; name: string }[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  mode: "create" | "edit";
  isService: boolean;
  NounCap: string;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-brand-line bg-brand-bg p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-accent">
          {mode === "create" ? `New ${NounCap.toLowerCase()}` : `Edit ${NounCap.toLowerCase()}`}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-md px-2 text-xs font-bold text-brand-muted transition hover:text-brand-text"
        >
          Cancel
        </button>
      </div>

      <Field label={`${NounCap} name *`}>
        <input
          type="text"
          value={form.name}
          maxLength={80}
          onChange={(e) => update("name", e.target.value)}
          placeholder={
            isService
              ? "e.g. Chop tree (up to 2m)"
              : "e.g. Hand-carved oak chopping board"
          }
          className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          maxLength={1000}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          placeholder="Materials, dimensions, who it's for…"
          className="block w-full rounded-md border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
        <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-muted">
          {form.description.length}/1000
        </p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (GBP) *">
          <div className="flex items-center gap-1">
            <span className="text-base font-bold text-brand-muted">£</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.price_pounds}
              onChange={(e) => update("price_pounds", e.target.value)}
              placeholder="0.00"
              className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </div>
        </Field>
        {!isService && (
          <Field label="Stock count (blank = unlimited)">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={form.stock_count}
              onChange={(e) => update("stock_count", e.target.value)}
              placeholder="Unlimited"
              className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        )}
        {isService && (
          <Field label="Unit *">
            <div className="space-y-2">
              <div className="-mx-1 flex flex-wrap gap-1.5">
                {UNIT_CHIPS.map((chip) => {
                  const active = form.unit.trim().toLowerCase() === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => update("unit", chip)}
                      className={`inline-flex h-9 items-center rounded-full border px-3 text-[13px] font-bold transition ${
                        active
                          ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                          : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={form.unit}
                maxLength={32}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="per tree"
                className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </div>
          </Field>
        )}
      </div>

      {isService && (
        <Field label="Category (optional)">
          <div className="space-y-2">
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {CATEGORY_CHIPS.map((chip) => {
                const active = form.category.trim().toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => update("category", chip)}
                    className={`inline-flex h-9 items-center rounded-full border px-3 text-[13px] font-bold transition ${
                      active
                        ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                        : "border-brand-line bg-brand-surface text-brand-text hover:border-brand-accent"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={form.category}
              maxLength={40}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Gardening, Machinery"
              className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </div>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={
            isService
              ? "Days from booking to first appointment (optional)"
              : "Dispatch in N days (optional)"
          }
        >
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={form.dispatch_days}
            onChange={(e) => update("dispatch_days", e.target.value)}
            placeholder={isService ? "e.g. 5" : "e.g. 3"}
            className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>
        <Field label="Sort order">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={form.sort_order}
            onChange={(e) => update("sort_order", e.target.value)}
            className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>
      </div>

      <Field label="Cover image">
        <SingleImageUploader
          value={form.cover_url}
          onChange={(url) => update("cover_url", url)}
          slug={slug}
          editToken={editToken}
        />
      </Field>

      <Field label="Gallery (up to 3 extra images)">
        <GalleryUploader
          urls={form.gallery_urls}
          onChange={(urls) => update("gallery_urls", urls)}
          slug={slug}
          editToken={editToken}
        />
      </Field>

      {compareOptions.length > 0 && (
        <Field label="Compare with your other products">
          <CompareWithPicker
            options={compareOptions}
            value={form.compare_with}
            onChange={(ids) => update("compare_with", ids)}
          />
        </Field>
      )}

      <Field label="Status">
        <select
          value={form.status}
          onChange={(e) =>
            update("status", e.target.value === "archived" ? "archived" : "live")
          }
          className="block h-11 w-full rounded-md border border-brand-line bg-brand-surface px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
        >
          <option value="live">Live (visible to customers)</option>
          <option value="archived">Archived (hidden)</option>
        </select>
      </Field>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex h-11 items-center rounded-lg bg-brand-accent px-5 text-xs font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? `Add ${NounCap.toLowerCase()}`
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-lg border border-brand-line bg-brand-bg px-4 text-xs font-bold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function SingleImageUploader({
  value,
  onChange,
  slug,
  editToken
}: {
  value: string;
  onChange: (url: string) => void;
  slug: string;
  editToken: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      fd.append("edit_token", editToken);
      const res = await fetch("/api/trade-off/upload-photo", {
        method: "POST",
        body: fd
      });
      const json = await res.json();
      if (!json.ok || typeof json.url !== "string") {
        setErr(json.error ?? "Upload failed.");
        return;
      }
      onChange(json.url);
    } catch {
      setErr("Upload error.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-brand-line bg-brand-surface">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-brand-muted">
              None
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-11 items-center rounded-lg border border-brand-line bg-brand-surface px-3 text-xs font-bold text-brand-text transition hover:border-brand-accent hover:text-brand-accent disabled:opacity-60"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-11 items-center rounded-lg border border-brand-line bg-brand-bg px-3 text-xs font-bold text-brand-muted transition hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {err && <p className="text-xs font-semibold text-red-300">{err}</p>}
    </div>
  );
}

function GalleryUploader({
  urls,
  onChange,
  slug,
  editToken
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  slug: string;
  editToken: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (urls.length >= 3) {
      setErr("Gallery is full — remove one first.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      fd.append("edit_token", editToken);
      const res = await fetch("/api/trade-off/upload-photo", {
        method: "POST",
        body: fd
      });
      const json = await res.json();
      if (!json.ok || typeof json.url !== "string") {
        setErr(json.error ?? "Upload failed.");
        return;
      }
      onChange([...urls, json.url].slice(0, 3));
    } catch {
      setErr("Upload error.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div
            key={`${u}-${i}`}
            className="relative h-20 w-20 overflow-hidden rounded-md border border-brand-line bg-brand-surface"
          >
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        {urls.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-brand-line bg-brand-bg text-xs font-bold text-brand-muted transition hover:border-brand-accent hover:text-brand-accent disabled:opacity-60"
          >
            {busy ? "…" : "+ Add"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {err && <p className="text-xs font-semibold text-red-300">{err}</p>}
    </div>
  );
}

function CompareWithPicker({
  options,
  value,
  onChange
}: {
  options: { id: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id].slice(0, 10));
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`inline-flex h-11 items-center rounded-full border px-3 text-xs font-bold transition ${
              on
                ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                : "border-brand-line bg-brand-bg text-brand-text hover:border-brand-accent hover:text-brand-accent"
            }`}
          >
            {on ? "✓ " : ""}
            {o.name}
          </button>
        );
      })}
    </div>
  );
}
