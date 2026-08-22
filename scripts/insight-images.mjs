#!/usr/bin/env node
/**
 * insights:images — place generated photographs into an article's asset folder.
 *
 *   node scripts/insight-images.mjs <slug> <rawId>=<name> [<rawId>=<name> …]
 *   node scripts/insight-images.mjs beyond-the-call-center-human-intelligence-outsourcing insight-hio-hero=hero insight-hio-expert=evaluator
 *
 * Reads design/images/raw/<rawId>.png (straight from the image model),
 * centre-crops to 16:9, resizes to 1536×864 and writes
 * public/insights/<slug>/<name>.jpg (mozjpeg, progressive) and <name>.webp.
 * The article folder is the only place the files go: nothing touches
 * public/images/ or data/visuals.json, so an article stays self-contained
 * and can move to object storage later with its relative names intact.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "design", "images", "raw");
const WIDTH = 1536;
const HEIGHT = 864;

const [slug, ...pairs] = process.argv.slice(2);
if (!slug || pairs.length === 0) {
  console.error("usage: node scripts/insight-images.mjs <slug> <rawId>=<name> [...]");
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`slug "${slug}" is not kebab-case`);
  process.exit(1);
}

const outDir = path.join(ROOT, "public", "insights", slug);
fs.mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const pair of pairs) {
  const [rawId, name] = pair.split("=");
  const src = path.join(RAW_DIR, `${rawId}.png`);
  if (!rawId || !name || !fs.existsSync(src)) {
    console.error(`  skip ${pair}: no raw file at design/images/raw/${rawId}.png`);
    failed += 1;
    continue;
  }
  const base = sharp(src).resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" });
  await base.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(path.join(outDir, `${name}.jpg`));
  await base.clone().webp({ quality: 80 }).toFile(path.join(outDir, `${name}.webp`));
  const kb = Math.round(fs.statSync(path.join(outDir, `${name}.jpg`)).size / 1024);
  console.log(`  ${name}.jpg (${kb} KB) + ${name}.webp → public/insights/${slug}/`);
}
if (failed) process.exit(1);
