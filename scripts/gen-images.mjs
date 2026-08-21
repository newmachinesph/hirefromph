#!/usr/bin/env node
// Resumable photoreal image generation for the redesign.
//
// Reads design/images/shotlist.json and, for every entry without a
// design/images/raw/<id>.png, calls the gpt-image-bridge wrapper
// (~/.claude/skills/gpt-image-bridge/bin/gpt-image-2) through bash.
//
//   node scripts/gen-images.mjs                 # generate everything missing
//   node scripts/gen-images.mjs --only a,b      # restrict to these ids
//   node scripts/gen-images.mjs --dry-run       # print what would run
//
// Each call takes 4-6 minutes and consumes ChatGPT quota. Two run at a time.
// Per-image output goes to design/images/raw/<id>.log. Exits 1 if any failed.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTLIST = path.join(ROOT, "design", "images", "shotlist.json");
const RAW_DIR = path.join(ROOT, "design", "images", "raw");
const BRIDGE = path.join(os.homedir(), ".claude", "skills", "gpt-image-bridge", "bin", "gpt-image-2");
const TIMEOUT_MS = 660_000;
const CONCURRENCY = 2;
const IS_WINDOWS = process.platform === "win32";

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

// Git Bash, not WSL's System32 bash.exe, must run the wrapper on Windows.
function resolveBash() {
  if (!IS_WINDOWS) return "bash";
  const candidates = [
    path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Git", "bin", "bash.exe"),
    path.join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? "bash";
}

// Git Bash accepts C:/style paths; backslashes get mangled by the MSYS layer.
function bashPath(p) {
  return IS_WINDOWS ? p.replaceAll("\\", "/") : p;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, "/");
}

function killTree(child) {
  if (IS_WINDOWS) {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGKILL");
  }
}

function generate(entry, bash) {
  const outPath = path.join(RAW_DIR, `${entry.id}.png`);
  const logPath = path.join(RAW_DIR, `${entry.id}.log`);
  const args = [bashPath(BRIDGE), entry.prompt, bashPath(outPath), "--size", entry.size];

  return new Promise((resolve) => {
    const started = Date.now();
    const logFd = fs.openSync(logPath, "w");
    const child = spawn(bash, args, { stdio: ["ignore", logFd, logFd], windowsHide: true });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, TIMEOUT_MS);

    const finish = (status, detail) => {
      clearTimeout(timer);
      fs.closeSync(logFd);
      const seconds = Math.round((Date.now() - started) / 1000);
      resolve({ id: entry.id, status, detail, seconds, outPath, logPath });
    };

    child.on("error", (err) => finish("fail", `spawn error: ${err.message}`));
    child.on("close", (code) => {
      if (timedOut) return finish("fail", `timed out after ${TIMEOUT_MS / 1000}s`);
      if (code !== 0) return finish("fail", `exit ${code}`);
      if (!fs.existsSync(outPath)) return finish("fail", "exit 0 but no PNG written");
      return finish("ok", "");
    });
  });
}

function report(result) {
  const tag = `[${result.status}]`.padEnd(7);
  if (result.status === "ok") {
    console.log(`${tag} ${result.id} (${result.seconds}s) -> ${rel(result.outPath)}`);
  } else {
    console.log(`${tag} ${result.id} (${result.seconds}s) ${result.detail}; see ${rel(result.logPath)}`);
  }
}

async function runPool(entries, worker) {
  const queue = [...entries];
  const results = [];
  const lanes = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      const result = await worker(entry);
      report(result);
      results.push(result);
    }
  });
  await Promise.all(lanes);
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const shotlist = JSON.parse(fs.readFileSync(SHOTLIST, "utf8"));

  if (args.only) {
    const known = new Set(shotlist.map((e) => e.id));
    const unknown = [...args.only].filter((id) => !known.has(id));
    if (unknown.length > 0) throw new Error(`unknown ids in --only: ${unknown.join(", ")}`);
  }

  fs.mkdirSync(RAW_DIR, { recursive: true });

  const pending = [];
  for (const entry of shotlist) {
    if (args.only && !args.only.has(entry.id)) continue;
    const outPath = path.join(RAW_DIR, `${entry.id}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`[skip]  ${entry.id} exists -> ${rel(outPath)}`);
      continue;
    }
    pending.push(entry);
  }

  if (pending.length === 0) {
    console.log("Nothing to generate.");
    return;
  }

  if (args.dryRun) {
    for (const entry of pending) {
      console.log(`[dry]   ${entry.id} size=${entry.size} -> ${rel(path.join(RAW_DIR, `${entry.id}.png`))}`);
    }
    return;
  }

  if (!fs.existsSync(BRIDGE)) throw new Error(`bridge not found: ${BRIDGE}`);

  const bash = resolveBash();
  console.log(`Generating ${pending.length} image(s), concurrency ${CONCURRENCY}, via ${bash}`);

  const results = await runPool(pending, (entry) => generate(entry, bash));
  const failed = results.filter((r) => r.status !== "ok");
  console.log(`Done: ${results.length - failed.length} ok, ${failed.length} failed.`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`gen-images: ${err.message}`);
  process.exitCode = 1;
});
