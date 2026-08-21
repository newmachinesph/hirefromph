/**
 * Static internal-link audit. No dev server, no network: it derives the route
 * set from app/**\/page.* and the asset set from public/**, then checks every
 * internal href/url/redirectTo it can find in app/, components/, data/, lib/.
 *
 * Sources covered: data/site.json (nav, navGroups, cta), data/library.json,
 * every other data/*.json, JSX href/src attributes, object literals, and
 * router.push()/redirect() string arguments.
 *
 * A link object carrying `"pending": true` is authored in the information
 * architecture but its route ships in a later phase, so the whole object is
 * skipped and counted. See lib/nav.ts for the convention.
 *
 * Run: npm run verify:links (part of npm run verify:all)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_DIR = path.join(ROOT, "app");
const SOURCE_DIRS = ["app", "components", "data", "lib"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".json"]);
const PAGE_FILE = /^page\.(?:js|jsx|ts|tsx)$/;

/** Links skipped because their route ships in a later phase. */
let pendingLinks = 0;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function lineAt(source, offset) {
  return source.slice(0, offset).split(/\r?\n/).length;
}

function normalizePathname(value) {
  const pathname = new URL(value, "https://link-audit.local").pathname;
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function routeForPage(file) {
  const segments = path
    .relative(APP_DIR, path.dirname(file))
    .split(path.sep)
    .filter((segment) => segment && !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));

  return segments.length ? `/${segments.join("/")}` : "/";
}

function extractJsonReferences(file, source) {
  const references = [];
  const navigationKeys = new Set(["href", "url", "tool", "redirectTo"]);

  function visit(value, key = "", pointer = "$") {
    if (typeof value === "string") {
      if (navigationKeys.has(key) && (value.startsWith("/") || value.startsWith("#"))) {
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = new RegExp(`"${escaped}"`).exec(source);
        references.push({
          value,
          file,
          line: match ? lineAt(source, match.index) : 1,
          context: pointer,
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, "", `${pointer}[${index}]`));
      return;
    }

    if (value && typeof value === "object") {
      // Authored in the IA, route ships in a later phase — skip the subtree.
      if (value.pending === true) {
        pendingLinks += 1;
        return;
      }

      Object.entries(value).forEach(([childKey, child]) =>
        visit(child, childKey, `${pointer}.${childKey}`),
      );
    }
  }

  visit(JSON.parse(source));
  return references;
}

function extractCodeReferences(file, source) {
  const references = [];
  const patterns = [
    /\b(?:href|src|redirectTo|start_url|scope)\s*=\s*["']([^"']+)["']/g,
    /\b(?:href|src|redirectTo|start_url|scope)\s*:\s*["']([^"']+)["']/g,
    /\b(?:router\.(?:push|replace)|redirect|permanentRedirect)\(\s*["']([^"']+)["']/g,
    /\b(?:navigator\.)?serviceWorker\.register\(\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1];
      if (!value.startsWith("/") && !value.startsWith("#")) continue;
      references.push({ value, file, line: lineAt(source, match.index), context: "code" });
    }
  }

  // Linkify turns these literal paths into anchors at render time.
  const knownRoutes = /const\s+KNOWN_ROUTES\s*=\s*\[([\s\S]*?)\]/.exec(source);
  if (knownRoutes) {
    for (const match of knownRoutes[1].matchAll(/["'](\/[^"']+)["']/g)) {
      references.push({
        value: match[1],
        file,
        line: lineAt(source, knownRoutes.index + match.index),
        context: "KNOWN_ROUTES",
      });
    }
  }

  return references;
}

const pageFiles = walk(APP_DIR).filter((file) => PAGE_FILE.test(path.basename(file)));
const routes = new Set(pageFiles.map(routeForPage));

const publicAssets = new Set(
  walk(path.join(ROOT, "public")).map((file) => `/${relative(file).replace(/^public\//, "")}`),
);

for (const file of walk(APP_DIR)) {
  if (path.dirname(file) !== APP_DIR) continue;
  if (/\.(?:ico|svg|png|jpg|jpeg|webp)$/i.test(file)) {
    publicAssets.add(`/${path.basename(file)}`);
  }
}

const sourceFiles = SOURCE_DIRS.flatMap((directory) => walk(path.join(ROOT, directory))).filter(
  (file) => SOURCE_EXTENSIONS.has(path.extname(file)),
);

const references = sourceFiles.flatMap((file) => {
  const source = fs.readFileSync(file, "utf8");
  return path.extname(file) === ".json"
    ? extractJsonReferences(file, source)
    : extractCodeReferences(file, source);
});

const idsByFile = new Map();
for (const file of sourceFiles.filter((candidate) => /\.[jt]sx$/.test(candidate))) {
  const source = fs.readFileSync(file, "utf8");
  idsByFile.set(file, new Set([...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])));
}

const problems = [];
let intentionalPlaceholders = 0;

for (const reference of references) {
  if (reference.value === "#") {
    const isTaskChoicePlaceholder =
      relative(reference.file) === "data/tasks.json" && reference.context.endsWith(".url");

    if (isTaskChoicePlaceholder) {
      intentionalPlaceholders += 1;
      continue;
    }

    problems.push({ ...reference, reason: "placeholder # link is not allowed here" });
    continue;
  }

  if (reference.value.startsWith("#")) {
    const id = reference.value.slice(1);
    if (!idsByFile.get(reference.file)?.has(id)) {
      problems.push({ ...reference, reason: `missing #${id} target in the same file` });
    }
    continue;
  }

  const pathname = normalizePathname(reference.value);
  if (!routes.has(pathname) && !publicAssets.has(pathname)) {
    problems.push({ ...reference, reason: `no page or public asset for ${pathname}` });
  }
}

if (problems.length) {
  console.error(`Link audit failed with ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const problem of problems) {
    console.error(
      `- ${relative(problem.file)}:${problem.line} ${problem.value} (${problem.reason}; ${problem.context})`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(
    `Link audit passed: ${routes.size} routes, ${references.length} internal references, ` +
      `${publicAssets.size} public assets, ${intentionalPlaceholders} intentional placeholders, ` +
      `${pendingLinks} links pending a later phase.`,
  );
}
