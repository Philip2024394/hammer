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
};
