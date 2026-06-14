import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.tools.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);
const supabase = createClient(env.HAMMEREX_NEW_SUPABASE_URL, env.HAMMEREX_NEW_SERVICE_ROLE_KEY);
const map = JSON.parse(readFileSync('scripts/image_map.json', 'utf8'));

const TABLES = [
  { table: 'hammerex_products',         col: 'image_url' },
  { table: 'hammerex_product_media',    col: 'url' },
  { table: 'hammerex_product_variants', col: 'image_url' },
  { table: 'hammerex_categories',       col: 'image_url' },
  { table: 'hammerex_what_in_box',      col: 'image_url' }
];

let totalUpdated = 0;
for (const { table, col } of TABLES) {
  // Pull all rows with an ImageKit URL.
  const { data, error } = await supabase.from(table).select(`id, ${col}`).ilike(col, '%ik.imagekit.io%');
  if (error) { console.error(table, error); process.exit(1); }
  console.log(`${table}: ${data.length} rows to rewrite`);
  let updated = 0;
  for (const row of data) {
    const oldUrl = row[col];
    const newUrl = map[oldUrl];
    if (!newUrl) {
      console.error(`  no map entry for ${oldUrl}`);
      continue;
    }
    const { error: e } = await supabase.from(table).update({ [col]: newUrl }).eq('id', row.id);
    if (e) { console.error(`  update fail row ${row.id}:`, e); continue; }
    updated++;
  }
  console.log(`  -> ${updated} updated`);
  totalUpdated += updated;
}
console.log(`Total rewritten: ${totalUpdated}`);
