import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export const metadata = {
  title: "Hammerex Admin",
  robots: { index: false, follow: false }
};

const NAV_LINKS: Array<{ href: string; label: string; group?: string }> = [
  { href: "/admin",                 label: "Overview" },
  { href: "/admin/orders",          label: "Orders" },
  { href: "/admin/product-requests", label: "Projects" },
  { href: "/admin/trade-accounts",  label: "Trade Accounts" },
  { href: "/admin/trade-orders",    label: "Trade Orders" },
  { href: "/admin/xrated",          label: "Xrated Trades", group: "Xrated" },
  { href: "/admin/xrated/jobs",     label: "Xrated Jobs",  group: "Xrated" },
  { href: "/admin/xrated/vouchers", label: "Vouchers",     group: "Xrated" },
  { href: "/admin/pricing",         label: "Pricing" },
  { href: "/admin/reviews",         label: "Reviews" },
  { href: "/admin/world",           label: "Live map" },
  { href: "/admin/search",          label: "Searches" },
  { href: "/admin/traffic",         label: "Traffic" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text md:flex">
      {/* Mobile top bar — sidebar collapses to a horizontal scroll nav. */}
      <header className="sticky top-0 z-10 border-b border-brand-line bg-brand-surface/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-widest text-brand-accent">
            Hammerex Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-brand-muted hover:text-brand-accent">
              View site →
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav
          aria-label="Admin sections (mobile)"
          className="flex gap-1 overflow-x-auto px-4 pb-3 text-xs"
        >
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
          ))}
        </nav>
      </header>

      {/* Desktop left sidebar. */}
      <aside className="hidden w-60 shrink-0 border-r border-brand-line bg-brand-surface/95 md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-widest text-brand-accent">
            Hammerex Admin
          </Link>
        </div>

        <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((l, i) => {
              const prevGroup = i > 0 ? NAV_LINKS[i - 1].group : undefined;
              const groupChanged = l.group !== prevGroup;
              return (
                <li key={l.href}>
                  {l.group && groupChanged && (
                    <p className="mt-3 px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-brand-muted/70">
                      {l.group}
                    </p>
                  )}
                  {!l.group && groupChanged && i > 0 && <div className="my-2" />}
                  <SidebarLink href={l.href}>{l.label}</SidebarLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-brand-line px-3 py-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-xs text-brand-muted transition hover:bg-brand-bg hover:text-brand-accent"
          >
            View site →
          </Link>
          <div className="mt-1 px-3 py-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold uppercase tracking-widest text-brand-muted transition hover:bg-brand-bg hover:text-brand-text"
    >
      {children}
    </Link>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-widest text-brand-muted transition hover:bg-brand-bg hover:text-brand-text"
    >
      {children}
    </Link>
  );
}
