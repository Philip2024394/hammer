"use client";

import { useEffect, useState } from "react";
import { cart } from "@/lib/cart";

export function CartCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(cart.count());
    return cart.subscribe(() => setN(cart.count()));
  }, []);
  if (!n) return null;
  return (
    <span
      aria-label={`${n} item${n === 1 ? "" : "s"} in cart`}
      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-black"
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
