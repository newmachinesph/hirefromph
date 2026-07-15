// Re-check cadence for dated claims. Scans data/*.json for `lastVerified`
// ("YYYY-MM") and flags any stamp older than the review window. Run it in CI
// or by hand each month — a stale stamp on the honesty pages is a cracked brand.
//
//   node scripts/verify-claims.mjs           # warn at 6 months, exit 0
//   node scripts/verify-claims.mjs --ci      # exit 1 if anything is overdue
//   node scripts/verify-claims.mjs --months 4
//
// ponytail: reads the lastVerified field the pages already carry — no registry.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const args = process.argv.slice(2);
const ci = args.includes("--ci");
const months = Number(args[args.indexOf("--months") + 1]) || 6;

// Current YYYY-MM as an integer months-since-year-0, for cheap comparison.
const now = new Date();
const nowMonths = now.getFullYear() * 12 + now.getMonth(); // getMonth() is 0-based

function ageInMonths(stamp) {
  const [y, m] = stamp.split("-").map(Number);
  if (!y || !m) return null; // malformed stamp
  return nowMonths - (y * 12 + (m - 1));
}

const overdue = [];
const tracked = [];

for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
  let stamp;
  try {
    stamp = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")).lastVerified;
  } catch (err) {
    console.error(`✗ ${file}: could not parse — ${err.message}`);
    if (ci) process.exitCode = 1;
    continue;
  }
  if (!stamp) continue;
  const age = ageInMonths(stamp);
  if (age === null) {
    console.error(`✗ ${file}: malformed lastVerified "${stamp}" (want YYYY-MM)`);
    if (ci) process.exitCode = 1;
    continue;
  }
  tracked.push(file);
  if (age >= months) overdue.push({ file, stamp, age });
}

if (overdue.length === 0) {
  console.log(`✓ ${tracked.length} dated pages, all verified within ${months} months.`);
} else {
  console.log(`\n⚠ ${overdue.length} page(s) overdue for re-check (>${months} months):\n`);
  for (const { file, stamp, age } of overdue.sort((a, b) => b.age - a.age)) {
    console.log(`  ${file.padEnd(20)} last verified ${stamp}  (${age} months ago)`);
  }
  console.log(`\nRe-check each number against its source, then bump lastVerified.\n`);
  if (ci) process.exitCode = 1;
}

// Self-check: the age math must be sane.
if (ageInMonths("2000-01") <= 0) {
  console.error("BUG: ageInMonths returned non-positive for an old stamp");
  process.exit(2);
}
