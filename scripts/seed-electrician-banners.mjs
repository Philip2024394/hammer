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

const SLUG = "electrician-pro-pouch";
const banners = [
  "https://ik.imagekit.io/9mrgsv2rp/Untitledasassassfdsdfsdfdssds.png",
  "https://ik.imagekit.io/9mrgsv2rp/Jun%2019,%202026,%2004_19_58%20AM.png",
  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2019,%202026,%2003_56_36%20AM.png"
];

const r = await supabase.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error(`${SLUG} not found`);
const id = r.data.id;

// 1. Promote banner 1 to primary image_url + propagate to existing deals' banners
{
  const { error } = await supabase
    .from("hammerex_products")
    .update({ image_url: banners[0] })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ image_url → banner 1");
}

// 2. Replace gallery media with the 3 banners
{
  await supabase.from("hammerex_product_media").delete().eq("product_id", id);
  const rows = banners.map((url, i) => ({
    product_id: id,
    kind: "image",
    url,
    alt: null,
    sort_order: i
  }));
  const { error } = await supabase.from("hammerex_product_media").insert(rows);
  if (error) throw error;
  console.log(`✓ ${rows.length} gallery media rows inserted`);
}

// 3. Multi-buy deal banners — keep using product image_url (banner 1) as placeholder
{
  const { error } = await supabase
    .from("hammerex_product_deals")
    .update({ banner_url: banners[0] })
    .eq("product_id", id);
  if (error) throw error;
  console.log("✓ existing deal banners refreshed to banner 1 (still placeholder)");
}

console.log("\nDone.");
