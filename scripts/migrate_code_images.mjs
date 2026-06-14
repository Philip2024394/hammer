import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname, join } from 'node:path';

const env = Object.fromEntries(
  readFileSync('.env.tools.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);
const supabase = createClient(env.HAMMEREX_NEW_SUPABASE_URL, env.HAMMEREX_NEW_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';
const MAP_FILE = 'scripts/image_map.json';
const map = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf8')) : {};

const SOURCE_GLOBS = [
  'src/components/Header.tsx',
  'src/components/Hero.tsx',
  'src/components/DistributionPartnersSection.tsx',
  'src/components/MobileDrawer.tsx',
  'src/components/ProductRequestSection.tsx',
  'src/app/partners/page.tsx',
  'src/lib/seo.ts',
  'src/app/dev/deal-breaker-preview/page.tsx'
];

const RX = /https:\/\/ik\.imagekit\.io\/[^"' )]+/g;
const all = new Set();
for (const f of SOURCE_GLOBS) {
  if (!existsSync(f)) continue;
  const src = readFileSync(f, 'utf8');
  let m;
  while ((m = RX.exec(src)) !== null) all.add(m[0]);
}
const todo = [...all].filter(u => !map[u]);
console.log(`Code references ${all.size} ImageKit URLs; ${todo.length} not yet in map.`);

function cleanUrl(u) {
  const url = new URL(u);
  url.searchParams.delete('tr');
  return url.toString();
}
function makeKey(u) {
  const cleaned = cleanUrl(u);
  const pathExt = extname(new URL(cleaned).pathname).toLowerCase() || '.png';
  const hash = createHash('sha1').update(cleaned).digest('hex').slice(0, 16);
  return `migrated/${hash}${pathExt}`;
}

const PUBLIC_BASE = `${env.HAMMEREX_NEW_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
for (const url of todo) {
  try {
    const cleaned = cleanUrl(url);
    const res = await fetch(cleaned);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    const key = makeKey(url);
    const { error } = await supabase.storage.from(BUCKET).upload(key, buf, {
      contentType, upsert: true, cacheControl: '31536000'
    });
    if (error) throw error;
    map[url] = PUBLIC_BASE + key;
    console.log(`OK ${url} -> ${map[url]}`);
  } catch (e) {
    console.error(`FAIL ${url}: ${e.message ?? e}`);
  }
}
writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

// Rewrite each source file in-place using the map.
let touched = 0;
for (const f of SOURCE_GLOBS) {
  if (!existsSync(f)) continue;
  let src = readFileSync(f, 'utf8');
  let changed = false;
  for (const [oldUrl, newUrl] of Object.entries(map)) {
    if (src.includes(oldUrl)) { src = src.split(oldUrl).join(newUrl); changed = true; }
  }
  if (changed) { writeFileSync(f, src); touched++; console.log(`rewritten: ${f}`); }
}
console.log(`Touched ${touched} files.`);
