#!/usr/bin/env node
// Optimises the photoreal raw renders into committed web assets.
//
// Reads design/images/shotlist.json and, for every entry with a
// design/images/raw/<id>.png, centre-crops to the entry's `ratio`, resizes
// down to a max long edge (never upscaling past the source), and writes
// public/images/<id>.jpg (mozjpeg, progressive) and public/images/<id>.webp.
// Then writes data/visuals.json, the manifest `Figure` reads.
//
//   node scripts/optimize-images.mjs                 # process everything with a raw PNG
//   node scripts/optimize-images.mjs --only a,b       # restrict to these ids
//   node scripts/optimize-images.mjs --dry-run        # print the plan, write nothing
//
// Idempotent: re-running overwrites public/images/<id>.{jpg,webp} and rebuilds
// the manifest. `--only` limits which ids are re-encoded this run, but the
// manifest is still rebuilt from every id that has an existing output (or is
// processed this run), so a partial rerun does not drop the other entries.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTLIST = path.join(ROOT, "design", "images", "shotlist.json");
const RAW_DIR = path.join(ROOT, "design", "images", "raw");
const OUT_DIR = path.join(ROOT, "public", "images");
const MANIFEST_PATH = path.join(ROOT, "data", "visuals.json");

const PORTRAIT_MAX_LONG_EDGE = 1600;
const LANDSCAPE_MAX_LONG_EDGE = 2048;

const JPEG_QUALITY_START = 82;
const JPEG_QUALITY_MIN = 70;
const JPEG_QUALITY_STEP = 4;
const WEBP_QUALITY = 80;

const JPEG_BUDGET_BYTES = 260 * 1024;
const HERO_JPEG_BUDGET_BYTES = 180 * 1024;
const HERO_ID = "home-hero";

function parseArgs(argv) {
  const args = { only: null, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--only") {
      args.only = new Set((argv[i + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean));
      i += 1;
    } else if (arg.startsWith("--only=")) {
      args.only = new Set(arg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean));
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return args;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, "/");
}

// Parses "4:5", "3:2", "21:9", "3:1" as a target aspect ratio, or the
// "1200x630" og-default sentinel as an exact output size.
function parseRatio(ratio) {
  if (ratio === "1200x630") {
    return { w: 1200, h: 630, exact: true };
  }
  const match = /^(\d+):(\d+)$/.exec(ratio);
  if (!match) throw new Error(`unrecognised ratio: ${ratio}`);
  return { w: Number(match[1]), h: Number(match[2]), exact: false };
}

// Computes the output width/height for a centre-crop-to-ratio + resize.
// The crop is bounded by the source so it never enlarges the image; the
// long-edge cap only ever shrinks it further. og-default is the one
// exception: it always resizes to the exact 1200x630 OG size.
function planDimensions(ratio, srcWidth, srcHeight) {
  const { w: rw, h: rh, exact } = parseRatio(ratio);
  const aspect = rw / rh;

  let cropW;
  let cropH;
  if (srcWidth / srcHeight > aspect) {
    cropH = srcHeight;
    cropW = Math.round(srcHeight * aspect);
  } else {
    cropW = srcWidth;
    cropH = Math.round(srcWidth / aspect);
  }

  if (exact) {
    return { outW: rw, outH: rh };
  }

  const isPortrait = aspect < 1;
  const maxLongEdge = isPortrait ? PORTRAIT_MAX_LONG_EDGE : LANDSCAPE_MAX_LONG_EDGE;
  const longEdge = isPortrait ? cropH : cropW;
  const scale = Math.min(1, maxLongEdge / longEdge);

  return {
    outW: Math.round(cropW * scale),
    outH: Math.round(cropH * scale),
  };
}

function resizedPipeline(rawBuffer, outW, outH) {
  return sharp(rawBuffer).resize(outW, outH, { fit: "cover", position: "centre" });
}

// Encodes at JPEG_QUALITY_START and, if over budget, steps quality down by
// JPEG_QUALITY_STEP until under budget or JPEG_QUALITY_MIN is reached.
async function encodeJpegWithBudget(rawBuffer, outW, outH, budgetBytes) {
  let quality = JPEG_QUALITY_START;
  let buffer = await resizedPipeline(rawBuffer, outW, outH)
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();
  let lowered = false;

  while (buffer.length > budgetBytes && quality > JPEG_QUALITY_MIN) {
    quality = Math.max(JPEG_QUALITY_MIN, quality - JPEG_QUALITY_STEP);
    lowered = true;
    buffer = await resizedPipeline(rawBuffer, outW, outH)
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toBuffer();
  }

  return { buffer, quality, lowered, overBudget: buffer.length > budgetBytes };
}

