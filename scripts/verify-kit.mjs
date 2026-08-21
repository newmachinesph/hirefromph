#!/usr/bin/env node
/**
 * verify:kit — are the committed PDFs still the ones this JSON produces?
 *
 * Recomputes the content hash from data/{educators,doctrine,stages,roadmap}.json
 * and data/site.json#standard, compares it with the stamp in
 * public/kit/manifest.json, and checks every published file listed in
 * lib/kit.mjs (the slide deck is `published: false` and has no PDF to check).
 *
 * Playwright cannot write PDF metadata, so the hash lives in the manifest
 * beside the files rather than inside them. Commit the two together.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PUBLISHED_KIT_FILES, REPO_ROOT, hashKitPayload, readKitPayload } from "../lib/kit.mjs";

const OUT_DIR = join(REPO_ROOT, "public", "kit");
const MANIFEST = join(OUT_DIR, "manifest.json");
const REBUILD = "Run `npm run build && npm run kit:build`, then commit public/kit/.";

const problems = [];
const notes = [];

function pdfPageCount(buffer) {
  // Uncompressed page dictionaries only; /Pages must not match.
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  return matches ? matches.length : 0;
}

function pdfBaseFonts(buffer) {
  const matches = buffer.toString("latin1").matchAll(/\/BaseFont\s*\/([#\w+.-]+)/g);
  return [...new Set([...matches].map((match) => match[1]))];
}

if (!existsSync(MANIFEST)) {
  console.error(`verify:kit failed — public/kit/manifest.json is missing. ${REBUILD}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const expected = hashKitPayload(readKitPayload(REPO_ROOT));

if (manifest.hash !== expected) {
  problems.push(
    `content hash mismatch: manifest has ${String(manifest.hash).slice(0, 12)}…, the JSON now hashes to ${expected.slice(0, 12)}…`,
  );
}

for (const file of PUBLISHED_KIT_FILES) {
  const path = join(OUT_DIR, `${file.slug}.pdf`);

  if (!existsSync(path)) {
    problems.push(`public/kit/${file.slug}.pdf is missing`);
    continue;
  }
  if (statSync(path).size === 0) {
    problems.push(`public/kit/${file.slug}.pdf is empty`);
    continue;
  }

  const buffer = readFileSync(path);
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    problems.push(`public/kit/${file.slug}.pdf has no %PDF- header`);
    continue;
  }

  const entry = (manifest.files ?? []).find((candidate) => candidate.slug === file.slug);
  if (!entry) {
    problems.push(`${file.slug} is not listed in the manifest`);
  } else if (entry.pages !== file.pages) {
    problems.push(
      `${file.slug}: manifest says ${entry.pages} page(s), lib/kit.mjs says ${file.pages}`,
    );
  }

  const pages = pdfPageCount(buffer);
  if (pages === 0) {
    notes.push(`${file.slug}: page objects are compressed; use pdfinfo to confirm ${file.pages}`);
  } else if (pages !== file.pages) {
    problems.push(`${file.slug}: PDF holds ${pages} page(s), expected ${file.pages}`);
  }

  const fonts = pdfBaseFonts(buffer);
  const subsets = fonts.filter((name) => /^[A-Z]{6}\+/.test(name));
  if (fonts.length === 0) {
    notes.push(`${file.slug}: font dictionaries are compressed; use pdffonts to confirm embedding`);
  } else if (subsets.length < 2) {
    problems.push(
      `${file.slug}: expected at least two embedded subset fonts, found ${fonts.join(", ") || "none"}`,
    );
  } else if (!subsets.some((name) => /cabinet/i.test(name)) || !subsets.some((name) => /inter/i.test(name))) {
    notes.push(`${file.slug}: embedded fonts are ${subsets.join(", ")} — record the real PostScript names if these are the display and text faces`);
  }
}

for (const note of notes) console.log(`  note: ${note}`);

if (problems.length) {
  console.error(`verify:kit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  console.error(REBUILD);
  process.exit(1);
}

console.log(
  `verify:kit passed: ${PUBLISHED_KIT_FILES.length} PDFs at hash ${expected.slice(0, 12)}… built ${manifest.builtAt}.`,
);
