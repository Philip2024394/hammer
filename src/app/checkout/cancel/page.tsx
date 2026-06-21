import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout cancelled — Hammerex",
  description: "Your Hammerex checkout was cancelled. Your cart is still saved.",
  robots: { index: false, follow: false }
};

export default function StripeCancelPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-8 text-center">
          <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">Checkout cancelled</h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-muted">
            No payment was taken. Your cart is still saved if you'd like to come back to it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-accent px-6 text-xs font-bold uppercase tracking-widest text-black"
            >Back to cart</a>
            <a
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-brand-line bg-transparent px-6 text-xs font-bold uppercase tracking-widest text-brand-muted hover:border-brand-accent hover:text-brand-accent"
            >Continue shopping</a>
          </div>
        </div>
      </section>
    </main>
  );
}
