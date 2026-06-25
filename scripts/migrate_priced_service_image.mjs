// Tiny one-shot ImageKit→Supabase migrator for a single priced_services
// entry on a trade-off listing. Downloads the source, uploads to
// Supabase Storage, then patches the jsonb path with the new URL.
//
// Usage:
//   node scripts/migrate_priced_service_image.mjs <sourceUrl> <slug> <serviceIndex>

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync("C:\\Users\\Victus\\hammer\\.env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const [, , sourceUrl, slug, indexStr] = process.argv;
const idx = Number(indexStr);
if (!sourceUrl || !slug || !Number.isInteger(idx)) {
  console.error(
    "Usage: node scripts/migrate_priced_service_image.mjs <sourceUrl> <slug> <serviceIndex>"
  );
  process.exit(1);
}

console.log("Fetching:", sourceUrl);
const resp = await fetch(sourceUrl);
if (!resp.ok) {
  console.error("Fetch failed:", resp.status);
  process.exit(1);
}
const buf = Buffer.from(await resp.arrayBuffer());
const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
const path = `migrated/${hash}.png`;

console.log(`Uploading: ${path} (${buf.length} bytes)`);
const up = await supabaseAdmin.storage
  .from("product-images")
  .upload(path, buf, {
    contentType: resp.headers.get("content-type") ?? "image/png",
    cacheControl: "31536000",
    upsert: true
  });
if (up.error) {
  console.error("Upload failed:", up.error);
  process.exit(1);
}
const newUrl = supabaseAdmin.storage
  .from("product-images")
  .getPublicUrl(path).data.publicUrl;
console.log("New URL:", newUrl);

// Patch the jsonb path priced_services[idx].image_url via the rest API
// rpc-style raw SQL through the management endpoint would be cleaner,
// but for one row a select-mutate-update round trip is fine.
const { data: row, error: readErr } = await supabaseAdmin
  .from("hammerex_trade_off_listings")
  .select("id, priced_services")
  .eq("slug", slug)
  .maybeSingle();
if (readErr || !row) {
  console.error("Read failed:", readErr);
  process.exit(1);
}
const services = Array.isArray(row.priced_services) ? row.priced_services : [];
if (!services[idx]) {
  console.error(`Index ${idx} out of bounds (length ${services.length})`);
  process.exit(1);
}
services[idx].image_url = newUrl;
const { data, error } = await supabaseAdmin
  .from("hammerex_trade_off_listings")
  .update({ priced_services: services })
  .eq("id", row.id)
  .select("slug")
  .maybeSingle();
console.log("DB update:", data ?? error);
console.log(`Updated service[${idx}].image_url → ${newUrl}`);
