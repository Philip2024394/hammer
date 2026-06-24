import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export const metadata = {
  title: "Hammerex Admin",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="sticky top-0 z-10 border-b border-brand-line bg-brand-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-widest text-brand-accent">
            Hammerex Admin
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-xs">
            <NavLink href="/admin">Overview</NavLink>
            <NavLink href="/admin/orders">Orders</NavLink>
            <NavLink href="/admin/product-requests">Projects</NavLink>
            <NavLink href="/admin/trade-accounts">Trade Accounts</NavLink>
            <NavLink href="/admin/trade-orders">Trade Orders</NavLink>
            <NavLink href="/admin/pricing">Pricing</NavLink>
            <NavLink href="/admin/reviews">Reviews</NavLink>
            <NavLink href="/admin/world">Live map</NavLink>
            <NavLink href="/admin/search">Searches</NavLink>
            <NavLink href="/admin/traffic">Traffic</NavLink>
          </nav>
          <Link href="/" className="text-xs text-brand-muted hover:text-brand-accent">View site →</Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 font-semibold uppercase tracking-widest text-brand-muted transition hover:bg-brand-bg hover:text-brand-text"
    >
      {children}
    </Link>
  );
}
