"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { HammerexProductVariant } from "@/lib/supabase";

type Ctx = {
  variants: HammerexProductVariant[];
  active: HammerexProductVariant | null;
  setActiveId: (id: string) => void;
};

const VariantCtx = createContext<Ctx | null>(null);

export function VariantProvider({
  variants,
  children
}: {
  variants: HammerexProductVariant[];
  children: ReactNode;
}) {
  const initialId = useMemo(() => {
    const def = variants.find((v) => v.is_default);
    return (def ?? variants[0])?.id ?? null;
  }, [variants]);

  const [activeId, setActiveId] = useState<string | null>(initialId);
  const active = useMemo(
    () => variants.find((v) => v.id === activeId) ?? null,
    [variants, activeId]
  );

  return (
    <VariantCtx.Provider value={{ variants, active, setActiveId }}>
      {children}
    </VariantCtx.Provider>
  );
}

export function useVariant() {
  return useContext(VariantCtx);
}
