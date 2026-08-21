#!/usr/bin/env node
/**
 * kit:build — render every /educators/kit/* route to a PDF in public/kit/.
 *
 *   npm run build && npm run kit:build
 *
 * Why a production server and not `next dev`: dev renders through a different
 * pipeline (no font optimisation, no static generation) and the PDFs would not
 * match what visitors print. The script refuses to run without a build.
 *
 * Why the manifest: page.pdf() gives no hook for the PDF Info dictionary or an
 * XMP packet, so Playwright cannot stamp the content hash inside the file. It
 * is written to public/kit/manifest.json beside the PDFs, and scripts/
 * verify-kit.mjs compares it against a freshly computed hash.
 *
 * Exits 1 on: no build, a server that will not answer, a missing Chromium, a
 * sheet whose content overflows its paper box, a sheet count that disagrees
 * with lib/kit.mjs, or any write error.
 *
 * KIT_BUILD_BASE_URL: escape hatch for local iteration and CI environments
 * where a full `next build` + `next start` cycle is not available (e.g. a
 * shared working tree with another `next build` already holding the .next
 * lock). When set, the script skips the BUILD_ID check and its own `next
 * start` child, and renders against the given base URL instead (a `next
 * dev` or `next start` already running). Unset, behaviour is exactly as
 * described above.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { chromium } from "playwright";
import { KIT_FILES, REPO_ROOT, hashKitPayload, readKitPayload } from "../lib/kit.mjs";

const OUT_DIR = join(REPO_ROOT, "public", "kit");
const NEXT_BIN = join(REPO_ROOT, "node_modules", "next", "dist", "bin", "next");
const BASE_URL_OVERRIDE = process.env.KIT_BUILD_BASE_URL?.replace(/\/+$/, "");

function fail(message) {
  console.error(`kit:build failed — ${message}`);
  process.exit(1);
}

/** Ask the OS for a port nobody is using, then hand it straight to Next. */
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

/** child.kill() does not reap the tree on Windows; taskkill does. */
function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

async function main() {
  let server;
  let base;

  if (BASE_URL_OVERRIDE) {
    base = BASE_URL_OVERRIDE;
  } else {
    if (!existsSync(join(REPO_ROOT, ".next", "BUILD_ID"))) {
      fail("no production build found. Run `npm run build` first.");
    }

    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, [NEXT_BIN, "start", "--port", String(port)], {
      cwd: REPO_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  let serverLog = "";
  if (server) {
    server.stdout.on("data", (chunk) => {
      serverLog += chunk;
    });
    server.stderr.on("data", (chunk) => {
      serverLog += chunk;
    });
  }

  let browser;
  const problems = [];
  const files = [];

  try {
    await waitForServer(base);

    try {
      browser = await chromium.launch();
    } catch (error) {
      throw new Error(
        `could not launch Chromium (${error.message}). Run \`npx playwright install chromium\` once per machine.`,
      );
    }

    mkdirSync(OUT_DIR, { recursive: true });
    const page = await browser.newPage();

    for (const file of KIT_FILES) {
      const url = `${base}${file.route}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) {
        problems.push(`${file.route} returned ${response ? response.status() : "no response"}`);
        continue;
      }

      // Measure the sheets the way they will print, not the way they look.
      await page.emulateMedia({ media: "print" });

      const sheets = await page.$$eval(".kit-page", (nodes) =>
        nodes.map((node, index) => ({
          n: index + 1,
          overflow: node.scrollHeight - node.clientHeight,
        })),
      );

      if (sheets.length !== file.pages) {
        problems.push(
          `${file.route} rendered ${sheets.length} sheet(s); lib/kit.mjs expects ${file.pages}`,
        );
      }

      // .kit-page is overflow:hidden, so a spill would print as a silent crop.
      for (const sheet of sheets.filter((s) => s.overflow > 2)) {
        problems.push(
          `${file.route} sheet ${sheet.n} overflows its paper box by ${sheet.overflow}px — shorten the sheet or raise its page count`,
        );
      }

      const buffer = await page.pdf({
        // preferCSSPageSize wins; format/landscape are the fallback box.
        format: "A4",
        landscape: file.landscape,
        printBackground: true,
        preferCSSPageSize: true,
      });

      const target = join(OUT_DIR, `${file.slug}.pdf`);
      writeFileSync(target, buffer);
      files.push({
        slug: file.slug,
        file: `kit/${file.slug}.pdf`,
        route: file.route,
        pages: file.pages,
        bytes: buffer.byteLength,
      });
      console.log(`  ${file.slug}.pdf — ${sheets.length} sheet(s), ${buffer.byteLength} bytes`);

      await page.emulateMedia({ media: null });
    }
  } catch (error) {
    stopServer(server);
    if (browser) await browser.close();
    console.error(serverLog.trim().slice(-2000));
    fail(error.message);
  }

  if (browser) await browser.close();
  stopServer(server);

  if (problems.length) {
    for (const problem of problems) console.error(`- ${problem}`);
    fail(`${problems.length} sheet problem(s).`);
  }

  const manifest = {
    hash: hashKitPayload(readKitPayload(REPO_ROOT)),
    builtAt: new Date().toISOString().slice(0, 10),
    files,
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `kit:build wrote ${files.length} PDF(s) to public/kit/ at hash ${manifest.hash.slice(0, 12)}…`,
  );
}

main().catch((error) => fail(error.message));
