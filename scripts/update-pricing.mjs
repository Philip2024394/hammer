// Batch-replace stale £15 / £20 / £140 / £200 pricing references across
// the codebase with the new .99 prices.

import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/app/trade-off/success/page.tsx",
  "src/app/trade-off/trust/page.tsx",
  "src/app/trade-off/faq/page.tsx",
  "src/app/trade-off/why/page.tsx",
  "src/app/trade-off/verified/page.tsx",
  "src/app/trade-off/compare/page.tsx",
  "src/app/trade-off/what/page.tsx",
  "src/app/trade-off/services/page.tsx",
  "src/app/trade-off/how/page.tsx",
  "src/app/trade-off/pricing/PricingTierCards.tsx",
  "src/app/trade-off/pricing/page.tsx",
  "src/app/trade-off/page.tsx",
  "src/app/trade-off/verified-waitlist/VerifiedWaitlistForm.tsx",
  "src/app/api/trade-off/verified-waitlist/route.ts",
  "src/app/trade-off/verified-waitlist/page.tsx"
];

const replacements = [
  // Paid monthly £15 → £14.99
  [/£15\/mo\b/g, "£14.99/mo"],
  [/£15\/month\b/g, "£14.99/month"],
  [/£15 per month\b/g, "£14.99 per month"],
  [/£15 a month\b/g, "£14.99 a month"],
  [/£15 flat\b/g, "£14.99 flat"],
  // Paid annual £140 → £139.99
  [/£140\/yr\b/g, "£139.99/yr"],
  [/£140\/year\b/g, "£139.99/year"],
  [/£140 per year\b/g, "£139.99 per year"],
  [/£140 a year\b/g, "£139.99 a year"],
  // Verified monthly £20 → £19.99
  [/£20\/mo\b/g, "£19.99/mo"],
  [/£20\/month\b/g, "£19.99/month"],
  [/£20 per month\b/g, "£19.99 per month"],
  [/£20 a month\b/g, "£19.99 a month"],
  // Verified annual £200 → £199.99
  [/£200\/yr\b/g, "£199.99/yr"],
  [/£200\/year\b/g, "£199.99/year"],
  [/£200 per year\b/g, "£199.99 per year"],
  [/£200 a year\b/g, "£199.99 a year"]
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
    console.log(`✓ ${f.padEnd(50)} ${changes} swaps`);
    totalChanges += changes;
  } else {
    console.log(`- ${f.padEnd(50)} no changes`);
  }
}
console.log(`\nTotal: ${totalChanges} pricing references updated.`);
