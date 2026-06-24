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
  card_image_url: string | null;
  card_show_label: boolean;
  sort_order: number;
  is_tool_type?: boolean | null;
};

export type HammerexProductCategoryLite = { slug: string; name: string };

export type HammerexProduct = {
  id: string;
  category_id: string | null;
  category?: HammerexProductCategoryLite | null;
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
  stock_count: number | null;
  compare_at_idr: number | null;
  qty_discount_tiers: { min: number; pct: number }[] | null;
  is_accessory: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  base_currency: string | null;
  sizes: string[] | null;
  dispatch_lead_days: number | null;
  delivery_quote_only: boolean | null;
  purchase_notes: string[] | null;
  badge_label: string | null;
  subtitle: string | null;
  home_sort_order: number | null;
  thread_color_option_idr: number | null;
  backpack_straps_option_idr: number | null;
  is_universal: boolean | null;
  shipping_per_unit_idr: number | null;
  // SEA-only override price in IDR. Shown to ID/MY/VN visitors (with FX
  // for MY/VN). 0 means "Quoted at checkout" — admin sets per product.
  price_idr_sea: number;
  // Display-only flag: when true, ID/MY/VN visitors see Rp 0 shipping
  // (the FX-converted equivalent for MY/VN). Does not affect UK shipping.
  free_shipping_sea: boolean;
  hide_from_upsell?: boolean;
  upsell_image_url?: string | null;
  compare_with?: string[] | null;
  faq: { q: string; a: string }[] | null;
  // Per-product marquee shown under the hero image on the PDP. Falls back
  // to the brand-wide rotation when null.
  running_notice?: string | null;
  // Optional product video. Supports YouTube watch URLs, youtu.be short
  // URLs, and YouTube Shorts URLs. Rendered by ProductVideo on the PDP
  // only when set.
  video_url?: string | null;
  // Optional custom poster shown as a click-to-play facade over the video
  // block. When set, the PDP renders this image with a red YouTube play
  // button overlay; clicking loads the iframe with autoplay.
  video_cover_url?: string | null;
};

export type HammerexGuide = {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  intro: string;
  body_md: string;
  hero_image_url: string | null;
  faq: { q: string; a: string }[] | null;
  related_product_slugs: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type HammerexProductVariant = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price_idr: number;
  // SEA-only variant override. 0 = inherit parent's price_idr_sea.
  price_idr_sea: number;
  image_url: string | null;
  model_number: string | null;
  stock_count: number | null;
  sort_order: number;
  is_default: boolean;
};

export type HammerexDealBreaker = {
  id: string;
  anchor_product_id: string;
  item_product_id: string;
  deal_price_idr: number;
  sort_order: number;
  item: HammerexProduct;
  variants: HammerexProductVariant[];
};

export type HammerexBundle = {
  id: string;
  anchor_product_id: string;
  title: string;
  discount_pct: number;
  items: { id: string; qty: number; product: HammerexProduct }[];
};

export type HammerexPairWith = {
  id: string;
  product_id: string;
  accessory_product_id: string;
  reason: string | null;
  sort_order: number;
  accessory: HammerexProduct;
};

export type HammerexReview = {
  id: string;
  product_id: string;
  reviewer_name: string;
  reviewer_type: "pro" | "hobbyist" | "first-timer" | "vendor" | null;
  rating: number;
  pillars: Record<string, number> | null;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  reviewer_whatsapp: string | null;
  reviewer_country: string | null;
  reviewed_at: string | null;
};

export type HammerexQuestion = {
  id: string;
  product_id: string;
  asked_by: string | null;
  body: string;
  created_at: string;
  answers: { id: string; body: string; by_name: string | null; by_vendor: boolean; created_at: string }[];
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

export type HammerexProductDeal = {
  id: string;
  product_id: string;
  sort_order: number;
  qty: number;
  label: string;
  banner_url: string;
  name: string;
  price_idr: number;
  description: string | null;
  icon_emoji: string | null;
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
  free_shipping_threshold_idr: number;
};
