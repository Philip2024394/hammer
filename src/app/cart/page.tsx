"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { cart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/fx";

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setLines(cart.read());
    sync();
    setReady(true);
    return cart.subscribe(sync);
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.unitPriceIdr * l.qty, 0);

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-brand-text">Your cart</h1>

        {!ready ? null : lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-12 text-center">
            <p className="text-sm text-brand-text">Your cart is empty.</p>
            <a
              href="/"
              className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90"
            >Continue shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <ul className="flex flex-col gap-3">
              {lines.map((l) => (
                <li key={`${l.productId}::${l.size ?? ""}`} className="flex gap-4 rounded-2xl border border-brand-line bg-brand-surface p-4">
                  <a href={`/product/${l.slug}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                    {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
                  </a>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <a href={`/product/${l.slug}`} className="text-sm font-semibold text-brand-text hover:text-brand-accent">{l.name}</a>
                        {l.size && <p className="text-xs text-brand-muted">Size: {l.size}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.remove(l.productId, l.size)}
                        aria-label="Remove from cart"
                        className="text-xs text-brand-muted hover:text-brand-accent"
                      >Remove</button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="flex h-10 items-center rounded-full border border-brand-line bg-black">
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.productId, l.size, l.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-10 w-10 place-items-center text-brand-text hover:text-brand-accent"
                        >−</button>
                        <span className="w-6 text-center text-xs font-semibold text-brand-text">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.productId, l.size, l.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid h-10 w-10 place-items-center text-brand-text hover:text-brand-accent"
                        >+</button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-brand-text">
                          {l.baseCurrency && l.baseCurrency !== "IDR"
                            ? formatPrice(l.unitPriceIdr * l.qty, l.baseCurrency as any)
                            : formatPrice(l.unitPriceIdr * l.qty, "IDR")}
                        </div>
                        {l.qty > 1 && (
                          <div className="text-xs text-brand-muted">
                            {l.qty} × {formatPrice(l.unitPriceIdr, "IDR")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-5">
              <h2 className="text-sm font-semibold text-brand-text">Summary</h2>
              <dl className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-brand-muted">
                  <dt>Subtotal ({lines.reduce((s, l) => s + l.qty, 0)} items)</dt>
                  <dd className="text-brand-text">{formatPrice(subtotal, "IDR")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-brand-muted">
                Delivery is quoted per order — sea or air, your choice — once we see your destination and quantities.
              </p>
              <div className="my-4 border-t border-brand-line" />
              <a
                href="/checkout"
                className="grid h-12 place-items-center rounded-full bg-brand-accent text-sm font-semibold text-black hover:opacity-90"
              >Proceed to checkout</a>
              <a
                href="/"
                className="mt-2 grid h-11 place-items-center rounded-full border border-brand-line bg-black text-xs font-semibold text-brand-text hover:border-brand-accent"
              >Continue shopping</a>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
