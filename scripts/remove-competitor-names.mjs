// Batch-replace competitor brand names with generic "directories" /
// "trade directory" language. Keeps copy legally clean and brand-pure.
//
// Skipped:
//   - lib/tradeCredentials.ts (Checkatrade as a credential tag — that's
//     an attestation field on a tradesperson's profile, not marketing
//     copy; leave it so tradies who DO have a Checkatrade badge can
//     surface it themselves).
//   - lib/seo.ts (technical comment, not user-facing).

import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/app/trade-off/what/page.tsx",
  "src/app/trade-off/help/page.tsx",
  "src/app/trade-off/success/page.tsx",
  "src/app/trade-off/compare/page.tsx"
];

const replacements = [
  // Direct named-brand swaps → generic language. Order matters: do longer
  // strings first to avoid partial matches.
  [/Checkatrade subscription/g, "your trade-directory subscription"],
  [/visibility on Checkatrade/g, "visibility on trade directories"],
  [/Cancelled Checkatrade/g, "Cancelled my trade directory"],
  [/Quit Checkatrade/g, "Quit my trade directory"],
  [/move my reviews from Checkatrade/g, "move my reviews from a directory site"],
  [/Facebook, a Wix site and Checkatrade/g, "Facebook, a website and trade directories"],
  [/Facebook, Wix and Checkatrade/g, "Facebook, a website and trade directories"],
  [/Checkatrade rents/g, "trade directories rent"],
  // The compare-table column label
  [/label="Checkatrade"/g, `label="Trade directory"`],
  // Generic fallback — any standalone "Checkatrade" in copy → "a trade directory"
  [/Checkatrade/g, "a trade directory"]
];

let totalChanges = 0;
for (const f of files) {
  let content;
  try {
    content = readFileSync(f, "utf8");
  } catch {
    console.log("SKIP missing:", f);
    continue;
  }
  let changes = 0;
  for (const [pattern, replacement] of replacements) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      const matches = (before.match(pattern) || []).length;
      changes += matches;
    }
  }
  if (changes > 0) {
    writeFileSync(f, content);
    console.log(`✓ ${f.padEnd(45)} ${changes} swaps`);
    totalChanges += changes;
  } else {
    console.log(`- ${f.padEnd(45)} no changes`);
  }
}
console.log(`\nTotal: ${totalChanges} competitor references replaced.`);
