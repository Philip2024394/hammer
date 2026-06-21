"use client";

import { useEffect } from "react";
import { cart } from "@/lib/cart";

// Client island that empties the cart the moment the Stripe success page
// mounts. Without this, a buyer who returns from a completed Stripe
// Checkout still sees their old line items in cart/header counts.
export function ClearCartOnSuccess() {
  useEffect(() => {
    cart.clear();
  }, []);
  return null;
}
