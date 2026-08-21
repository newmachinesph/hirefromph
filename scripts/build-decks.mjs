#!/usr/bin/env node
/**
 * kit:decks — render every deck to public/kit/decks/: a PDF, an editable
 * PPTX and a presenter (image) PPTX, plus manifest.json with a content hash.
 *
 *   npm run build && npm run kit:decks
 *
 * Same contract as scripts/build-kit-pdf.mjs: needs a production build (or
 * KIT_BUILD_BASE_URL pointing at a running server), starts `next start` on a
 * free port, exits 1 on any problem. For each deck:
 *
 *   1. /educators/deck/<id>/print → page.pdf at 1920×1080 per page
 *   2. each [data-slide] → 1920×1080 PNG → presenter PPTX (pptxgenjs)
 *   3. each [data-diagram] → PNG, then the JSON → editable PPTX
 *
 * The content hash is sha256 over the canonical JSON of data/decks/*.json,
 * so scripts/verify-kit.mjs can tell when the exports are stale.
 */
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { REPO_ROOT, canonicalJson } from "../lib/kit.mjs";
import { buildEditableDeck, buildPresenterDeck } from "./deck-pptx.mjs";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs");

const DECKS_DIR = join(REPO_ROOT, "data", "decks");
const OUT_DIR = join(REPO_ROOT, "public", "kit", "decks");
const PUBLIC = join(REPO_ROOT, "public");
const NEXT_BIN = join(REPO_ROOT, "node_modules", "next", "dist", "bin", "next");
const BASE_URL_OVERRIDE = process.env.KIT_BUILD_BASE_URL?.replace(/\/+$/, "");
const PHOTOS = ["deck-title", "deck-why", "deck-path", "deck-methods", "deck-close"];
const ICONS = ["find", "deconstruct", "learn", "vet", "ask", "unstick", "give"];

function fail(message) {
  console.error(`kit:decks failed — ${message}`);
  process.exit(1);
}

export function readDecks() {
  return readdirSync(DECKS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(DECKS_DIR, name), "utf8")));
}

export function hashDecks(decks) {
  return createHash("sha256").update(canonicalJson(decks)).digest("hex");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(base, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(2_000) });
      if (response.status < 500) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`next start did not answer on ${base} within ${timeoutMs}ms`);
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

function existingAssets(ids, dir, ext) {
  return Object.fromEntries(
    ids.map((id) => [id, join(dir, `${id}.${ext}`)]).filter(([, file]) => existsSync(file)),
  );
}

async function main() {
  const decks = readDecks();
  if (decks.length === 0) fail("no decks in data/decks/");
  const attribution = JSON.parse(readFileSync(join(REPO_ROOT, "data", "educators.json"), "utf8")).license.attribution;

  let server;
  let base;
  if (BASE_URL_OVERRIDE) {
    base = BASE_URL_OVERRIDE;
  } else {
    if (!existsSync(join(REPO_ROOT, ".next", "BUILD_ID"))) fail("no production build found. Run `npm run build` first.");
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, [NEXT_BIN, "start", "--port", String(port)], {
      cwd: REPO_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
  let serverLog = "";
  server?.stdout.on("data", (chunk) => (serverLog += chunk));
  server?.stderr.on("data", (chunk) => (serverLog += chunk));

  const scratch = mkdtempSync(join(tmpdir(), "hfph-decks-"));
  const problems = [];
  const built = [];
  let browser;

  try {
    await waitForServer(base);
    try {
      browser = await chromium.launch();
    } catch (error) {
      throw new Error(`could not launch Chromium (${error.message}). Run \`npx playwright install chromium\` once per machine.`);
    }
    mkdirSync(OUT_DIR, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const photos = existingAssets(PHOTOS, join(PUBLIC, "images"), "jpg");
    const icons = existingAssets(ICONS, join(PUBLIC, "images", "deck", "icons"), "png");

    for (const deck of decks) {
      const url = `${base}/educators/deck/${deck.id}/print`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) {
        problems.push(`${deck.id}: ${url} returned ${response ? response.status() : "no response"}`);
        continue;
      }
      await page.evaluate(() => document.fonts.ready);

      const slides = await page.$$("[data-slide]");
      if (slides.length !== deck.slides.length) {
        problems.push(`${deck.id}: rendered ${slides.length} slide(s); JSON has ${deck.slides.length}`);
        continue;
      }

      // A slide's content must stay inside its stage; overflow:hidden would crop it silently.
      const spills = await page.$$eval("[data-slide] .deck-pad", (nodes) =>
        nodes
          .map((node, i) => ({ n: i + 1, spill: node.scrollHeight - node.clientHeight }))
          .filter((s) => s.spill > 2),
      );
      for (const spill of spills) problems.push(`${deck.id}: slide ${spill.n} overflows its stage by ${spill.spill}px`);

      // 1. PDF
      await page.emulateMedia({ media: "print" });
      const pdf = await page.pdf({ width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
      await page.emulateMedia({ media: null });
      writeFileSync(join(OUT_DIR, `${deck.id}.pdf`), pdf);

      // 2. Screenshots → presenter PPTX
      const shots = {};
      for (let i = 0; i < slides.length; i += 1) {
        const id = deck.slides[i].id;
        const file = join(scratch, `${deck.id}-${id}.jpg`);
        await slides[i].screenshot({ path: file, type: "jpeg", quality: 88 });
        shots[id] = file;
      }
      await buildPresenterDeck(new PptxGenJS(), deck, shots).writeFile({
        fileName: join(OUT_DIR, `${deck.id}-presenter.pptx`),
      });

      // 3. Diagram rasters → editable PPTX
      const diagrams = {};
      for (let i = 0; i < slides.length; i += 1) {
        const node = await slides[i].$("[data-diagram]");
        if (!node) continue;
        const file = join(scratch, `${deck.id}-${deck.slides[i].id}-diagram.png`);
        await node.screenshot({ path: file, type: "png" });
        diagrams[deck.slides[i].id] = file;
      }
      await buildEditableDeck(new PptxGenJS(), deck, { photos, icons, diagrams, attribution }).writeFile({
        fileName: join(OUT_DIR, `${deck.id}.pptx`),
      });

      built.push({
        id: deck.id,
        title: deck.title,
        slides: deck.slides.length,
        files: {
          pdf: `kit/decks/${deck.id}.pdf`,
          pptx: `kit/decks/${deck.id}.pptx`,
          presenter: `kit/decks/${deck.id}-presenter.pptx`,
        },
        bytes: { pdf: pdf.byteLength },
      });
      console.log(`  ${deck.id}: ${deck.slides.length} slides → pdf, pptx, presenter pptx`);
    }
  } catch (error) {
    stopServer(server);
    if (browser) await browser.close();
    console.error(serverLog.trim().slice(-2000));
    rmSync(scratch, { recursive: true, force: true });
    fail(error.message);
  }

  if (browser) await browser.close();
  stopServer(server);
  rmSync(scratch, { recursive: true, force: true });

  if (problems.length) {
    for (const problem of problems) console.error(`- ${problem}`);
    fail(`${problems.length} deck problem(s).`);
  }

  const manifest = { hash: hashDecks(decks), builtAt: new Date().toISOString().slice(0, 10), decks: built };
  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`kit:decks wrote ${built.length} deck(s) to public/kit/decks/ at hash ${manifest.hash.slice(0, 12)}…`);
}

const isEntry = process.argv[1] && basename(fileURLToPath(import.meta.url)) === basename(process.argv[1]);
if (isEntry) main().catch((error) => fail(error.message));
