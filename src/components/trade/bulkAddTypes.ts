// Shared types for the bulk-add UI surfaces (QuickOrderBar, BulkGridView,
// BulkAddToast). Mirrors the wire format of POST /api/trade/cart/bulk-add.

export type BulkAddedRow = {
  sku: string;
  qty_used: number;
  was_bumped: boolean;
  moq: number;
};

export type BulkAddResult = {
  added: BulkAddedRow[];
  not_found: string[];
  invalid: string[];
};

export type BulkAddLine = { sku: string; qty: number };

/** Shape a BulkGridView consumer hands in for each catalogue row. */
export type BulkGridProduct = {
  id: string;
  sku: string | null;
  name: string;
  trade_price_gbp: number | null;
  moq: number | null;
  variants?: BulkGridVariant[];
};

export type BulkGridVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  label: string | null;
  trade_price_gbp: number | null;
  moq: number | null;
};
