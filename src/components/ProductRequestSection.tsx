"use client";

import { useState } from "react";
import { ProductRequestModal } from "./ProductRequestModal";

export function ProductRequestSection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="flex flex-col justify-between rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-6">
          <div>
            <h2 className="text-sm font-bold uppercase leading-tight tracking-wide text-brand-text sm:text-xl">
              Submit your product request
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:mt-3 sm:text-sm">
              Our team will discuss your requirements — from innovative concepts to standard market products. From 1 piece to 500, we can assist with design, manufacturing and supply.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-brand-accent px-3 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 sm:h-12 sm:text-xs"
            >
              <span>Discuss your project</span>
              <span aria-hidden="true">→</span>
            </button>
            <p className="text-xs text-brand-muted sm:text-xs">We reply within 24 hours.</p>
          </div>
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-line bg-black">
          <img
            src="https://msdonkkechxzgagyguoe.supabase.co/storage/v1/object/public/product-images/migrated/d329efdf5c688fce.png"
            alt="Hammerex international shipping"
            className="block h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {open && <ProductRequestModal onClose={() => setOpen(false)} />}
    </section>
  );
}
