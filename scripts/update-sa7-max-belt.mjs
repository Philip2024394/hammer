import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SKU = "HX-SA7-001";
const NEW_NAME = "Scaffolders Max Belt";
const NEW_BANNER = "https://ik.imagekit.io/9mrgsv2rp/Untitledzxczxczxczxczxczxczxczxczxxxxxdfsdfasdasd.png";
const NEW_DESCRIPTION =
  "Heavy-duty 7-station scaffolders belt — spring-loaded tape deck (up to 8 m tape), bolt-fixed metal hammer loop holder, curved single-bubble-level holder, three Frog metal-edge tool holders, and a glove clip holder.";

const p = await s.from("hammerex_products").select("id, name, price_idr, image_url").eq("sku", SKU).maybeSingle();
if (!p.data) throw new Error(`${SKU} not found`);
const { id, price_idr: base } = p.data;
console.log(`Updating ${SKU} (was "${p.data.name}", base ${base} IDR)`);

// 1. name, description, image_url (primary banner)
{
  const { error } = await s
    .from("hammerex_products")
    .update({ name: NEW_NAME, description: NEW_DESCRIPTION, image_url: NEW_BANNER })
    .eq("id", id);
  if (error) throw error;
  console.log(`✓ name → "${NEW_NAME}"`);
  console.log(`✓ description updated (hammer loop holder + glove clip holder)`);
  console.log(`✓ image_url → ${NEW_BANNER}`);
}

// 2. First gallery media row (hero banner) — swap to new banner
{
  const m = await s
    .from("hammerex_product_media")
    .select("id")
    .eq("product_id", id)
    .eq("kind", "image")
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (m.data) {
    const { error } = await s
      .from("hammerex_product_media")
      .update({ url: NEW_BANNER, alt: `${NEW_NAME} — banner 1` })
      .eq("id", m.data.id);
    if (error) throw error;
    console.log(`✓ hero media row updated`);
  } else {
    console.log("(no hero media row found — skipped)");
  }
}

// 3. Update remaining media rows' alt to match new name (keep their URLs)
{
  const rest = await s.from("hammerex_product_media").select("id, sort_order").eq("product_id", id).eq("kind", "image").gt("sort_order", 0).order("sort_order");
  for (const m of rest.data ?? []) {
    await s.from("hammerex_product_media").update({ alt: `${NEW_NAME} — banner ${m.sort_order + 1}` }).eq("id", m.id);
  }
  if (rest.data?.length) console.log(`✓ ${rest.data.length} secondary media alt(s) renamed`);
}

// 4. Multi-buy deals (qty 2 = -10%, qty 3 = -15%) — using new banner
{
  const roundDown100 = (n) => Math.floor(n / 100) * 100;
  const qty2 = roundDown100(base * 2 * 0.9);
  const qty3 = roundDown100(base * 3 * 0.85);
  await s.from("hammerex_product_deals").delete().eq("product_id", id);
  const deals = [
    {
      product_id: id,
      sort_order: 0,
      label: "Deal 1",
      qty: 2,
      name: `Buy 2 ${NEW_NAME}s`,
      price_idr: qty2,
      banner_url: NEW_BANNER,
      icon_emoji: null,
      description: null,
    },
    {
      product_id: id,
      sort_order: 1,
      label: "Deal 2",
      qty: 3,
      name: `Buy 3 ${NEW_NAME}s`,
      price_idr: qty3,
      banner_url: NEW_BANNER,
      icon_emoji: null,
      description: null,
    },
  ];
  const { error } = await s.from("hammerex_product_deals").insert(deals);
  if (error) throw error;
  console.log(`✓ multi-buy: qty2 @ ${qty2.toLocaleString()} (-10%), qty3 @ ${qty3.toLocaleString()} (-15%)`);
}

console.log("\nDone — now run scripts/migrate_images.mjs && scripts/rewrite_urls.mjs to copy the ImageKit asset into Supabase Storage.");
