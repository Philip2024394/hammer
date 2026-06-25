// Tiny one-shot ImageKit→Supabase migrator. Takes a source URL + a
// table/column/slug to update and does the fetch → upload → DB swap
// in a single pass. Used for fields that the broad migrate_images.mjs
// doesn't scan (e.g. trade-off listing media or priced_services).
//
// Usage:
//   node scripts/migrate_one_url.mjs <sourceUrl> <table> <column> <slug>
// Example:
//   node scripts/migrate_one_url.mjs https://ik.imagekit.io/.../foo.png \
//     hammerex_trade_off_listings video_cover_url demo-mike-watson-drywall-manchester
//
// For jsonb-nested fields use the dedicated update script instead.

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

const [, , sourceUrl, table, column, slug] = process.argv;
if (!sourceUrl || !table || !column || !slug) {
  console.error(
    "Usage: node scripts/migrate_one_url.mjs <sourceUrl> <table> <column> <slug>"
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
const ext =
  resp.headers.get("content-type")?.split("/")[1]?.split(";")[0] || "png";
const path = `migrated/${hash}.${ext}`;

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
const pub = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
const newUrl = pub.data.publicUrl;
console.log("New URL:", newUrl);

const { data, error } = await supabaseAdmin
  .from(table)
  .update({ [column]: newUrl })
  .eq("slug", slug)
  .select(`slug, ${column}`)
  .maybeSingle();
console.log("DB update:", data ?? error);
