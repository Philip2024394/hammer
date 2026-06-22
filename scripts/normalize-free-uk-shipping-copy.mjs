// Normalize the shipping line in purchase_notes for every product whose
// shipping_per_unit_idr=0 (the free-UK / £10-other set). One canonical line
// replaces every legacy variant ("FREE UK delivery via EMS …", "£10 flat
// EMS air-freight …", separate "Outside the UK" line, etc.).
//
// Run: node scripts/normalize-free-uk-shipping-copy.mjs
import fs from 'node:fs';

const PROJECT_REF = 'msdonkkechxzgagyguoe';
const TOKEN = fs.readFileSync('.env.tools.local', 'utf8')
  .match(/SUPABASE_ACCESS_TOKEN=([^\r\n]+)/)?.[1]
  ?.trim();
if (!TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN not found in .env.tools.local');

const CANONICAL = 'Free UK delivery — £10 flat to all other countries.';

// Patterns that identify a shipping-fee line on a free-UK product. Match
// is case-insensitive. Any matching note is dropped; canonical line is
// inserted at the end of the array.
const SHIPPING_PATTERNS = [
  /free\s+(uk|delivery)/i,
  /outside the uk/i,
  /£10 flat ems/i,
  /£10 air freight/i,
  /£10 flat to/i,
  /air freight/i,
  /ems air-freight/i,
  /all other countries/i
];

async function sql(query) {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    }
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`SQL failed: ${text}`);
  return JSON.parse(text);
}

const rows = await sql(
  `select id, sku, purchase_notes from public.hammerex_products where shipping_per_unit_idr=0 order by sku;`
);

let updated = 0, unchanged = 0;
for (const row of rows) {
  const notes = Array.isArray(row.purchase_notes) ? row.purchase_notes : [];
  const kept = notes.filter(
    (n) => !SHIPPING_PATTERNS.some((re) => re.test(String(n)))
  );
  const next = [...kept, CANONICAL];

  const same =
    next.length === notes.length &&
    next.every((v, i) => v === notes[i]);
  if (same) {
    unchanged++;
    console.log(`  ${row.sku}: unchanged`);
    continue;
  }

  const json = JSON.stringify(next).replace(/'/g, "''");
  await sql(
    `update public.hammerex_products set purchase_notes='${json}'::jsonb where id='${row.id}';`
  );
  updated++;
  console.log(`  ${row.sku}: rewrote (${notes.length} → ${next.length} notes)`);
}

console.log(`\nDone. ${updated} updated, ${unchanged} unchanged. Canonical line:`);
console.log(`  "${CANONICAL}"`);
