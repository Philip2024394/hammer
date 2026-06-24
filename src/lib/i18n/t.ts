// Translation helper. Lookup by dotted key path (e.g. "pdp.addToCart")
// against the active locale's dictionary; falls back to English when a
// key is missing. Supports `{name}` interpolation for one-level templates
// (no plural rules — pluralise inline via dict variants when needed).

import { en, type Dict } from "./dict.en";
import { id } from "./dict.id";
import { vi } from "./dict.vi";
import { ms } from "./dict.ms";
import { DEFAULT_LOCALE, type Locale } from "./locales";

const DICTS: Record<Locale, Dict> = { en, id, vi, ms };

type DottedPath<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? DottedPath<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TKey = DottedPath<Dict>;

function lookup(dict: Dict, key: string): string | null {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return null;
    }
  }
  return typeof cur === "string" ? cur : null;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function t(locale: Locale, key: TKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const value = lookup(dict, key) ?? lookup(DICTS[DEFAULT_LOCALE], key);
  if (value === null) {
    // Surface missing keys loudly in dev, silently fall back to the key
    // itself in prod so the UI doesn't blow up.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing translation key: ${key} (locale=${locale})`);
    }
    return key;
  }
  return interpolate(value, vars);
}
