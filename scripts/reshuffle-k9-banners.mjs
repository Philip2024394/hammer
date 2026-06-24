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
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SLUG = "k9-plastering-tool-station";
const NEW_MAIN = "https://ik.imagekit.io/9mrgsv2rp/Untitledasdasddasdvvvasdasdasd.png";

const p = await sb.from("hammerex_products").select("id,image_url").eq("slug", SLUG).maybeSingle();
if (!p.data) throw new Error("K9 not found");
const id = p.data.id;
const OLD_MAIN = p.data.image_url;
console.log("old main:", OLD_MAIN);
console.log("new main:", NEW_MAIN);

{
  const { error } = await sb.from("hammerex_products").update({ image_url: NEW_MAIN }).eq("id", id);
  if (error) throw error;
  console.log("✓ product.image_url → new main");
}

{
  await sb.from("hammerex_product_media").delete().eq("product_id", id);
  const rows = [
    { product_id: id, kind: "image", url: NEW_MAIN, alt: null, sort_order: 0 },
    { product_id: id, kind: "image", url: OLD_MAIN, alt: null, sort_order: 1 }
  ];
  const { error } = await sb.from("hammerex_product_media").insert(rows);
  if (error) throw error;
  console.log("✓ gallery rewritten: NEW @ 0, OLD @ 1");
}

console.log("\nDone.");
