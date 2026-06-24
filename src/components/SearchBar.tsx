"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { imageUrl } from "@/lib/imageUrl";
import { useT } from "./LocaleProvider";

type Suggestion = {
  id: string;
  slug: string | null;
  name: string;
  sku: string | null;
  price_idr: number;
  image_url: string | null;
  subtitle: string | null;
};

const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;

export function SearchBar({ id, mobile = false }: { id: string; mobile?: boolean }) {
  const router = useRouter();
  const t = useT();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastReqId = useRef(0);

  // Debounced fetch. Cancels stale responses by tagging each request with
  // a monotonically increasing id and ignoring anything older than the
  // latest fired request.
  useEffect(() => {
    const term = q.trim();
    if (term.length < MIN_CHARS) {
      setItems([]);
      setHighlight(-1);
      return;
    }
    const t = window.setTimeout(async () => {
      const reqId = ++lastReqId.current;
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, {
          cache: "no-store"
        });
        if (!res.ok) return;
        const json = (await res.json()) as { items?: Suggestion[] };
        if (reqId !== lastReqId.current) return;
        setItems(json.items ?? []);
        setHighlight(-1);
      } catch {
        // Network blip — silently keep the previous list.
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [q]);

  // Close on click outside.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function goTo(target: Suggestion) {
    if (!target.slug) return;
    setOpen(false);
    router.push(`/product/${target.slug}`);
  }

  function submit() {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (items.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      if (items.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h <= 0 ? items.length - 1 : h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlight >= 0 && items[highlight]) goTo(items[highlight]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && q.trim().length >= MIN_CHARS && items.length > 0;

  return (
    <div ref={wrapRef} className={`relative ${mobile ? "" : "flex-1"}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        role="search"
      >
        <label className="sr-only" htmlFor={id}>Search products</label>
        <div className="relative">
          <input
            id={id}
            name="q"
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={t("nav.searchPlaceholder")}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={`${id}-suggest`}
            aria-expanded={showDropdown}
            aria-activedescendant={highlight >= 0 ? `${id}-opt-${highlight}` : undefined}
            className="h-11 w-full rounded-full border border-brand-line bg-brand-surface pl-4 pr-12 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-brand-accent text-black transition hover:opacity-90 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </form>

      {showDropdown && (
        <ul
          id={`${id}-suggest`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)]"
        >
          {items.map((s, i) => {
            const thumb = imageUrl(s.image_url, 96) ?? s.image_url ?? null;
            const active = i === highlight;
            return (
              <li
                key={s.id}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={active}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => goTo(s)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    active ? "bg-brand-accent/10" : "hover:bg-brand-bg"
                  }`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-brand-muted">No img</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-brand-text">{s.name}</span>
                    {s.sku && (
                      <span className="block truncate text-xs text-brand-muted">Ref: {s.sku}</span>
                    )}
                  </span>
                  <span className="hidden text-xs text-brand-accent sm:inline">View →</span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={submit}
              className="block w-full border-t border-brand-line px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-brand-accent hover:bg-brand-bg"
            >
              See all results for &ldquo;{q.trim()}&rdquo;
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