async function encodeWebp(rawBuffer, outW, outH) {
  return resizedPipeline(rawBuffer, outW, outH).webp({ quality: WEBP_QUALITY }).toBuffer();
}

function fmtKB(bytes) {
  return (bytes / 1024).toFixed(1);
}

function printTable(rows) {
  const headers = ["id", "ratio", "size", "jpg KB", "webp KB", "notes"];
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join("  ");
  console.log(line(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) console.log(line(row));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const shotlist = JSON.parse(fs.readFileSync(SHOTLIST, "utf8"));

  if (args.only) {
    const known = new Set(shotlist.map((e) => e.id));
    const unknown = [...args.only].filter((id) => !known.has(id));
    if (unknown.length > 0) throw new Error(`unknown ids in --only: ${unknown.join(", ")}`);
  }

  const withRaw = shotlist.filter((entry) => fs.existsSync(path.join(RAW_DIR, `${entry.id}.png`)));
  for (const entry of shotlist) {
    if (!fs.existsSync(path.join(RAW_DIR, `${entry.id}.png`))) {
      console.log(`[skip]  ${entry.id} has no raw/${entry.id}.png yet`);
    }
  }

  const targets = args.only ? withRaw.filter((entry) => args.only.has(entry.id)) : withRaw;

  if (targets.length === 0) {
    console.log("Nothing to optimise.");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  const manifestEntries = new Map();

  for (const entry of targets) {
    const rawPath = path.join(RAW_DIR, `${entry.id}.png`);
    const rawBuffer = fs.readFileSync(rawPath);
    const meta = await sharp(rawBuffer).metadata();
    const { outW, outH } = planDimensions(entry.ratio, meta.width, meta.height);

    const jpgPath = path.join(OUT_DIR, `${entry.id}.jpg`);
    const webpPath = path.join(OUT_DIR, `${entry.id}.webp`);

    if (args.dryRun) {
      rows.push([entry.id, entry.ratio, `${outW}x${outH}`, "-", "-", "dry-run"]);
      continue;
    }

    const budgetBytes = entry.id === HERO_ID ? HERO_JPEG_BUDGET_BYTES : JPEG_BUDGET_BYTES;
    const jpeg = await encodeJpegWithBudget(rawBuffer, outW, outH, budgetBytes);
    const webpBuffer = await encodeWebp(rawBuffer, outW, outH);

    fs.writeFileSync(jpgPath, jpeg.buffer);
    fs.writeFileSync(webpPath, webpBuffer);

    const notes = [];
    if (jpeg.lowered) notes.push(`q${jpeg.quality}`);
    if (jpeg.overBudget) notes.push(`OVER BUDGET (${fmtKB(budgetBytes)}KB)`);
    rows.push([entry.id, entry.ratio, `${outW}x${outH}`, fmtKB(jpeg.buffer.length), fmtKB(webpBuffer.length), notes.join(" ") || "-"]);

    manifestEntries.set(entry.id, {
      id: entry.id,
      src: { jpg: `/images/${entry.id}.jpg`, webp: `/images/${entry.id}.webp` },
      width: outW,
      height: outH,
      alt: entry.alt,
      generated: true,
    });
  }

  printTable(rows);

  if (args.dryRun) {
    console.log("\nDry run: no files written.");
    return;
  }

  // Rebuild the full manifest: every shotlist id with a raw PNG, using this
  // run's freshly-encoded dimensions where processed, and the existing
  // public/images/<id>.jpg's dimensions for ids skipped by --only.
  for (const entry of withRaw) {
    if (manifestEntries.has(entry.id)) continue;
    const jpgPath = path.join(OUT_DIR, `${entry.id}.jpg`);
    if (!fs.existsSync(jpgPath)) {
      console.log(`[warn]  ${entry.id} has no optimised output yet; omitted from manifest (run without --only to fix)`);
      continue;
    }
    const meta = sharp(fs.readFileSync(jpgPath));
    const { width, height } = await meta.metadata();
    manifestEntries.set(entry.id, {
      id: entry.id,
      src: { jpg: `/images/${entry.id}.jpg`, webp: `/images/${entry.id}.webp` },
      width,
      height,
      alt: entry.alt,
      generated: true,
    });
  }

  const images = [...manifestEntries.values()].sort((a, b) => a.id.localeCompare(b.id));
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify({ images }, null, 2)}\n`);
  console.log(`\nWrote ${rel(MANIFEST_PATH)} with ${images.length} entr${images.length === 1 ? "y" : "ies"}.`);
}

main().catch((err) => {
  console.error(`optimize-images: ${err.message}`);
  process.exitCode = 1;
});
