#!/usr/bin/env node
/**
 * verify:primitives — spec §5.7.
 *
 * Warns when a page re-implements something `components/ui` or
 * `components/layout` already owns. Warn-only through Phase 4; Phase 5 adds
 * `--strict` to the npm script so violations fail the build.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const EXEMPT = [join("components", "ui"), join("components", "layout")];
const EXTENSIONS = [".ts", ".tsx"];
const STRICT = process.argv.includes("--strict");

const RULES = [
  {
    id: "accent-map",
    re: /const\s+accent(Text|Bar|Soft|Border)\b/g,
    message: 'inline accent map — import ACCENT/accent from "@/lib/accent"',
    appOnly: false,
  },
  {
    id: "radius",
    re: /\brounded-(xl|2xl|3xl)\b/g,
    message: "legacy radius — use rounded-sm | rounded-md | rounded-lg | rounded-pill",
    appOnly: false,
  },
  {
    id: "blur",
    re: /\bblur-(2xl|3xl)\b/g,
    message: "decorative blur blob — delete it (spec §9)",
    appOnly: false,
  },
  {
    id: "lucide",
    re: /from\s+["']lucide-react["']/g,
    message: 'lucide-react — use <Icon name="…"> from "@/components/ui"',
    appOnly: false,
  },
  {
    id: "lift",
    re: /hover:-translate-y/g,
    message: "hover lift — cards change border and background only",
    appOnly: false,
  },
  {
    id: "raw-card",
    re: /border\s+border-line\s+bg-paper/g,
    message: "raw card pattern — use <Card>",
    appOnly: true,
  },
];

const CONTROL_RE = /<(input|select|textarea)\b/g;
const UI_IMPORT_RE = /from\s+["']@\/components\/ui(\/[\w-]+)?["']/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function positionOf(source, index) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const col = index - before.lastIndexOf("\n");
  return { line, col };
}

const findings = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    if (EXEMPT.some((prefix) => rel.startsWith(prefix + sep))) continue;

    const source = readFileSync(file, "utf8");
    const inApp = rel.startsWith("app" + sep);

    for (const rule of RULES) {
      if (rule.appOnly && !inApp) continue;
      rule.re.lastIndex = 0;
      let match;
      while ((match = rule.re.exec(source)) !== null) {
        const { line, col } = positionOf(source, match.index);
        findings.push({ rel, line, col, id: rule.id, message: rule.message });
      }
    }

    if (!UI_IMPORT_RE.test(source)) {
      CONTROL_RE.lastIndex = 0;
      let match;
      while ((match = CONTROL_RE.exec(source)) !== null) {
        const { line, col } = positionOf(source, match.index);
        findings.push({
          rel,
          line,
          col,
          id: "raw-control",
          message: `<${match[1]}> without a components/ui import — use Input | Select | Textarea`,
        });
      }
    }
  }
}

findings.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line);

for (const f of findings) {
  console.log(`${f.rel}:${f.line}:${f.col}  [${f.id}]  ${f.message}`);
}

const label = STRICT ? "verify:primitives" : "verify:primitives (warn-only)";
if (findings.length === 0) {
  console.log(`${label}: clean.`);
  process.exit(0);
}

const byRule = findings.reduce((acc, f) => {
  acc[f.id] = (acc[f.id] ?? 0) + 1;
  return acc;
}, {});
console.log(
  `\n${label}: ${findings.length} violation(s) — ` +
    Object.entries(byRule)
      .map(([id, n]) => `${id} ${n}`)
      .join(", "),
);
process.exit(STRICT ? 1 : 0);
