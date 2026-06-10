import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false }
});

export type HammerexCategory = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export type HammerexProduct = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_idr: number;
  image_url: string | null;
  is_featured: boolean;
  slug: string | null;
  sku: string | null;
  brand: string | null;
  model_number: string | null;
  weight_kg: number | null;
  dispatch_cutoff_local: string | null;
  warranty_years: number | null;
  country_of_assembly: string | null;
  overview: string | null;
  features: { icon: string; label: string }[] | null;
};

export type HammerexProductMedia = {
  id: string;
  product_id: string;
  kind: "image" | "video" | "360";
  url: string;
  alt: string | null;
  sort_order: number;
};

export type HammerexProductSpec = {
  id: string;
  product_id: string;
  group_name: string;
  label: string;
  value: string;
  sort_order: number;
};

export type HammerexWhatInBox = {
  id: string;
  product_id: string;
  label: string;
  qty: number;
  image_url: string | null;
  sort_order: number;
};

export type HammerexShippingZone = {
  id: string;
  country_code: string;
  country_name: string;
  carrier: string;
  base_fee_idr: number;
  per_kg_idr: number;
  eta_min_days: number;
  eta_max_days: number;
  is_default: boolean;
};
