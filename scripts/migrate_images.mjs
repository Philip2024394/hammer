import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';

const env = Object.fromEntries(
  readFileSync('.env.tools.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const supabase = createClient(env.HAMMEREX_NEW_SUPABASE_URL, env.HAMMEREX_NEW_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';
const MAP_FILE = 'scripts/image_map.json';

const TABLES = [
  { table: 'hammerex_products',         col: 'image_url' },
  { table: 'hammerex_product_media',    col: 'url' },
  { table: 'hammerex_product_variants', col: 'image_url' },
  { table: 'hammerex_categories',       col: 'image_url' },
  { table: 'hammerex_categories',       col: 'card_image_url' },
  { table: 'hammerex_what_in_box',      col: 'image_url' },
  { table: 'hammerex_product_deals',    col: 'banner_url' },
  { table: 'hammerex_guides',           col: 'hero_image_url' }
];

// 1. Collect every distinct ImageKit URL across all tables on the new project.
const urls = new Set();
for (const { table, col } of TABLES) {
  let from = 0, batch = 1000;
  for (;;) {
    const { data, error } = await supabase.from(table).select(col).range(from, from + batch - 1);
    if (error) { console.error(table, error); process.exit(1); }
    for (const row of data) {
      const v = row[col];
      if (v && typeof v === 'string' && v.includes('ik.imagekit.io')) urls.add(v);
    }
    if (data.length < batch) break;
    from += batch;
  }
}

const all = [...urls];
console.log(`Found ${all.length} distinct ImageKit URLs to migrate.`);

// 2. Strip ImageKit transform params (anything after a "?" with "tr=") so we
//    fetch the ORIGINAL asset, then re-derive a stable filename.
function cleanUrl(u) {
  // Drop "?tr=..." (transform) — but keep "?updatedAt=..." since some images
  // are stored with that suffix as the only way to find the right version.
  const url = new URL(u);
  url.searchParams.delete('tr');
  return url.toString();
}

function makeKey(u) {
  // Use a hash of the cleaned URL + the original extension. This deduplicates
  // identical sources and gives a stable storage path.
  const cleaned = cleanUrl(u);
  const pathExt = extname(new URL(cleaned).pathname).toLowerCase() || '.png';
  const hash = createHash('sha1').update(cleaned).digest('hex').slice(0, 16);
  return `migrated/${hash}${pathExt}`;
}

// 3. Resume support — load existing map.
const map = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf8')) : {};

// 4. Migrate each URL. Skip already-mapped ones.
const PUBLIC_BASE = `${env.HAMMEREX_NEW_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
let done = Object.keys(map).length;
let failed = 0;
for (const url of all) {
  if (map[url]) continue;
  const key = makeKey(url);
  try {
    // Force ImageKit to serve the absolute uploaded master (PNG, full
    // resolution) instead of an auto-optimized JPEG variant. Without
    // `?tr=orig-true`, ImageKit's auto-format/auto-size negotiation can
    // hand back a smaller derivative — and that lower-res copy is what
    // ends up frozen in Supabase Storage.
    const cleaned = cleanUrl(url);
    const fetchTarget = (() => {
      const u = new URL(cleaned);
      u.searchParams.set('tr', 'orig-true');
      return u.toString();
    })();
    const res = await fetch(fetchTarget);
    if (!res.ok) throw new Error(`fetch ${res.status} ${res.statusText}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    const { error } = await supabase.storage.from(BUCKET).upload(key, buf, {
      contentType,
      upsert: true,
      cacheControl: '31536000'
    });
    if (error) throw error;
    map[url] = PUBLIC_BASE + key;
    done++;
    if (done % 10 === 0 || done === all.length) {
      writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
      console.log(`Migrated ${done}/${all.length}`);
    }
  } catch (e) {
    failed++;
    console.error(`FAIL ${url}: ${e.message ?? e}`);
  }
}
writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
console.log(`Done. ${done} migrated, ${failed} failed. Map saved to ${MAP_FILE}.`);
