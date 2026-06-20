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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SLUG = "trowel-leg-pouch";
const galleryUrls = [
  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2009_24_58%20AM.png?updatedAt=1781749525828",
  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2009_18_49%20AM.png?updatedAt=1781749155101",
  "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2009_48_22%20AM.png?updatedAt=1781750932473"
];
const dealQty2Banner = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2010_09_55%20AM.png?updatedAt=1781752215386";
const dealQty3Banner = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2018,%202026,%2010_40_23%20AM.png?updatedAt=1781754064348";

const r = await supabase.from("hammerex_products").select("id, image_url").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error("trowel-leg-pouch not found");
const id = r.data.id;

// 1. Promote first banner to primary image_url
{
  const { error } = await supabase
    .from("hammerex_products")
    .update({ image_url: galleryUrls[0] })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ image_url updated to banner 1");
}

// 2. Replace gallery media with 3 banners
{
  await supabase.from("hammerex_product_media").delete().eq("product_id", id);
  const rows = galleryUrls.map((url, i) => ({
    product_id: id,
    kind: "image",
    url,
    alt: null,
    sort_order: i
  }));
  const { error } = await supabase.from("hammerex_product_media").insert(rows);
  if (error) throw error;
  console.log(`✓ ${rows.length} gallery media inserted`);
}

// 3. Update deal banners by qty
{
  const updates = [
    { qty: 2, banner_url: dealQty2Banner },
    { qty: 3, banner_url: dealQty3Banner }
  ];
  for (const u of updates) {
    const { error } = await supabase
      .from("hammerex_product_deals")
      .update({ banner_url: u.banner_url })
      .eq("product_id", id)
      .eq("qty", u.qty);
    if (error) throw error;
  }
  console.log("✓ deal banners (qty 2 + qty 3) updated");
}

console.log("\nDone.");
