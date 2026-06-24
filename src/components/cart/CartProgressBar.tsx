"use client";

// £-denominated air-freight progress bar. Disabled storefront-wide on
// 2026-06-23: ROW visitors no longer see prices (so the £-pegged tier copy
// is meaningless) and SEA visitors have a different shipping model that
// doesn't ladder against the GBP threshold. Kept as a stub so existing
// callers in cart/page.tsx don't break; remove the component + callers
// in a follow-up if no new tiering model lands soon.
export function CartProgressBar(_props: { subtotalIdr: number }) {
  return null;
}
