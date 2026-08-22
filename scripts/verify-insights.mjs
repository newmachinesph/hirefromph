#!/usr/bin/env node
/**
 * verify:insights — every article folder keeps the rules in lib/insights.ts:
 * a valid meta.json, assets that exist in public/insights/<slug>/, sources
 * with real URLs, and the honesty rule (a paragraph that states a number
 * carries a source link). Exits 1 if any article has a problem.
 *
 * The rules live in lib/insights.ts (TypeScript); this script runs them
 * through Node's type-stripping loader so the suite and CI share one source.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = pathToFileURL(join(ROOT, "lib", "insights.ts")).href;

const program = `
import { listAllInsights, validateInsight } from ${JSON.stringify(LIB)};
const insights = listAllInsights();
let problems = 0;
for (const insight of insights) {
  const found = validateInsight(insight);
  for (const p of found) console.error("- " + p);
  problems += found.length;
  console.log("  " + insight.slug + ": " + insight.words + " words, " + insight.minutes + " min, " + insight.sources.length + " sources, " + insight.status + (found.length ? " — " + found.length + " problem(s)" : ""));
}
if (problems) { console.error("verify:insights failed with " + problems + " problem(s)."); process.exit(1); }
console.log("verify:insights passed: " + insights.length + " article(s).");
`;

const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", program],
  { cwd: ROOT, stdio: "inherit" },
);
process.exit(result.status ?? 1);
