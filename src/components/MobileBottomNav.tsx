"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartCount } from "./CartCount";
import { MobileDrawer } from "./MobileDrawer";

function Icon({ name }: { name: "home" | "grid" | "search" | "cart" | "wa" }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "home":   return (<svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>);
    case "grid":   return (<svg {...common}><rect x="3" y="3"  width="7" height="7" /><rect x="14" y="3"  width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>);
    case "search": return (<svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
    case "cart":   return (<svg {...common}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>);
    case "wa":     return (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.85 11.85 0 0 0 3 19.7L2 22l2.4-1.05A11.86 11.86 0 1 0 20.5 3.5Zm-8.4 18a9.8 9.8 0 0 1-5-1.36l-.36-.22-2.84.62.6-2.77-.23-.37A9.83 9.83 0 1 1 12.1 21.5Zm5.6-7.32c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.36.22-.66.07-1.78-.89-2.95-1.59-4.12-3.6-.31-.54.31-.5.89-1.67.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.23-.57-.47-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.06 2.89 1.21 3.09.15.2 2.09 3.19 5.07 4.48 1.77.76 2.46.83 3.34.7.54-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.13-.27-.2-.57-.35Z" /></svg>);
  }
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const [drawer, setDrawer] = useState(false);

  const isHome = pathname === "/";
  const isCart = pathname.startsWith("/cart") || pathname.startsWith("/checkout");

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-brand-line bg-brand-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <Item href="/" label="Home" active={isHome}>
          <Icon name="home" />
        </Item>
        <ButtonItem label="Categories" onClick={() => setDrawer(true)}>
          <Icon name="grid" />
        </ButtonItem>
        <Item href="/#search" label="Search">
          <Icon name="search" />
        </Item>
        <Item href="/cart" label="Cart" active={isCart}>
          <span className="relative">
            <Icon name="cart" />
            <CartCount />
          </span>
        </Item>
      </nav>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}

function Item({
  href, label, children, active, external, accent
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  external?: boolean;
  accent?: boolean;
}) {
  const tone = accent ? "text-brand-whatsapp" : active ? "text-brand-accent" : "text-brand-muted";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      className={`relative flex h-14 flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${tone} hover:text-brand-accent`}
    >
      {children}
      <span className="text-xs font-semibold tracking-wide">{label}</span>
      {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand-accent" />}
    </a>
  );
}

function ButtonItem({
  label, children, onClick
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-14 flex-col items-center justify-center gap-0.5 text-brand-muted transition-colors hover:text-brand-accent active:scale-95"
    >
      {children}
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );
}
