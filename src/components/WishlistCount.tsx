"use client";

import { useEffect, useState } from "react";
import { wishlist } from "@/lib/wishlist";

export function WishlistCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(wishlist.count());
    return wishlist.subscribe(() => setN(wishlist.count()));
  }, []);
  if (!n) return null;
  return (
    <span
      aria-label={`${n} saved`}
      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-xs font-bold text-black"
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
