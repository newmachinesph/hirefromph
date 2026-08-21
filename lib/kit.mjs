/**
 * The educator kit's build contract — the one place that knows which PDFs
 * exist, which JSON they are rendered from, and how the content hash is
 * computed. Shared by the app (through lib/educators.ts) and by both kit
 * scripts, so the gate can never drift from the page.
 *
 * SERVER / SCRIPT ONLY: this module imports node:crypto and node:fs. Never
 * import it, or lib/educators.ts, from a "use client" component.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root, resolved from this file so a script can run from any cwd. */
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The JSON the kit renders. `pick` narrows a file to one key, so unrelated
 * edits (nav labels, stats) do not invalidate seven PDFs.
 * @type {{ key: string, file: string, pick?: string }[]}
 */
export const KIT_SOURCES = [
  { key: "doctrine", file: "data/doctrine.json" },
  { key: "educators", file: "data/educators.json" },
  { key: "roadmap", file: "data/roadmap.json" },
  { key: "stages", file: "data/stages.json" },
  { key: "standard", file: "data/site.json", pick: "standard" },
];

/**
 * The seven PDFs. `route` is what Playwright renders, `slug` is the file name
 * under public/kit/, `pages` is the sheet count the route must produce, and
 * `landscape` is the fallback page box for when preferCSSPageSize is ignored.
 *
 * `title` and `blurb` are page furniture for the /educators contents grid;
 * Phase 8 owns the final wording. The three run-sheets carry `title: null`
 * because their name comes from data/educators.json. Everything else printed
 * on a kit sheet is read from JSON — see BUILD_GUIDE.md.
 * @type {{ slug: string, route: string, landscape: boolean, pages: number,
 *          format: string, title: string | null, blurb: string,
 *          sessionId: string | null }[]}
 */
export const KIT_FILES = [
  {
    slug: "hirefromph-doctrine-one-pager",
    route: "/educators/kit/one-pager",
    landscape: false,
    pages: 1,
    format: "A4 portrait · 1 page",
    title: "The doctrine, one page",
    blurb: "The standard, the creed, and the six principles behind every page on this site.",
    sessionId: null,
  },
  {
    slug: "hirefromph-path-map",
    route: "/educators/kit/path-map",
    landscape: true,
    pages: 1,
    format: "A4 landscape · 1 page",
    title: "The path, mapped",
    blurb: "Five stages and eleven steps on one sheet, with what each stage asks of a learner.",
    sessionId: null,
  },
  {
    slug: "hirefromph-seven-methods",
    route: "/educators/kit/methods",
    landscape: false,
    pages: 2,
    format: "A4 portrait · 2 pages",
    title: "Seven methods",
    blurb: "FIND through GIVE, each with its steps and the drill a participant runs alone.",
    sessionId: null,
  },
  {
    slug: "hirefromph-session-deconstruct-resume",
    route: "/educators/kit/session/deconstruct-resume",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "deconstruct-resume",
  },
  {
    slug: "hirefromph-session-vet-opportunity",
    route: "/educators/kit/session/vet-opportunity",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "vet-opportunity",
  },
  {
    slug: "hirefromph-session-ask-well",
    route: "/educators/kit/session/ask-well",
    landscape: false,
    pages: 4,
    format: "A4 portrait · 4 pages",
    title: null,
    blurb: "Run-sheet: timed steps, discussion prompts, and the mistakes that flatten this room.",
    sessionId: "ask-well",
  },
  {
    slug: "hirefromph-slides",
    route: "/educators/kit/slides",
    landscape: true,
    pages: 16,
    format: "16:9 · 16 slides",
    title: "The slides",
    blurb: "Sixteen slides covering the doctrine, the path, the seven methods, and the licence.",
    sessionId: null,
  },
];

/**
 * Deterministic JSON: object keys sorted, array order kept, whitespace gone.
 * Sorting means a bundler that re-orders a JSON object's keys can never move
 * the hash, so the app side and the disk side always agree.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = /** @type {Record<string, unknown>} */ (value);
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

/**
 * sha256 (hex) of the canonical form of the kit's five sources.
 * @param {unknown} payload
 * @returns {string}
 */
export function hashKitPayload(payload) {
  return createHash("sha256").update(canonicalJson(payload), "utf8").digest("hex");
}

/**
 * Read the five sources straight off disk. Used by the two scripts and by the
 * unit test that pins the app-side hash to this one.
 * @param {string} [root]
 * @returns {Record<string, unknown>}
 */
export function readKitPayload(root = REPO_ROOT) {
  /** @type {Record<string, unknown>} */
  const payload = {};
  for (const source of KIT_SOURCES) {
    const parsed = JSON.parse(readFileSync(join(root, source.file), "utf8"));
    payload[source.key] = source.pick ? parsed[source.pick] : parsed;
  }
  return payload;
}
