"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { HammerexProductDeal } from "@/lib/supabase";

type Ctx = {
  deals: HammerexProductDeal[];
  active: HammerexProductDeal | null;
  setActiveId: (id: string | null) => void;
  unitPriceIdr: number;          // canonical list price per unit (used to compute savings %)
  productName: string;           // used to generate the deal description fallback
};

const DealCtx = createContext<Ctx | null>(null);

export function DealProvider({
  deals,
  unitPriceIdr,
  productName,
  children
}: {
  deals: HammerexProductDeal[];
  unitPriceIdr: number;
  productName: string;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = deals.find((d) => d.id === activeId) ?? null;

  return (
    <DealCtx.Provider value={{ deals, active, setActiveId, unitPriceIdr, productName }}>
      {children}
    </DealCtx.Provider>
  );
}

export function useDeal() {
  return useContext(DealCtx);
}

// Helper — computes the savings percentage off list price for a deal.
// Returns 0 if the deal isn't actually a discount.
export function dealDiscountPct(deal: HammerexProductDeal, unitPriceIdr: number): number {
  const list = unitPriceIdr * deal.qty;
  if (list <= 0) return 0;
  const pct = ((list - deal.price_idr) / list) * 100;
  return Math.max(0, Math.round(pct));
}
