"use client";

import { useEffect } from "react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useT } from "./LocaleProvider";

const TRADES: { slug: string; label: string }[] = [
  { slug: "plastering", label: "Plastering" },
  { slug: "drywall", label: "Drywall" },
  { slug: "tiling", label: "Tiling" },
  { slug: "carpentry", label: "Carpentry" },
  { slug: "bricklaying", label: "Bricklaying" },
  { slug: "electrical", label: "Electrical" },
  { slug: "plumbing", label: "Plumbing" },
  { slug: "scaffolding", label: "Scaffolding" },
  { slug: "roofing", label: "Roofing" },
  { slug: "concrete", label: "Concrete" },
  { slug: "painting-decorating", label: "Painting & decorating" },
  { slug: "flooring", label: "Flooring" },
  { slug: "joinery", label: "Joinery" },
  { slug: "metal-fabrication", label: "Metal fabrication" },
  { slug: "demolition", label: "Demolition" },
  { slug: "lifting", label: "Lifting" }
];

const UTILITY: { href: string; label: string }[] = [
  { href: "/hammerex-group", label: "Hammerex Group" },
  { href: "/purchasing-tips", label: "Purchasing tips" },
  { href: "/partners", label: "Distribution partners" },
  { href: "/terms-and-conditions", label: "Terms & conditions" }
];

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside
        role="dialog"
        aria-label="Menu"
        aria-modal="true"
        className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col border-r border-brand-line bg-brand-bg shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-brand-line px-4 py-3">
          <a href="/" onClick={onClose} aria-label="Home">
            <img
              src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/85e5e067cf0cb299.png"
              alt="Hammerex"
              width="120"
              height="32"
              className="block h-9 w-auto"
            />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-brand-line bg-brand-surface text-brand-text transition hover:border-brand-accent hover:text-brand-accent active:scale-95"
          >×</button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Trades</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {TRADES.map((t) => (
              <li key={t.slug}>
                <a
                  href={`/c/${t.slug}`}
                  onClick={onClose}
                  className="flex min-h-11 items-center rounded-xl border border-brand-line bg-brand-surface px-3 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                >{t.label}</a>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-brand-accent">{t("common.languageSwitcherLabel")}</p>
          <div className="mt-3">
            <LocaleSwitcher compact />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-brand-accent">About</p>
          <ul className="mt-3 flex flex-col gap-1">
            {UTILITY.map((u) => (
              <li key={u.href}>
                <a
                  href={u.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center justify-between rounded-xl border border-brand-line bg-brand-surface px-3 text-xs font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                >
                  <span>{u.label}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </aside>
    </div>
  );
}
