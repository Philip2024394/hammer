"use client";

import { useCallback, useState } from "react";

// Shared edit-then-Save state machine for the pricing grid.
//
// Both the parent product row and the variant rows follow the same flow:
//   1. Hydrate one draft per row from the server payload.
//   2. Edit fields locally (each field-edit clears `saved` + `err`).
//   3. Click Save → POST to the row's endpoint → flash green for 1.8s.
//
// Before this hook lived here, the same flow was duplicated between
// PricingGrid's parent and variant blocks, plus would need to be duplicated
// again for the trade-mode block. The hook keeps the field shape generic
// (T extends the user-defined draft fields) and bolts the save metadata
// (saving / saved / err) on the side. Callers cast to the field type when
// reading.
//
// Why a Map keyed by row id rather than per-row useState calls? Same reason
// the original code used one big object: the rows array is dynamic
// (filtered), so we can't call useState in a loop. One owner per grid.

const SAVED_FLASH_MS = 1800;

export type DraftMeta = { saving: boolean; saved: boolean; err: string | null };
export type Draft<T> = T & DraftMeta;

export type SaveResult = { ok: true } | { ok: false; error: string };

export function useDraft<T extends object>(
  initial: () => Record<string, T>
) {
  const [drafts, setDrafts] = useState<Record<string, Draft<T>>>(() => {
    const seed = initial();
    const out: Record<string, Draft<T>> = {};
    for (const id of Object.keys(seed)) {
      out[id] = { ...seed[id], saving: false, saved: false, err: null };
    }
    return out;
  });

  const setField = useCallback(
    <K extends keyof T>(id: string, key: K, value: T[K]) => {
      setDrafts((d) => {
        const row = d[id];
        if (!row) return d;
        return { ...d, [id]: { ...row, [key]: value, saved: false, err: null } };
      });
    },
    []
  );

  // Force-set the saved/saving/err metadata without touching field values.
  // Used by `save` below and by callers that want to pre-emptively clear an
  // error (e.g. after fixing a validation issue).
  const setMeta = useCallback((id: string, patch: Partial<DraftMeta>) => {
    setDrafts((d) => {
      const row = d[id];
      if (!row) return d;
      return { ...d, [id]: { ...row, ...patch } };
    });
  }, []);

  // Run the caller's save action and drive the saving → saved → reset flash.
  // The caller is responsible for validation + the network round-trip; this
  // hook only owns the visual state. Returning { ok: false, error } from the
  // action surfaces the message inline; throwing surfaces error.message.
  const save = useCallback(
    async (id: string, action: (draft: Draft<T>) => Promise<SaveResult>) => {
      const current = await new Promise<Draft<T> | undefined>((resolve) => {
        setDrafts((d) => {
          resolve(d[id]);
          return d;
        });
      });
      if (!current) return;
      setMeta(id, { saving: true, err: null });
      try {
        const result = await action(current);
        if (!result.ok) {
          setMeta(id, { saving: false, err: result.error });
          return;
        }
        setMeta(id, { saving: false, saved: true, err: null });
        window.setTimeout(() => {
          setDrafts((d) => {
            const row = d[id];
            if (!row) return d;
            return { ...d, [id]: { ...row, saved: false } };
          });
        }, SAVED_FLASH_MS);
      } catch (e) {
        setMeta(id, { saving: false, err: (e as Error).message });
      }
    },
    [setMeta]
  );

  return { drafts, setField, setMeta, save };
}
