// Re-migrate every asset already mapped in scripts/image_map.json by
// re-fetching the ImageKit URL with `?tr=orig-true` (which forces ImageKit
// to serve the absolute uploaded master, not an auto-optimized variant),
// then overwriting the existing Supabase Storage path with `upsert: true`.
//
// Why: the original `migrate_images.mjs` used `cleanUrl(u)` to strip `?tr=`
// transforms before fetching, which made ImageKit return JPEG-converted,
// auto-resized variants (e.g. 1228×817 instead of the 1600×1064 master).
// The DB URLs do NOT change — same Supabase Storage paths, same bytes
// after this rerun.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.tools.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const supabase = createClient(env.HAMMEREX_NEW_SUPABASE_URL, env.HAMMEREX_NEW_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';
const PUBLIC_BASE = `${env.HAMMEREX_NEW_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

const map = JSON.parse(readFileSync('scripts/image_map.json', 'utf8'));
const entries = Object.entries(map);
console.log(`Re-migrating ${entries.length} assets at original master resolution…`);

function fetchUrl(orig) {
  // Append ?tr=orig-true (or & if URL already has a query string) so ImageKit
  // serves the uploaded master, not an auto-optimized variant.
  const u = new URL(orig);
  u.searchParams.set('tr', 'orig-true');
  return u.toString();
}

function keyFromPublicUrl(publicUrl) {
  // Public URL form: {PUBLIC_BASE}migrated/{hash}.{ext}
  // Strip the base to get the storage key.
  if (!publicUrl.startsWith(PUBLIC_BASE)) {
    throw new Error(`unexpected public URL shape: ${publicUrl}`);
  }
  return publicUrl.slice(PUBLIC_BASE.length);
}

let done = 0, failed = 0, skipped = 0;
let sumOldBytes = 0, sumNewBytes = 0;

for (const [origUrl, newPublicUrl] of entries) {
  const key = keyFromPublicUrl(newPublicUrl);
  const fetchTarget = fetchUrl(origUrl);
  try {
    const res = await fetch(fetchTarget);
    if (!res.ok) {
      // 404 means the original asset is gone from ImageKit — skip and leave
      // the previously-migrated bytes in place.
      if (res.status === 404) { skipped++; continue; }
      throw new Error(`fetch ${res.status} ${res.statusText}`);
    }
    const arr = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';

    // Quick size check vs what's currently in storage; only re-upload if the
    // master is materially different (>1% size delta). Saves bandwidth on
    // assets where the current upload IS already the master.
    const existing = await fetch(newPublicUrl, { method: 'HEAD' });
    const existingBytes = parseInt(existing.headers.get('content-length') || '0', 10);
    sumOldBytes += existingBytes;
    sumNewBytes += arr.length;
    if (existingBytes > 0 && Math.abs(arr.length - existingBytes) / existingBytes < 0.01) {
      skipped++;
      continue;
    }

    const { error } = await supabase.storage.from(BUCKET).upload(key, arr, {
      contentType, upsert: true, cacheControl: '31536000'
    });
    if (error) throw error;
    done++;
    if (done % 10 === 0) console.log(`  re-uploaded ${done}/${entries.length}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${origUrl}: ${e.message ?? e}`);
  }
}

console.log(`\nDone. Re-uploaded ${done}, skipped ${skipped}, failed ${failed}.`);
console.log(`Total bytes — before: ${(sumOldBytes/1024/1024).toFixed(1)} MB, after: ${(sumNewBytes/1024/1024).toFixed(1)} MB`);
