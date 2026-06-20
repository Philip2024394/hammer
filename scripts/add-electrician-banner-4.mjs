import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const BANNER_4 = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2004_34_00%20AM.png";

const r = await supabase.from("hammerex_products").select("id").eq("slug", "electrician-pro-pouch").maybeSingle();
const { error } = await supabase.from("hammerex_product_media").insert({
  product_id: r.data.id,
  kind: "image",
  url: BANNER_4,
  alt: null,
  sort_order: 3
});
if (error) throw error;
console.log("✓ banner 4 appended to Electrician Pro Pouch gallery");
