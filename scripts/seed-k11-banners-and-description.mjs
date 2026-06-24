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

const SLUG = "k11-drywall-tool-station";

const banners = [
  "https://ik.imagekit.io/9mrgsv2rp/k11%20toolstation.png",
  "https://ik.imagekit.io/9mrgsv2rp/Untitledasdasddasdvvv.png",
  "https://ik.imagekit.io/9mrgsv2rp/Untitledmnmnmnmdasasdsdasdzxczxcsdfsdf.png"
];

const description = `HAMMEREX K11 TOOL STATION

### If You Can Lift It – It Will Carry It™

The Hammerex K11 Tool Station has redefined drywall site storage by setting new standards for strength, capacity, and durability. Designed specifically for professional drywall finishers and tapers, the K11 is not your standard toolbox—it's a fully engineered workstation built to organize, protect, and transport the tools that keep your trade moving.

After years of design development, field testing, and manufacturing refinement, we have created what we believe is the ultimate drywall tool storage solution. Built with a robust double-lined construction and reinforced solid-core frame, the K11 Tool Station is engineered to withstand the daily demands of commercial and residential drywall sites.

Our philosophy is simple:

**If you can lift it, it will carry it.**

### Built for Serious Capacity

The K11 Tool Station accommodates an extensive range of drywall finishing equipment, including:

* Holds up to **5 rows of drywall knives** with a total storage length of **19.5 inches**
* Side storage for plastering trowels up to **18" x 5"**
* Multiple gable pockets for smaller hand tools and accessories
* Storage for open-end skimming blades, spatulas, and finishing tools
* Dedicated side position for a site water level
* Mud pan storage for **1 to 3 pans**, nested together for efficient transport

### Massive Internal Storage

Open the main compartment and you'll find approximately:

**7" x 20" x 14" of usable storage space**

Perfect for:

* Power tools
* Electrical equipment
* Joint tape rolls
* Site consumables
* Additional finishing accessories

### Engineered for the Trade

Every detail of the K11 has been developed with the professional drywall contractor in mind. It is built to handle the realities of daily site work while keeping your tools organized, protected, and immediately accessible.

With minimal care, the K11 Tool Station is designed to provide years of reliable service. In fact, many tradespeople may find themselves handing it down to the next generation of drywall tapers.

### Why Choose the K11?

✔ Heavy-duty double-lined construction
✔ Reinforced solid-core frame
✔ Purpose-built for drywall professionals
✔ Exceptional tool organization and accessibility
✔ Massive carrying capacity
✔ Field-tested and trade-proven durability
✔ Designed to last for years of site use

The Hammerex K11 Tool Station isn't just storage—it's the result of years of experience, testing, and innovation. A tool station built by tradespeople, for tradespeople.

**HAMMEREX K11 TOOL STATION**

**The Drywall Tool Master™**`;

const r = await supabase.from("hammerex_products").select("id").eq("slug", SLUG).maybeSingle();
if (!r.data) throw new Error(`${SLUG} not found`);
const id = r.data.id;

{
  const { error } = await supabase
    .from("hammerex_products")
    .update({
      image_url: banners[0],
      description,
      subtitle: "The Drywall Tool Master™",
      shipping_per_unit_idr: 0
    })
    .eq("id", id);
  if (error) throw error;
  console.log("✓ product image_url, description, subtitle, free shipping updated");
}

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

console.log("\nDone.");
