#!/usr/bin/env node
/**
 * kit:icons — turn the generated method icons into transparent PNGs.
 *
 * Reads design/images/raw/icons/<method>.png (navy line art on a white
 * ground, straight from the image model), lifts the white to alpha, trims the
 * margin, pads back to a square and writes public/images/deck/icons/<method>.png
 * at 512×512. Idempotent; skips ids without a raw file and says so.
 *
 *   node scripts/deck-icons.mjs            # all seven
 *   node scripts/deck-icons.mjs --only find,ask
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "design", "images", "raw", "icons");
const OUT_DIR = path.join(ROOT, "public", "images", "deck", "icons");
const ICONS = ["find", "deconstruct", "learn", "vet", "ask", "unstick", "give"];
const SIZE = 512;
/** Pixels this close to white become fully transparent; darker pixels keep alpha by darkness. */
const WHITE_CUTOFF = 235;
const NAVY = { r: 14, g: 18, b: 48 };

function wanted() {
  const only = process.argv.find((arg) => arg.startsWith("--only"));
  if (!only) return ICONS;
  const list = (only.includes("=") ? only.split("=")[1] : process.argv[process.argv.indexOf(only) + 1]) ?? "";
  return list.split(",").map((s) => s.trim()).filter((id) => ICONS.includes(id));
}

async function convert(id) {
  const src = path.join(RAW_DIR, `${id}.png`);
  if (!fs.existsSync(src)) {
    console.log(`  skip ${id}: no raw file`);
    return false;
  }
  const { data, info } = await sharp(src).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Darkness → alpha, so anti-aliased edges fade instead of haloing.
    const alpha = lum >= WHITE_CUTOFF ? 0 : Math.min(255, Math.round(((WHITE_CUTOFF - lum) / WHITE_CUTOFF) * 255 * 1.15));
    out[j] = NAVY.r;
    out[j + 1] = NAVY.g;
    out[j + 2] = NAVY.b;
    out[j + 3] = alpha;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 10 })
    .resize(SIZE - 64, SIZE - 64, { fit: "inside" })
    .extend({ top: 32, bottom: 32, left: 32, right: 32, background: transparent })
    .resize(SIZE, SIZE, { fit: "contain", background: transparent })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${id}.png`));
  console.log(`  ${id}.png`);
  return true;
}

let done = 0;
for (const id of wanted()) if (await convert(id)) done += 1;
console.log(`kit:icons wrote ${done} icon(s) to public/images/deck/icons/`);
