// Voice tic audit. The house style lands the same aphoristic punch on nearly
// every page — "A file solves today. A method solves every tomorrow." Beautiful
// once; a tic across 35 pages. This flags the pattern so you can thin ~1-in-5
// by hand and let the survivors hit harder. It does NOT rewrite — voice is taste.
//
//   node scripts/voice-audit.mjs          # ranked list of aphorism-dense strings
//
// The "aphorism" tell: 2+ short parallel sentences, each ≤ 60 chars.
// ponytail: a detector, not an editor. You decide which ones to keep.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const MAX_APHORISM_CHARS = 60;

// A string reads as an aphorism if its first two sentences are both short.
// That short-short parallel cadence is the punch that repeats page to page.
function isAphoristic(s) {
  const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length < 2) return false;
  const [a, b] = sentences;
  return a.length <= MAX_APHORISM_CHARS && b.length <= MAX_APHORISM_CHARS;
}

// Walk a parsed JSON value, yielding every [keyPath, string].
function* strings(node, path = "") {
  if (typeof node === "string") {
    yield [path, node];
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* strings(node[i], `${path}[${i}]`);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) yield* strings(v, path ? `${path}.${k}` : k);
  }
}

const hits = [];
let filesWithTic = 0;

for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
  } catch {
    continue;
  }
  let n = 0;
  for (const [path, str] of strings(data)) {
    if (isAphoristic(str)) {
      hits.push({ file, path, str });
      n++;
    }
  }
  if (n) filesWithTic++;
}

// Per-file density — the pages leaning hardest on the cadence.
const byFile = {};
for (const h of hits) byFile[h.file] = (byFile[h.file] || 0) + 1;

console.log(`\nAphorism cadence: ${hits.length} strings across ${filesWithTic} pages.\n`);
console.log("Densest pages (thin these first):");
for (const [file, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(3)}  ${file}`);
}

console.log(`\nSample punches (first 12):`);
for (const { file, path, str } of hits.slice(0, 12)) {
  const first = str.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  console.log(`  ${file} · ${path}\n      "${first}"`);
}
console.log(`\nRule of thumb: keep the punch on section openers and closers.`);
console.log(`Flatten it in the middle — let plain prose carry the body.\n`);

// Self-check: the detector must fire on the canonical tic and not on plain prose.
if (!isAphoristic("A file solves today. A method solves every tomorrow."))
  throw new Error("BUG: detector missed the canonical aphorism");
if (isAphoristic("This is one long ordinary sentence with no parallel short punch at all."))
  throw new Error("BUG: detector fired on plain prose");
