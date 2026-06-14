// One-shot helper: download a single source URL and upload to product-images.
// Usage: node scripts/add_single_image.mjs <source_url>
// Prints the resulting public Supabase Storage URL to stdout.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';

const env = Object.fromEntries(
  readFileSync('.env.tools.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);
const sb = createClient(env.HAMMEREX_NEW_SUPABASE_URL, env.HAMMEREX_NEW_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/add_single_image.mjs <source_url>'); process.exit(1); }

const cleaned = new URL(src);
cleaned.searchParams.delete('tr');
const pathExt = extname(cleaned.pathname).toLowerCase() || '.png';
const hash = createHash('sha1').update(cleaned.toString()).digest('hex').slice(0, 16);
const key = `migrated/${hash}${pathExt}`;

const res = await fetch(cleaned.toString());
if (!res.ok) { console.error(`fetch ${res.status}`); process.exit(1); }
const buf = new Uint8Array(await res.arrayBuffer());
const contentType = res.headers.get('content-type') || 'image/png';

const { error } = await sb.storage.from(BUCKET).upload(key, buf, {
  contentType, upsert: true, cacheControl: '31536000'
});
if (error) { console.error(error); process.exit(1); }
console.log(`${env.HAMMEREX_NEW_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`);
