"use client";

import { useEffect, useRef, useState } from "react";
import { cart } from "@/lib/cart";

export function CartCount() {
  const [n, setN] = useState(0);
  const [pop, setPop] = useState(false);
  const firstSync = useRef(true);
  useEffect(() => {
    setN(cart.count());
    firstSync.current = false;
    return cart.subscribe(() => {
      setN(cart.count());
      if (!firstSync.current) {
        setPop(true);
        window.setTimeout(() => setPop(false), 300);
      }
    });
  }, []);
  if (!n) return null;
  return (
    <span
      aria-label={`${n} item${n === 1 ? "" : "s"} in cart`}
      className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-xs font-bold text-black ${pop ? "hx-pop" : ""}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
