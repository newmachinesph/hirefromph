# UI Overhaul — Phase 9: Verification and Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-run every phase's exit gate once on the final tree, measure every row of the spec §1 success-criteria table, capture the full §13 screenshot matrix and the Lighthouse numbers, remove the files the migration orphaned, and publish `DESIGN_REVIEW.md` v2 plus a PR description — without changing any page's design.

**Architecture:** Phase 9 adds no features. It adds three committed scripts (`scripts/shoot.mjs` for the screenshot matrix, `scripts/measure.mjs` for the success-criteria table, `knip.json` for the dead-file sweep) and one behavioural fix (the service-worker cache strategy, which currently pins non-hashed `public/` assets forever and would serve pre-redesign imagery to returning visitors). Everything else is measurement: run the gate, record the number, write it into a doc. Every measured number lands in a committed artifact under `screenshots/final/` so `DESIGN_REVIEW.md` is transcribed from files, not from memory.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first), TypeScript strict, Vitest 3 + Testing Library, `node --test`, Playwright (Chromium — a devDependency from Phase 7), Lighthouse via `npx`, knip via `npx`, Node 24, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§1 success criteria, §10 accessibility and performance, §13 testing and verification, §14 row 9, §15 documentation). This is plan 10 of 10.

**Depends on (all complete before this plan starts):**

- **Phase 0** — `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md`: tokens, fonts, `lib/accent.ts`, skip link, logo, Vitest runner.
- **Phase 1** — `…-p1-primitives.md`: `components/ui` + `components/layout` barrels, `scripts/verify-primitives.mjs`, `/dev/ui`.
- **Phase 2** — `…-p2-navigation.md`: `data/site.json.nav`, `lib/nav.ts`, `components/site/*`, `/library`, sitemap derived from the nav.
- **Phase 3** — executed as pre-work inside Phase 1 (see the Phase 1 ledger): `data/visuals.json`, `public/images/*`, `components/diagrams/*`, the `.diagram-design` marker.
- **Phase 4** — `…-p4-home-stages.md`: eight-section homepage, `StagePage`, `components/journey/*`, `/path`.
- **Phase 5** — interior migration; `Reveal` and `lucide-react` removed; `verify:primitives` switched to fail-on-violation.
- **Phase 6** — practice layer; `/practice`, `/glossary`; `lib/leitner|streak|ics|scenario`.
- **Phase 7** — educator kit; `/educators` + `app/educators/kit/*`; `scripts/build-kit-pdf.mjs`; `verify:kit`; `public/kit/*.pdf`; **Playwright becomes a devDependency here**.
- **Phase 8** — copy pass; `voice-audit` clean.

Plan files for Phases 5–8 did not exist when this plan was written (only `p0`, `p1`, `p2`, and `p4` were on disk). Phase 9 therefore never hard-codes a number those phases produce; it reads every count from the tree or from a committed artifact and records what it finds.

## Global Constraints

_Copied verbatim from `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md`. Every task's requirements implicitly include this section._

- Fonts: Inter via `next/font/google`; Cabinet Grotesk 500/700/800 self-hosted via `next/font/local` from Fontshare woff2 (ITF Free Font License). Space Grotesk, Inter Tight, Space Mono are removed.
- Palette (exact hex): paper `#FFFFFF`, band `#F7F6FF`, tint `#EEEDFF`, ink `#0E1230`, ink-soft `#4A4F66`, ink-faint `#6B7087`, line `#E4E4EA`, line-strong `#CFCFD8`, control `#858A9E`, primary `#4B4EF6`, primary-deep `#3634D8`, primary-soft `#C9C8FF`, verified `#067647` / fill `#12B76A` / tint `#E6F7EE`, caution `#9A5B00` / fill `#F5A623` / tint `#FFF4DB`, info `#026AA2` / fill `#0BA5EC` / tint `#E0F2FE`, coral `#B42318` / fill `#FF5A5F` / tint `#FFECEB`, on-navy `#F7F6FF`.
- Naming convention (deviation from the spec table, documented in BUILD_GUIDE): the bare semantic name (`--verified`) is the **text/deep** value so legacy `text-verified` usages stay AA; the vibrant shape colour is `--verified-fill`.
- Radii: sm 8px, md 12px, lg 20px, pill 999px. The global `* { border-radius: 6px !important }` rule and `.is-circle` are deleted. Tailwind's default `rounded-*` scale is **not** wiped in this phase (legacy pages still use `rounded-2xl`); Phase 5 wipes it.
- Legacy aliases kept until Phase 5: `--paper-2`, `--paper-3`, `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--caution-text`, `--radius`, `--shadow-lg`, `--shadow-signal`, `.kicker`, `.font-display`, `.container-x`, `.link-sweep`, `.font-mono`.
- White text only on `primary`, `primary-deep`, `ink`, and the deep semantic values; never on `*-fill` colours.
- No new `lucide-react` imports. No new `hover:-translate-y-*`, `blur-*`, or `Sparkles`.
- Honesty doctrine unchanged; no copy changes in this phase except the logo tagline, which is unchanged ("the standard, not the discount").
- Git: work on branch `redesign/ui-overhaul`; run git as `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite …` (repo ownership quirk on this machine). Commit after every task.
- Commands run from the repo root in Git Bash. `npm run build` must pass at the end of every task that touches `app/` or `lib/`.

### Phase 9 additions to the constraints

- **Measure, do not redesign.** If a screenshot or an audit exposes a design problem, it goes into `DESIGN_REVIEW.md` under Must / Should / Could. The only visual changes Phase 9 is allowed to make are the ones needed to clear a Lighthouse gate (Task 5 Step 6) or a keyboard defect (Task 6). Everything else is a finding, not a fix.
- **Record before you conclude.** Every number reported in `DESIGN_REVIEW.md` must exist first in a committed artifact: `screenshots/final/gate.md`, `screenshots/final/heights.json`, `screenshots/final/INDEX.md`, `screenshots/final/lighthouse/*.json`, `screenshots/final/lighthouse.md`, `screenshots/final/keyboard.md`, `screenshots/final/measurements.md`. Never transcribe a number from a terminal you have already scrolled past.
- **Content is never dead code.** `data/*.json` keys are content. The dead-file sweep removes unused *components, exports, and npm packages* only. No key, string, or array entry is deleted from any file in `data/`.
- **The honesty rule applies to this phase's own writing.** `DESIGN_REVIEW.md` and `docs/superpowers/PR-ui-overhaul.md` carry no invented numbers. "Not measured" is an acceptable cell; a guess is not.
- **Do not merge, do not push, do not open a PR.** Task 9 writes a PR description *file* and stops. Integration is the user's call.
- **Screenshots are evidence, not decoration.** The whole of `screenshots/final/` must stay under 40 MB. Task 4 checks this and re-encodes if it does not.

---

## Preflight (run once, before Task 1)

- [ ] **P1: Confirm the branch and a clean tree**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rev-parse --abbrev-ref HEAD
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite status --porcelain
```
Expected: `redesign/ui-overhaul`, and no output from `status`. If the tree is dirty, stop and resolve it — Phase 9 measures a tree, and an uncommitted tree is not a measurable one.

- [ ] **P2: Confirm Phases 5–8 actually landed**

```bash
ls app/practice/page.tsx app/glossary/page.tsx app/educators/page.tsx app/library/page.tsx
ls "app/(dev)/dev/ui/page.tsx"
ls public/kit/*.pdf
grep -c '"lucide-react"' package.json
ls components/reveal.tsx components/ui.tsx 2>/dev/null
```
Expected: the six route files exist; at least one PDF in `public/kit/`; `grep -c` prints `0`; the last `ls` prints "No such file or directory" for both (Phase 5 deletes them).

If any of these fails, **stop**. Phase 9 verifies a finished tree; running it early produces a review document that has to be thrown away. Report which phase is incomplete and hand back.

- [ ] **P3: Note the phase-start commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rev-parse --short HEAD
```
Write it down. Task 9 uses it as the lower bound of the Phase 9 commit range.

---

## File structure

| Path | Responsibility |
|---|---|
| `knip.json` | Dead-code config: declares Next.js entry points so `app/**/page.tsx` is never reported unused; excludes `scripts/`, `design/`, `public/` |
| `public/sw.js` | Cache name bumped to `hfph-v2`; three explicit strategies so non-hashed `public/` assets can never pin a pre-redesign image |
| `scripts/shoot.mjs` | The §13 screenshot matrix: 10 routes × widths + 3 open states, full-page with tiling past 16,000px, writes `heights.json` and `INDEX.md` |
| `scripts/measure.mjs` | One function per spec §1 row; writes `screenshots/final/measurements.md` and exits 1 on a missed target |
| `screenshots/final/*.png` | The matrix |
| `screenshots/final/INDEX.md`, `heights.json` | Generated index and the page heights Task 7 reads |
| `screenshots/final/gate.md` | Recorded output of `verify:all`, `npm test`, `npm run build`, sitemap and header checks |
| `screenshots/final/lighthouse/*.json`, `lighthouse.md` | Raw Lighthouse reports and the summary table |
| `screenshots/final/keyboard.md` | The manual keyboard + screen-reader checklist, pass/fail per row |
| `screenshots/final/measurements.md` | The "Measure / Before / After" table |
| `DESIGN_REVIEW.md` | v2 — replaces the 2026-08-17 audit |
| `README.md` | Routes table, Design section, Run section |
| `BUILD_GUIDE.md` | Final read-through; stale Phase-5 transition lines removed |
| `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` | Status line → "Implemented 2026-08-21; see DESIGN_REVIEW.md" |
| `docs/superpowers/PR-ui-overhaul.md` | PR description: summary, phase list with commit ranges, screenshots index, how to verify, known follow-ups |
| `package.json` | `shoot` and `measure` scripts; `verify:all` composition confirmed |
| `.gitignore` | Playwright artefact dirs; tool-directory entries grouped under a comment |

**Execution waves.** A → B → C → D → E → F.

| Wave | Tasks |
|---|---|
| A | 1 (dead-file sweep), 2 (service worker) — parallel, disjoint files |
| B | 3 (full static gate) — needs A's deletions in the tree |
| C | 4 (screenshots), 5 (Lighthouse) — parallel, both need a green build from B |
| D | 6 (keyboard pass), 7 (success-criteria measurement) — parallel; 7 reads C's artifacts |
| E | 8 (docs) — reads every artifact from B, C, D |
| F | 9 (branch finish) — last |

---

### Task 1: Dead-file sweep

**Parallel group:** A

**Files:**
- Create: `knip.json`
- Delete: whatever the sweep proves unreferenced (candidate list in Step 4)
- Modify: `package.json` (dependency removals only), `.gitignore`

**Interfaces:**
- Consumes: the finished tree from Phase 8.
- Produces: a tree with no unreferenced component, export, or npm package. Task 3 re-runs the full gate on it; Task 7 counts icon libraries out of the `package.json` this task leaves behind.

- [ ] **Step 1: Write `knip.json`**

Create `knip.json` at the repo root:

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "app/**/{page,layout,template,loading,error,global-error,not-found,route,default}.{ts,tsx}",
    "app/{sitemap,robots,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}",
    "next.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "vitest.config.ts",
    "vitest.setup.ts",
    "**/*.test.{ts,tsx}",
    "**/*.test.mjs"
  ],
  "project": [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}"
  ],
  "ignore": [
    "scripts/**",
    "design/**",
    "public/**",
    ".next/**",
    "next-env.d.ts"
  ],
  "ignoreDependencies": [
    "sharp",
    "tailwindcss",
    "@tailwindcss/postcss",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "eslint-config-next"
  ],
  "ignoreExportsUsedInFile": true,
  "paths": { "@/*": ["./*"] }
}
```

Why each block:
- `entry` — App Router files are reached by the framework, not by an import. Without this, knip reports all 37 `page.tsx` files as unused. Test files are entry points too, or every component only covered by a test looks dead.
- `project` — the source knip is allowed to judge. `scripts/**` is excluded because those are standalone `node` programs with no importer by design; deleting one because "nothing imports it" would delete the verification suite.
- `ignoreDependencies` — build-chain packages consumed by config files or by the toolchain rather than by an `import`. `sharp` is used only by `scripts/optimize-images.mjs`, which `ignore` removes from the graph.
- `ignoreExportsUsedInFile` — stops knip flagging an export that the same file also uses locally (common in the barrels).

- [ ] **Step 2: Run the sweep and save the report**

```bash
npx --yes knip@5 --reporter markdown > /tmp/knip-report.md 2>&1 || true
cat /tmp/knip-report.md
```
Expected: a markdown report with some subset of the sections "Unused files", "Unused dependencies", "Unused devDependencies", "Unused exports", "Unused exported types", "Unlisted dependencies". A non-zero exit just means it found something — that is the point, hence `|| true`.

If `npx` cannot fetch knip (offline), fall back to:
```bash
npx --yes ts-prune@0.10.3 -p tsconfig.json | grep -v "(used in module)" > /tmp/tsprune.txt
cat /tmp/tsprune.txt
```
`ts-prune` finds unused *exports* only, not unused files or dependencies — so with the fallback you must also run Step 4's grep loop over the candidate list by hand.

- [ ] **Step 3: Triage the report into three buckets**

Go through every line and put it in exactly one bucket. Write the triage into `/tmp/knip-triage.md` as you go; Task 8 quotes the "kept, with reason" bucket into `DESIGN_REVIEW.md` under "Fixed during review".

| Bucket | Rule |
|---|---|
| **Delete** | A component, export, or type with zero importers that the overhaul made redundant. |
| **Keep, with reason** | Framework-reached files knip's config missed; public API of a barrel that pages import by name; anything under `data/`. Record the reason. |
| **Not knip's business** | Anything in `data/`, `public/`, `design/`, `scripts/`. Content and standalone programs. Never delete from these on knip's say-so. |

- [ ] **Step 4: Delete the migration leftovers**

These are the specific candidates the overhaul creates. For each one, prove there is no importer **before** deleting it:

```bash
for f in \
  components/ui.tsx \
  components/reveal.tsx \
  components/icon.tsx \
  components/site-header.tsx \
  components/site-footer.tsx \
  components/search-palette.tsx \
  components/logo.tsx \
  components/back-to-top.tsx \
  components/sw-register.tsx \
  components/json-ld.tsx \
  components/path-chooser.tsx \
  components/path-gate.tsx \
  components/journey-progress.tsx \
  components/stage-page.tsx \
  components/motion-provider.tsx \
  components/download-button.tsx \
  components/freshness-note.tsx
do
  if [ -f "$f" ]; then
    base=$(basename "$f" .tsx)
    n=$(grep -rl "components/$base\"" app components lib --include=*.ts --include=*.tsx | grep -v "^$f$" | wc -l)
    echo "$f -> $n importer(s)"
  fi
done
```
Expected: every surviving shim prints `-> 0 importer(s)`. Delete exactly those:

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rm <each file that printed 0>
```

Any file that prints a non-zero count is still load-bearing. Do **not** delete it and do **not** rewrite its importers here — record it in `/tmp/knip-triage.md` as a Should-fix finding for `DESIGN_REVIEW.md` ("Phase 5 left N importers on the `<name>` shim").

- [ ] **Step 5: Delete the three named de-slop components if they survived**

Spec §9 retires `Marquee`, `Reveal`, and the `Bracket` decoration. Check each:

```bash
grep -rn "\bMarquee\b" app components lib --include=*.ts --include=*.tsx
grep -rn "\bReveal\b" app components lib --include=*.ts --include=*.tsx
grep -rn "\bBracket\b" app components lib --include=*.ts --include=*.tsx
```
Expected: no output for all three. Each grep that prints nothing *and* whose defining file still exists means the file is dead — delete it. Each grep that prints call sites is a Phase 5 miss: record it as a **Must fix** in `DESIGN_REVIEW.md` and unwrap the call sites here (an unwrap is a mechanical `<Reveal>…</Reveal>` → `…` edit, not a redesign, so it is in scope).

- [ ] **Step 6: Settle the npm dependencies**

```bash
grep -n "lucide-react" package.json package-lock.json | head -5
grep -rn "from \"motion" app components lib --include=*.ts --include=*.tsx
grep -rn "@next/third-parties" app components lib --include=*.ts --include=*.tsx
```

| Finding | Action |
|---|---|
| `lucide-react` still in `package.json` | Phase 5 missed it. Run `npm uninstall lucide-react`. Spec §1 targets exactly one icon library. |
| `motion` has at least one importer | Keep it. Spec §4.5 keeps `motion` for state-change animation inside tools. Record where it is used. |
| `motion` has **zero** importers | Run `npm uninstall motion`, and note it in `DESIGN_REVIEW.md` — the last state-change animation went away with the migration, which is a design fact worth stating. |
| `@next/third-parties` has zero importers | Check `lib/analytics.ts` first (`grep -n "third-parties" lib/analytics.ts app/layout.tsx`). Remove only if nothing references it. |
| Anything else in knip's "Unused dependencies" | Uninstall it, then re-run `npm run build` before trusting the removal. |

Do not add knip or ts-prune to `package.json`. Both are one-shot audits run through `npx`; `knip.json` is committed so the next run is already configured.

- [ ] **Step 7: Tidy `.gitignore`**

Playwright is a devDependency from Phase 7 and drops two artefact directories on a failed run. Add them, and give the ad-hoc tool entries a header so the file reads as three intentional groups rather than a pile.

Replace the tail of `.gitignore` — everything from the `.firecrawl` line to the end — with:

```gitignore
# local agent/tool state (never committed)
.firecrawl
.impeccable
.claude-flow
.claude
.superpowers/

# test and browser artifacts
/test-results/
/playwright-report/
/blob-report/
/.lighthouseci/

# generated photoreal sources (regenerable, large)
design/images/raw/
```

Leave every line above `.firecrawl` untouched — those are Next.js and npm defaults and changing them is out of scope.

Confirm nothing that is currently tracked becomes ignored:
```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite ls-files --ignored --exclude-standard -c
```
Expected: no output. Any path printed here is tracked *and* newly ignored — revert that `.gitignore` line.

- [ ] **Step 8: Prove the tree still builds and tests**

```bash
npx tsc --noEmit
npm test
npm run build
```
Expected: silence from `tsc`; `node --test` and vitest both green; `✓ Compiled successfully`.

A deletion that breaks any of these was not dead. Restore it with `git checkout -- <path>` and move it to the "Keep, with reason" bucket.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add knip.json .gitignore package.json package-lock.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add -u components lib app
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(cleanup): remove the shims and exports the migration orphaned

knip.json declares the App Router entry points so pages are never reported
unused, and excludes scripts/ and data/ — content is not dead code."
```

`git add -u` is safe here and only here: it stages deletions of already-tracked files under the three named directories, which is exactly what this task produced.

---

### Task 2: Service worker and caching across the redesign

**Parallel group:** A

**Files:**
- Modify: `public/sw.js`
- Read (no edit expected): `components/site/sw-register.tsx` — Phase 2 moved it there; if that path does not exist, it is still at `components/sw-register.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a cache named `hfph-v2` whose activate handler deletes every other `hfph-*` cache, and a fetch handler that can never serve a pre-redesign `public/images/*` or `public/kit/*` asset from cache indefinitely.

**Why this task exists.** The shipped worker treats anything matching `\.(css|js|woff2?|png|jpg|jpeg|svg|webp|avif|ico)$` as immutable and serves it cache-first. That is true for `/_next/static/…` (content-hashed) and false for `public/images/home-hero.jpg` (stable URL, new bytes). A visitor who used the site before the overhaul would keep the old hero photo, the old favicon, and the old kit PDFs forever. Bumping the cache name fixes it once; splitting the strategies fixes it for every future asset swap.

- [ ] **Step 1: Locate the register component and confirm it is production-only**

```bash
ls components/site/sw-register.tsx 2>/dev/null || ls components/sw-register.tsx
grep -n "NODE_ENV" components/site/sw-register.tsx components/sw-register.tsx 2>/dev/null
```
Expected: exactly one of the two files exists, and it contains the `process.env.NODE_ENV !== "production"` guard that unregisters the worker and drops every `hfph-` cache in development. That guard is why Steps 5–7 must run against `npx next start`, never `npm run dev`. No edit is needed — just confirm it survived Phase 2's move.

- [ ] **Step 2: Rewrite `public/sw.js`**

Replace the whole file with:

```js
// Hire From PH service worker. Runtime cache only — no precache manifest to drift out
// of sync with Next's hashed chunks.
//
// THREE strategies, because "is it a static file?" is the wrong question:
//
//   immutable  /_next/static/**            content-hashed by Next → cache-first, forever
//   revalidate /images/**, /kit/**, /icon…  stable URL, changeable bytes → stale-while-revalidate
//   document   everything else              → network-first, cache fallback, then "/"
//
// BUMP `CACHE` whenever a non-hashed asset under public/ changes shape — a redesign,
// a new photo set, a regenerated kit PDF. The activate handler deletes every other
// hfph-* cache, so a bump is a full purge for returning visitors.
const CACHE = "hfph-v2";

self.addEventListener("install", (e) => {
  // Warm the shell so the very first offline hit still renders something.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"]).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Hashed by the build. The URL changes when the bytes change, so it is safe forever.
function isImmutable(url) {
  return url.pathname.startsWith("/_next/static/");
}

// Stable URLs whose bytes we do replace: first-party imagery, the educator kit PDFs,
// the favicon and the manifest. Served from cache for speed, refreshed in the
// background, so a redesign lands on the second visit rather than never.
function isRevalidatable(url) {
  return (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/kit/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname)
  );
}

function putInCache(request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;
  const copy = response.clone();
  caches.open(CACHE).then((c) => c.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.headers.has("range")) return; // let the network handle partial content
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch analytics/CDN
  if (url.pathname === "/sw.js") return; // never cache the worker itself
  if (url.pathname.startsWith("/dev/")) return; // the dev gallery is not a shipped route

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => putInCache(request, res))),
    );
    return;
  }

  if (isRevalidatable(url)) {
    // Stale-while-revalidate: answer from cache immediately, refresh in the background.
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request)
          .then((res) => putInCache(request, res))
          .catch(() => hit);
        return hit || network;
      }),
    );
    return;
  }

  // Documents and everything else: network-first, fall back to cache, then to "/".
  event.respondWith(
    fetch(request)
      .then((res) => putInCache(request, res))
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/"))),
  );
});
```

Three details that matter and are easy to get wrong:

1. `isImmutable` is checked **before** `isRevalidatable`, so `/_next/static/media/CabinetGrotesk-Bold.<hash>.woff2` takes the cache-first path even though it ends in `.woff2`. The `.woff2` clause in `isRevalidatable` is a safety net for any font served from `public/`, of which there should be none.
2. `putInCache` refuses non-`ok` and opaque responses. Without that guard a 404 gets cached and the page stays broken until the next name bump.
3. The stale-while-revalidate branch returns `hit || network`, not `network`. First visit falls through to the network; every visit after that is instant and refreshes behind the reader's back.

- [ ] **Step 3: Confirm what the browser will actually cache**

```bash
ls public/images/ | head -30
ls public/kit/
ls public/*.svg public/*.ico 2>/dev/null
```
Every file listed must fall into `isRevalidatable` — `public/images/**` and `public/kit/**` are matched by prefix, `icon.svg` by name, anything else by extension. If `ls public/` shows a directory this task did not anticipate, add its prefix to `isRevalidatable`; do not leave it on the document path, where an image would be re-downloaded on every navigation.

- [ ] **Step 4: Build and serve a production bundle**

```bash
npm run build
npx next start
```
Expected: `▲ Next.js 16.2.10` and `Local: http://localhost:3000`. Leave it running for Steps 5–7. `npx next start` is used rather than `npm start` so the command reads the same on Windows, where `PORT` is set via the environment rather than `-p`.

- [ ] **Step 5: Register the new worker and confirm the old caches are gone**

In Chrome, at `http://localhost:3000`:

1. DevTools → Application → Service Workers. Expect one worker, `/sw.js`, status "activated and is running". If a previous worker shows as "waiting", click **skipWaiting** once — `self.skipWaiting()` in the install handler should have made that unnecessary, and needing it is worth a note in `DESIGN_REVIEW.md`.
2. Application → Storage → Cache Storage. Expect exactly one cache: `hfph-v2`. **`hfph-v1` must not be present.** Its absence is the whole point of the bump — the activate handler deleted it.
3. Reload once, then expand `hfph-v2`. Expect entries for `/`, several `/_next/static/…` chunks, and the hero image (`/images/home-hero.webp` or `.jpg`, whichever the browser picked).

Via the chrome-devtools MCP instead of by hand: `new_page` → `http://localhost:3000`, then `evaluate_script` with

```js
() => caches.keys().then((k) => k.sort())
```
Expected result: `["hfph-v2"]`.

- [ ] **Step 6: Prove a changed image actually refreshes**

This is the regression the bump exists to prevent, so test it rather than assuming it.

1. With the page loaded once, note the byte size of the hero request in the Network panel.
2. In the terminal, touch the asset so its bytes differ:
   ```bash
   node -e "const f='public/images/home-hero.jpg';const fs=require('fs');const b=fs.readFileSync(f);fs.writeFileSync(f,Buffer.concat([b,Buffer.from([0xFF,0xD9])]));console.log('appended 2 bytes to',f,b.length,'->',b.length+2);"
   ```
3. Reload twice. The **first** reload may serve the stale copy (that is stale-while-revalidate working); the **second** must serve the new size.
4. Undo the test mutation — this file is committed:
   ```bash
   git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite checkout -- public/images/home-hero.jpg
   ```
   Confirm with `git status --porcelain public/images/` → no output.

- [ ] **Step 7: Offline load of `/`**

1. DevTools → Network → throttling dropdown → **Offline**.
2. Reload `http://localhost:3000/`.
3. Expected: the homepage renders — header, hero copy, footer. The hero photo renders if it was cached in Step 5; if it does not, the `Figure` fallback shows rather than a broken-image icon.
4. Navigate to `/start` while still offline. Expected: if `/start` was visited earlier in the session it renders from cache; otherwise the worker falls back to `/`. Both are correct behaviour — record which one you got.
5. Switch throttling back to **No throttling** and confirm a normal reload.

Record the outcome of Steps 5–7 in one line each; Task 8 puts them in `DESIGN_REVIEW.md` under "What works".

- [ ] **Step 8: Stop the server and commit**

Ctrl-C the `npx next start` process.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add public/sw.js
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "fix(sw): bump the cache to hfph-v2 and stop pinning non-hashed public assets

Only /_next/static is content-hashed, so only it is safe cache-first. Images,
kit PDFs, the favicon and the manifest move to stale-while-revalidate, and the
name bump purges every hfph-v1 cache from returning visitors."
```

---

### Task 3: The full static gate, re-run on the final tree

**Parallel group:** B (after Tasks 1 and 2 have landed)

**Files:**
- Create: `screenshots/final/gate.md`
- Modify: `package.json` (only if `verify:all` is missing a member that already works)

**Interfaces:**
- Consumes: the swept tree from Task 1 and the worker from Task 2.
- Produces: `screenshots/final/gate.md` — the recorded output of every gate, which Tasks 7 and 8 quote; the route count and the test count that go into `DESIGN_REVIEW.md`.

- [ ] **Step 1: Read what `verify:all` currently chains**

```bash
node -e "const p=require('./package.json');for(const [k,v] of Object.entries(p.scripts)) console.log(k.padEnd(20), v);"
```

Spec §5.7 and §14 row 9 want one command that runs: contrast, claims, links, voice lint, kit, eslint, `tsc --noEmit`, and primitives in strict mode. Compare what you see against that list and fill in this table:

| Member | Expected script | Present? | Action if missing |
|---|---|---|---|
| contrast | `verify:contrast` → `node scripts/verify-contrast.mjs` | | Add to the chain |
| claims | `verify:claims` → `node scripts/verify-claims.mjs` | | Add to the chain |
| links | `verify:links` → `node scripts/verify-links.mjs` | | Add to the chain |
| voice | `voice:lint` → `node scripts/voice-audit.mjs …` | | See the rule below |
| kit | `verify:kit` → Phase 7's PDF-vs-JSON hash check | | See the rule below |
| eslint | `lint` → `eslint` | | Add to the chain |
| types | `npx tsc --noEmit` | | Add to the chain |
| primitives | `verify:primitives` → `node scripts/verify-primitives.mjs --strict` | | See the rule below |

**Rules for the three conditional rows — read these before editing anything:**

- `verify:primitives` **must** carry `--strict`. Phase 5 owns that switch; if the script still runs warn-only, that is a Phase 5 miss. Change the npm script to `node scripts/verify-primitives.mjs --strict`, run it, and if it now fails, the violations are a **Must fix** in `DESIGN_REVIEW.md` — fix them here only if they are one-line class swaps, otherwise record them and hand back.
- `voice:lint` and `verify:kit` belong to Phase 8 and Phase 7. If either npm script is absent, **do not invent it in Phase 9.** Run the underlying program directly (`node scripts/voice-audit.mjs`), record its output, and log "Phase N did not wire `<name>` into `verify:all`" as a **Should fix** in `DESIGN_REVIEW.md`. Adding a brand-new gate on the last day of a project is how you ship a red build.
- Only add a member to the chain when the underlying script **exists and exits 0 on the current tree**. Verify with `node scripts/<name>.mjs; echo "exit=$?"` before wiring it.

If edits are needed, the target line is:

```json
"verify:all": "npm run verify:contrast && npm run verify:claims && npm run verify:links && npm run voice:lint && npm run verify:kit && npm run lint && npx tsc --noEmit && npm run verify:primitives"
```

with any member you could not satisfy dropped from the chain and logged.

- [ ] **Step 2: Run the static gate and capture it**

```bash
npm run verify:all 2>&1 | tee /tmp/verify-all.txt; echo "exit=${PIPESTATUS[0]}"
```

Expected: `exit=0`, and lines resembling:

```
Contrast OK — <N> pairs pass.
Claims audit passed: …
Link audit passed: <N> routes, <N> internal references, <N> public assets, …
(voice audit report)
(kit hash check)
(eslint: no output)
(tsc: no output)
verify:primitives: clean.
```

`verify:primitives: clean.` is the line that proves spec §1 rows 4 and 5 — zero inline accent maps, zero raw card patterns. If it prints a violation list instead, stop and fix before continuing; everything downstream would be measuring a tree that has not passed.

Note for whoever wonders: **`verify:links` needs no server.** `scripts/verify-links.mjs` walks `app/` for `page.*` files to build the route set, then greps `app`, `components`, `data`, and `lib` for internal hrefs and same-file `#anchor` targets. It never opens a socket. Do not start a server for it.

- [ ] **Step 3: Run every test and record the counts**

```bash
npm test 2>&1 | tee /tmp/test.txt; echo "exit=${PIPESTATUS[0]}"
grep -E "^# (tests|pass|fail)" /tmp/test.txt
grep -E "Test Files|Tests " /tmp/test.txt
```

Expected: `exit=0`. Record three numbers: the `node --test` TAP `# pass` and `# fail` totals, and vitest's `Test Files N passed (N)` and `Tests N passed (N)` lines.

- [ ] **Step 4: Build and record the route table**

```bash
npm run build 2>&1 | tee /tmp/build.txt; echo "exit=${PIPESTATUS[0]}"
grep -cE "^[├└│ ]*[○●ƒλ] +/" /tmp/build.txt
```

Expected: `exit=0` and `✓ Compiled successfully`. The grep prints the route count; if the glyphs in your Next build differ, count the printed route table by hand instead and write the number down.

Reconcile the count against the information architecture rather than against a number in this plan:

```bash
node -e "const lib=require('./data/library.json');const live=(lib.entries??lib).filter(e=>!e.pending);console.log('live library entries:', live.length);"
find app -name "page.tsx" | wc -l
ls app/educators/kit/*/page.tsx 2>/dev/null | wc -l
```

The build's route count should equal the `page.tsx` count plus the metadata routes Next generates (`/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`, `/icon.svg`, `/_not-found`). Close any gap before moving on — a missing route here is a page that quietly stopped building.

- [ ] **Step 5: Confirm `/dev/ui` is in the build and out of the sitemap**

```bash
grep -E "dev/ui" /tmp/build.txt
```

Expected: one line. The gallery compiles; spec §5.8 gates it at runtime on `NODE_ENV`, not at build time.

Start the production server for Steps 5–7:

```bash
npx next start
```

In a second shell:

```bash
curl -s http://localhost:3000/sitemap.xml -o /tmp/sitemap.xml
grep -c "<loc>" /tmp/sitemap.xml
grep -E "dev/ui|educators/kit" /tmp/sitemap.xml && echo "FAIL: an excluded route is in the sitemap" || echo "OK: no excluded routes"
grep -oE "hirefrom\.ph/(library|practice|glossary|educators)<" /tmp/sitemap.xml | sort
```

Expected: a `<loc>` count matching the live library entries plus `/`; `OK: no excluded routes`; and all four of `library`, `practice`, `glossary`, `educators` printed. Any of the four missing means its `"pending": true` key was never deleted — remove it from `data/site.json` and `data/library.json`, rebuild, and re-check.

```bash
curl -s http://localhost:3000/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dev/ui
```

Expected: a robots body pointing at `https://hirefrom.ph/sitemap.xml`, and `404` for the gallery — the production gate works.

- [ ] **Step 6: Confirm the security headers still apply**

`next.config.ts` attaches six headers to `/:path*`. Nothing in the overhaul should have disturbed that, but the CSP is the one header a redesign can quietly break: a self-hosted font or a first-party image that stopped loading shows up here first.

```bash
curl -sI http://localhost:3000/ | grep -icE "content-security-policy|strict-transport-security|x-content-type-options|x-frame-options|referrer-policy|permissions-policy"
```

Expected: `6`.

Then confirm the page loads with no CSP violation. With the chrome-devtools MCP: `new_page` → `http://localhost:3000`, then `list_console_messages`. Expected: no message containing "Content Security Policy" or "Refused to load". Repeat on `/educators`, which links the kit PDFs. Skip `/dev/ui` — it 404s in production.

The two clauses that matter for the overhaul, and why they still hold:

- `img-src 'self' data: https:` — first-party images come from `'self'`; `Figure` never emits a remote URL.
- `font-src 'self' data:` — `next/font/local` serves Cabinet Grotesk from `/_next/static/media/`, which is `'self'`. Spec §16 Q7 chose self-hosting over the Fontshare CDN, so this clause needs no widening. A blocked font in the console means someone reintroduced the CDN link: that is a **Must fix**.

- [ ] **Step 7: Write `screenshots/final/gate.md`**

```bash
mkdir -p screenshots/final
```

Create `screenshots/final/gate.md`. Every `<…>` is filled from the runs above — no value may be typed from memory:

```markdown
# Phase 9 static gate

Run on <YYYY-MM-DD>, branch `redesign/ui-overhaul`, commit `<git rev-parse --short HEAD>`.
Node <node -v>, npm <npm -v>.

## `npm run verify:all`

Exit 0. Chain: <the exact scripts["verify:all"] string from package.json>

| Check | Result |
|---|---|
| `verify:contrast` | <the "Contrast OK — N pairs pass." line> |
| `verify:claims` | <the pass line> |
| `verify:links` | <the "Link audit passed: …" line, verbatim> |
| `voice:lint` | <the audit total, or "not wired into verify:all — run directly; see Should fix"> |
| `verify:kit` | <the hash-check line, or "not wired; see Should fix"> |
| `eslint` | clean (no output) |
| `tsc --noEmit` | clean (no output) |
| `verify:primitives --strict` | verify:primitives: clean. |

## `npm test`

Exit 0. `node --test`: <N> pass, 0 fail. Vitest: <N> files, <N> tests, 0 failed.

## `npm run build`

Exit 0. <N> routes compiled.

| Assertion | Result |
|---|---|
| `/dev/ui` present in the build route table | yes |
| `/dev/ui` returns 404 from `next start` | yes (404) |
| `/dev/ui` absent from `sitemap.xml` | yes |
| `/educators/kit/*` absent from `sitemap.xml` | yes |
| `/library`, `/practice`, `/glossary`, `/educators` present in `sitemap.xml` | yes |
| `sitemap.xml` `<loc>` count | <N> |
| `robots.txt` points at the sitemap | yes |

## Security headers (`next.config.ts`)

All six present on `/`: Content-Security-Policy, Strict-Transport-Security,
X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
No CSP violation in the console on `/` or `/educators`.
```

- [ ] **Step 8: Stop the server and commit**

Ctrl-C the `npx next start` process.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/final/gate.md package.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(verify): record the phase 9 static gate on the final tree"
```

---

### Task 4: The screenshot matrix

**Parallel group:** C

**Files:**
- Create: `scripts/shoot.mjs`
- Create: `screenshots/final/*.png`, `screenshots/final/INDEX.md`, `screenshots/final/heights.json`
- Modify: `package.json` (add the `shoot` script)

**Interfaces:**
- Consumes: a production build served by `npx next start`, plus a dev server for `/dev/ui` (which 404s in production).
- Produces: `screenshots/final/heights.json` — `{ "<slug>-<width>": { "route": "/", "width": 1280, "height": <px>, "files": ["…"] } }`. Task 7's `scripts/measure.mjs` reads `heights.json["home-1280"].height` to compute the homepage screen count, and Task 8 links `INDEX.md` from `DESIGN_REVIEW.md`.

Spec §13 asks for 375 / 768 / 1280 / 1536 across `/`, `/start`, `/method`, `/reality`, `/tracker`, `/library`, `/dev/ui`, plus the header dropdown and mobile drawer open states. This task adds the search palette open state and the three Phase 6–7 routes at two widths, so the review covers everything the overhaul shipped.

- [ ] **Step 1: Confirm Playwright and its browser**

```bash
node -e "console.log(require('playwright/package.json').version)"
npx playwright install chromium
```

Expected: a version number, then either a download or "browser is already installed". Playwright arrives as a devDependency in Phase 7 (`scripts/build-kit-pdf.mjs` renders the kit PDFs with it). If `require` throws, Phase 7 did not land — go back to Preflight P2.

- [ ] **Step 2: Write `scripts/shoot.mjs`**

Create the file exactly as below.

```js
#!/usr/bin/env node
// The final screenshot matrix for the UI overhaul (spec §13, §14 row 9).
//
//   node scripts/shoot.mjs --server prod --base http://localhost:3000
//   node scripts/shoot.mjs --server dev  --base http://localhost:3001   # /dev/ui only
//   node scripts/shoot.mjs --only home,library                          # re-shoot a subset
//   node scripts/shoot.mjs --format jpeg                                # if PNGs blow the size budget
//
// Writes screenshots/final/<slug>-<width>.png, merges screenshots/final/heights.json
// across runs, and regenerates screenshots/final/INDEX.md from the merged manifest.
//
// Chrome cannot rasterise a single bitmap past ~16,384px on its long edge, and a
// full-length guide page at 375px is easily taller than that. Anything over
// MAX_PAGE_PX is captured as 8,000px tiles named <slug>-<width>-part1.png, -part2…
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT_DIR = join("screenshots", "final");
const MANIFEST = join(OUT_DIR, "heights.json");
const INDEX = join(OUT_DIR, "INDEX.md");

const MAX_PAGE_PX = 16000;
const TILE_PX = 8000;
const SCREEN_PX = 800; // spec §1 measures homepage length in 800px screens

/** Full-page routes. `server` says which server can serve them. */
const ROUTES = [
  { slug: "home", path: "/", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "start", path: "/start", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "method", path: "/method", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "reality", path: "/reality", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "tracker", path: "/tracker", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "library", path: "/library", widths: [375, 768, 1280, 1536], server: "prod" },
  { slug: "practice", path: "/practice", widths: [375, 1280], server: "prod" },
  { slug: "glossary", path: "/glossary", widths: [375, 1280], server: "prod" },
  { slug: "educators", path: "/educators", widths: [375, 1280], server: "prod" },
  // 404s under NODE_ENV=production (spec §5.8), so it is shot against `next dev`.
  { slug: "dev-ui", path: "/dev/ui", widths: [375, 768, 1280, 1536], server: "dev" },
];

/** Open-state shots. Viewport-sized, not full-page: these are overlays. */
const STATES = [
  { slug: "nav-dropdown", path: "/", width: 1280, server: "prod", act: openNavDropdown },
  { slug: "mobile-drawer", path: "/", width: 375, server: "prod", act: openMobileDrawer },
  { slug: "search-palette", path: "/", width: 1280, server: "prod", act: openSearchPalette },
];

function viewportHeight(width) {
  return width <= 375 ? 812 : 900;
}

function parseArgs(argv) {
  const args = { base: "http://localhost:3000", server: "prod", only: null, format: "png" };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--base") args.base = argv[++i];
    else if (flag === "--server") args.server = argv[++i];
    else if (flag === "--only") args.only = new Set(argv[++i].split(",").map((s) => s.trim()));
    else if (flag === "--format") args.format = argv[++i];
    else {
      console.error(`unknown flag: ${flag}`);
      process.exit(2);
    }
  }
  if (!["prod", "dev"].includes(args.server)) {
    console.error(`--server must be prod or dev, got ${args.server}`);
    process.exit(2);
  }
  if (!["png", "jpeg"].includes(args.format)) {
    console.error(`--format must be png or jpeg, got ${args.format}`);
    process.exit(2);
  }
  return args;
}

function fileFor(slug, width, format, part) {
  const ext = format === "jpeg" ? "jpg" : "png";
  const suffix = part ? `-part${part}` : "";
  return join(OUT_DIR, `${slug}-${width}${suffix}.${ext}`);
}

function shotOptions(path, format) {
  return format === "jpeg" ? { path, type: "jpeg", quality: 82 } : { path, type: "png" };
}

/** Fails loudly with the accessible names actually on the page. */
async function requireOne(page, locator, label) {
  const count = await locator.count();
  if (count === 1) return locator;
  const names = await page
    .locator("header button, header a, [role='banner'] button, [role='banner'] a")
    .evaluateAll((els) =>
      els
        .map((el) => (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean),
    );
  throw new Error(
    `${label}: expected exactly 1 match, found ${count}.\n` +
      `Controls in the header right now:\n  ${names.join("\n  ")}\n` +
      `Update the locator in scripts/shoot.mjs to the shipped accessible name.`,
  );
}

async function openNavDropdown(page) {
  const trigger = page.getByRole("button", { name: /^Learn$/ });
  await requireOne(page, trigger, 'header dropdown trigger "Learn"');
  await trigger.click();
  // Every dropdown ends with the library row (spec §6.1) — a stable "it opened" anchor.
  await page.getByRole("link", { name: /library/i }).first().waitFor({ state: "visible", timeout: 5000 });
}

async function openMobileDrawer(page) {
  const trigger = page.getByRole("button", { name: /menu/i });
  await requireOne(page, trigger, "mobile drawer trigger");
  await trigger.click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
}

async function openSearchPalette(page) {
  // Ctrl+K is the documented global shortcut (Phase 2), and it needs no selector.
  await page.keyboard.press("Control+k");
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
}

async function settle(page, server) {
  if (server === "dev") {
    // `next dev` keeps an HMR socket open, so networkidle never fires.
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);
  } else {
    await page.waitForLoadState("networkidle");
  }
  await page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => undefined) : undefined));
  await page.waitForTimeout(250);
}

async function shootFullPage(page, slug, width, format) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  if (height <= MAX_PAGE_PX) {
    const path = fileFor(slug, width, format);
    await page.screenshot({ ...shotOptions(path, format), fullPage: true });
    return { height, files: [path], tiled: false };
  }

  const tiles = Math.ceil(height / TILE_PX);
  const files = [];
  for (let i = 0; i < tiles; i++) {
    const top = i * TILE_PX;
    const tileHeight = Math.min(TILE_PX, height - top);
    await page.setViewportSize({ width, height: tileHeight });
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.waitForTimeout(250);
    const path = fileFor(slug, width, format, i + 1);
    await page.screenshot(shotOptions(path, format));
    files.push(path);
  }
  await page.setViewportSize({ width, height: viewportHeight(width) });
  return { height, files, tiled: true };
}

function loadManifest() {
  if (!existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

function writeIndex(manifest) {
  const rows = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
  const lines = [
    "# Final screenshot matrix",
    "",
    "Generated by `node scripts/shoot.mjs`. Widths are CSS pixels at deviceScaleFactor 1,",
    "`prefers-reduced-motion: reduce`, and a fresh browser context per shot (so every",
    "`localStorage`-backed tool renders its empty state).",
    "",
    "Chrome cannot rasterise a bitmap past ~16,384px on its long edge, so any page taller",
    `than ${MAX_PAGE_PX.toLocaleString("en-US")}px is tiled into ${TILE_PX.toLocaleString("en-US")}px \`-partN\` files.`,
    "",
    "| File | Route | Width | Page height | Screens at 800px | Kind |",
    "|---|---|---|---|---|---|",
  ];
  for (const [key, entry] of rows) {
    const screens = entry.height ? (entry.height / SCREEN_PX).toFixed(1) : "—";
    const height = entry.height ? `${entry.height}px` : "viewport";
    for (const file of entry.files) {
      lines.push(
        `| \`${file.split(/[\\/]/).pop()}\` | \`${entry.route}\` | ${entry.width} | ${height} | ${screens} | ${entry.kind} |`,
      );
    }
    void key;
  }
  lines.push("");
  writeFileSync(INDEX, lines.join("\n") + "\n");
}

function totalBytes() {
  return readdirSync(OUT_DIR)
    .map((f) => join(OUT_DIR, f))
    .filter((f) => statSync(f).isFile())
    .reduce((sum, f) => sum + statSync(f).size, 0);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = loadManifest();

  const jobs = [];
  for (const route of ROUTES) {
    if (route.server !== args.server) continue;
    if (args.only && !args.only.has(route.slug)) continue;
    for (const width of route.widths) jobs.push({ ...route, width, kind: "full page" });
  }
  for (const state of STATES) {
    if (state.server !== args.server) continue;
    if (args.only && !args.only.has(state.slug)) continue;
    jobs.push({ ...state, kind: "open state" });
  }

  if (jobs.length === 0) {
    console.error(`no jobs matched --server ${args.server}${args.only ? ` --only ${[...args.only].join(",")}` : ""}`);
    process.exit(2);
  }

  const browser = await chromium.launch();
  let failures = 0;

  for (const job of jobs) {
    const context = await browser.newContext({
      viewport: { width: job.width, height: viewportHeight(job.width) },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const url = `${args.base}${job.path}`;
    try {
      const response = await page.goto(url, { waitUntil: "commit", timeout: 60000 });
      const status = response ? response.status() : 0;
      if (status >= 400 || status === 0) throw new Error(`${url} returned HTTP ${status}`);
      await settle(page, job.server);

      if (job.act) {
        await job.act(page);
        await page.waitForTimeout(300);
        const path = fileFor(job.slug, job.width, args.format);
        await page.screenshot(shotOptions(path, args.format));
        manifest[`${job.slug}-${job.width}`] = {
          route: job.path,
          width: job.width,
          height: 0,
          kind: job.kind,
          files: [path],
        };
        console.log(`ok   ${path}`);
      } else {
        const result = await shootFullPage(page, job.slug, job.width, args.format);
        manifest[`${job.slug}-${job.width}`] = {
          route: job.path,
          width: job.width,
          height: result.height,
          kind: result.tiled ? "full page (tiled)" : job.kind,
          files: result.files,
        };
        console.log(
          `ok   ${result.files.join(", ")}  (${result.height}px, ${(result.height / SCREEN_PX).toFixed(1)} screens)`,
        );
      }
    } catch (error) {
      failures++;
      console.error(`FAIL ${job.slug}-${job.width}: ${error.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  writeIndex(manifest);

  const mb = (totalBytes() / (1024 * 1024)).toFixed(1);
  console.log(`\n${Object.keys(manifest).length} entries in ${MANIFEST}; ${OUT_DIR} is ${mb} MB.`);
  if (failures > 0) {
    console.error(`${failures} shot(s) failed.`);
    process.exit(1);
  }
}

await main();
```

Three implementation notes, because each one is a trap:

1. `waitUntil: "commit"` on `goto`, then an explicit `settle()`. `networkidle` as a `goto` option times out against `next dev`; splitting the wait lets the dev and prod paths differ without duplicating the navigation.
2. Tiling resizes the **viewport height**, then scrolls, then takes a viewport screenshot. Playwright's `clip` + `fullPage` combination is version-sensitive; this is not. The viewport is restored afterwards so the manifest's height stays comparable.
3. `deviceScaleFactor: 1`. At 2× a 1280-wide, 16,000px-tall page is a 40-megapixel PNG, and the matrix would not fit the repo.

- [ ] **Step 3: Add the npm script**

In `package.json`, next to `images:optimize`:

```json
"shoot": "node scripts/shoot.mjs",
```

- [ ] **Step 4: Shoot the production matrix**

```bash
npm run build
npx next start
```

In a second shell:

```bash
node scripts/shoot.mjs --server prod --base http://localhost:3000
```

Expected: one `ok` line per shot — 6 routes × 4 widths + 3 routes × 2 widths + 3 open states = **33 entries** — then the manifest and size summary. Any `FAIL` line for a `getByRole` locator prints the header's real accessible names; edit the locator in `scripts/shoot.mjs` to match what shipped and re-run with `--only nav-dropdown` (or `mobile-drawer`).

- [ ] **Step 5: Shoot `/dev/ui` against a dev server**

`/dev/ui` returns 404 under `next start` by design, so it needs `next dev` on a second port. Leave `next start` running.

```bash
PORT=3001 npm run dev
```

In a third shell:

```bash
node scripts/shoot.mjs --server dev --base http://localhost:3001
```

Expected: four `ok` lines (`dev-ui-375`, `-768`, `-1280`, `-1536`) and a regenerated `INDEX.md` that now holds all 37 entries. The script merges into the existing `heights.json` rather than replacing it, so the prod run is not lost.

Stop the dev server when it finishes.

- [ ] **Step 6: Review every shot before trusting it**

Open `screenshots/final/INDEX.md` and each file. Check against this table and fix or record anything that fails:

| Shot | What must be true |
|---|---|
| `home-1280` | Eight bands ending navy; height ≤ 6,400px (that is the 8-screen budget from spec §1); hero photo 4:5 on the right with its "Illustrative image" caption |
| `home-375` | Hero stacks photo under copy; nothing overflows horizontally; the stepper fits one row |
| `home-768` / `home-1536` | Two-column grids at 768; content capped at the 1280 container at 1536 with bands full-bleed |
| `start-*` | Breadcrumb, "Stage 1 of 5" kicker, `stage-start` photo, stepper, do-first cards, tool cards, tint closing panel, prev/next |
| `method-*` | The 7-node method diagram sits in a `DiagramFrame` and scrolls **inside** its frame at 375, never widening the page |
| `reality-*` | Every chart carries a visible `Source`; no bar without one |
| `tracker-*` | The empty state renders (fresh context ⇒ empty `localStorage`) with its icon, title, body and action |
| `library-*` | Both chip rows, the result count, a card grid that reflows 3 → 2 → 1 |
| `practice-*` | Empty state explaining the method, linking `/learn` |
| `glossary-*` | A–Z index plus the filter box |
| `educators-*` | Piece thumbnails, download buttons, the licence line, the honesty note |
| `dev-ui-*` | Every primitive in every variant; buttons are pills; cards are bordered with no shadow and no lift |
| `nav-dropdown-1280` | Two columns of label + description, the library footer row, opaque white bar, hairline border, no blur |
| `mobile-drawer-375` | CTA on top, four accordion groups, Library and Privacy at the bottom, 48px rows |
| `search-palette-1280` | Dialog centred over a scrim, input focused, the result list visible |

Two systematic checks across the whole set:

- **No horizontal scrollbar at 375.** If a shot is wider than 375 CSS px of content, something escaped its container — a **Must fix**.
- **Tiled pages.** Any entry whose `kind` is `full page (tiled)` is over 16,000px. That is expected on the long guides at 375px and is a note in `INDEX.md`, not a defect. If `home-1280` is tiled, the homepage blew its length budget by a factor of two and that **is** a defect.

- [ ] **Step 7: Check the size budget**

```bash
du -sh screenshots/final
```

Expected: under 40 MB. If it is over, re-encode the whole matrix:

```bash
rm screenshots/final/*.png
node scripts/shoot.mjs --server prod --base http://localhost:3000 --format jpeg
# and the dev run again for /dev/ui
```

`INDEX.md` regenerates from the manifest, so the filenames stay in sync automatically. Record in `INDEX.md`'s commit message which format the committed set uses.

- [ ] **Step 8: Stop the servers and commit**

Ctrl-C `npx next start`.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/shoot.mjs package.json screenshots/final
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(review): final screenshot matrix at 375/768/1280/1536 plus the three open states

scripts/shoot.mjs tiles any page past 16,000px because Chrome cannot rasterise
a taller bitmap; /dev/ui is shot against next dev since it 404s in production."
```

---

### Task 5: Lighthouse on four routes, mobile preset

**Parallel group:** C

**Files:**
- Create: `screenshots/final/lighthouse/home.json`, `start.json`, `reality.json`, `tracker.json`, `screenshots/final/lighthouse.md`

**Interfaces:**
- Consumes: the production server from Task 3's build.
- Produces: `screenshots/final/lighthouse/home.json`, which Task 7's `scripts/measure.mjs` reads for the spec §1 Lighthouse row, and `lighthouse.md`, which Task 8 quotes.

**Gate (spec §1, §10, §14 row 9): accessibility ≥ 95 and performance ≥ 90 on `/` and `/start`.** `/reality` and `/tracker` are measured and recorded but do not gate — `/reality` is the chart-heaviest page and `/tracker` the most stateful, so their numbers are the useful outliers to know about.

- [ ] **Step 1: Serve a production build**

```bash
npm run build
npx next start
```

Never run Lighthouse against `npm run dev`. Dev mode compiles on demand and ships an unminified bundle; a performance score taken there measures the compiler, not the site.

- [ ] **Step 2: Run the four audits**

Lighthouse's default form factor is **mobile**, which is exactly what the spec asks for, so no preset flag is needed — passing `--preset=desktop` would silently answer a different question.

```bash
mkdir -p screenshots/final/lighthouse
for r in "home:/" "start:/start" "reality:/reality" "tracker:/tracker"; do
  name="${r%%:*}"; path="${r#*:}"
  npx --yes lighthouse@12 "http://localhost:3000${path}" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path="./screenshots/final/lighthouse/${name}.json" \
    --chrome-flags="--headless=new --no-sandbox" --quiet
done
```

Expected: four JSON files, roughly 1–3 MB each. Runs take 30–60 s per route.

Alternative if `npx lighthouse` cannot reach the registry: the chrome-devtools MCP `lighthouse_audit` tool against each URL with the mobile form factor and the same four categories. It returns the scores directly; you then write `lighthouse.md` from those numbers and note in it that no raw JSON was archived.

- [ ] **Step 3: Read the scores and the three vitals out of the JSON**

```bash
node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const routes = [["home","/"],["start","/start"],["reality","/reality"],["tracker","/tracker"]];
const cats = ["performance","accessibility","best-practices","seo"];
const vitals = ["largest-contentful-paint","cumulative-layout-shift","total-blocking-time","total-byte-weight"];
const rows = [];
for (const [name, path] of routes) {
  const r = JSON.parse(readFileSync(`screenshots/final/lighthouse/${name}.json`, "utf8"));
  const score = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
  const v = (k) => r.audits[k]?.displayValue ?? "n/a";
  rows.push({ name, path, perf: score("performance"), a11y: score("accessibility"),
              bp: score("best-practices"), seo: score("seo"),
              lcp: v(vitals[0]), cls: v(vitals[1]), tbt: v(vitals[2]), bytes: v(vitals[3]) });
}
const gated = new Set(["home","start"]);
const md = [
  "# Lighthouse — mobile preset, production build",
  "",
  "Run against `npx next start` with `npx lighthouse@12` (default form factor is mobile).",
  "Gate (spec §1, §10): accessibility ≥ 95 and performance ≥ 90 on `/` and `/start`.",
  "",
  "| Route | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | Total bytes | Gated |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map((x) => `| \\`${x.path}\\` | ${x.perf} | ${x.a11y} | ${x.bp} | ${x.seo} | ${x.lcp} | ${x.cls} | ${x.tbt} | ${x.bytes} | ${gated.has(x.name) ? "yes" : "no"} |`),
  "",
  "Budgets from spec §10: LCP < 2.5 s on mobile, CLS < 0.05.",
  "",
];
writeFileSync("screenshots/final/lighthouse.md", md.join("\n"));
console.log(md.join("\n"));
const failed = rows.filter((x) => gated.has(x.name) && (x.a11y < 95 || x.perf < 90));
if (failed.length) { console.error("GATE FAILED: " + failed.map((x) => `${x.path} a11y=${x.a11y} perf=${x.perf}`).join("; ")); process.exit(1); }
console.log("GATE PASSED");
'
```

Expected: the table, then `GATE PASSED`. If it prints `GATE FAILED`, go to Step 4 — do not continue with a failing score and do not soften the gate.

- [ ] **Step 4: Triage a missed target, then re-run**

Read the failing audits by name before changing anything:

```bash
node -e '
const r=require("./screenshots/final/lighthouse/home.json");
for (const [id,a] of Object.entries(r.audits)) {
  if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "notApplicable")
    console.log(String(Math.round(a.score*100)).padStart(3), id, "—", a.title);
}' | sort -n | head -25
```

Then work this table top to bottom. Each fix is small and local; none of them is a redesign.

| Symptom | Fix |
|---|---|
| **LCP > 2.5 s** | The hero image is the LCP element. Confirm `PageHero` still passes `priority` to `Figure` (`grep -n "priority" components/layout/page-hero.tsx components/ui/figure.tsx`). Then check the byte weight: spec §10 caps the hero at **120 KB at 1×** — `ls -l public/images/home-hero.*`. If it is heavier, re-run `npm run images:optimize` and rebuild. |
| **LCP > 2.5 s with a light hero** | Font blocking. Spec §4.1 preloads the two above-the-fold Cabinet Grotesk weights. Check `lib/fonts.ts` for `preload: true` on those two faces and `display: "swap"` on all of them; confirm in the Network panel that no font blocks first paint. |
| **CLS > 0.05** | An image without intrinsic dimensions or a ratio box. Every `Figure` on the failing route needs a `ratio`; the LCP audit's "Avoid large layout shifts" detail names the shifting element. Second most likely cause: a fallback font without `size-adjust` (spec §4.1) — check the `@font-face` fallback block in `app/globals.css`. |
| **TBT high / "Reduce unused JavaScript"** | A workshop became a client component that ships on a route that does not need it. Run `npm run build` and read the First Load JS column: `/`, `/start`, `/method`, and `/reality` must stay static with a small client payload. `grep -rn "use client" app/<route>/page.tsx` — a page file itself should almost never carry it; the interactive part belongs in its own component under `components/workshops/`. |
| **a11y < 95** | Read the failing audit names. The usual three: an image whose `alt` resolved empty (check the id exists in `data/visuals.json`), a heading-order jump (section headings `level={2}`, card titles `level={3}`), or a contrast failure — and since `verify:contrast` passes on every token pair, a contrast failure means a hand-written colour class escaped the token system. That one is a **Must fix** and also a `verify:primitives` gap worth noting. |
| **Score within 2 points of the gate** | Re-run the audit three times and take the median before concluding anything. Lighthouse performance is noisy on a laptop with a browser and three servers running. |

After any fix: rebuild, restart `next start`, re-run Steps 2 and 3, and keep only the final JSON.

- [ ] **Step 5: Record the fixes**

Anything changed in Step 4 goes into `DESIGN_REVIEW.md` under "Fixed during review", one line each, with the file and the before/after number. Keep a note now; Task 8 needs it.

- [ ] **Step 6: Stop the server and commit**

Ctrl-C `npx next start`.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/final/lighthouse screenshots/final/lighthouse.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(review): lighthouse mobile runs for /, /start, /reality, /tracker"
```

If Step 4 changed application code, commit that separately first, with a message naming the audit it fixed and the score delta.

---

### Task 6: Keyboard and screen-reader pass

**Parallel group:** D

**Files:**
- Create: `screenshots/final/keyboard.md`

**Interfaces:**
- Consumes: the production server.
- Produces: `screenshots/final/keyboard.md` — a pass/fail row per surface, which Task 8 copies into `DESIGN_REVIEW.md`.

This is a manual task, and it is the one that finds what Lighthouse cannot: Lighthouse scores static markup, but a focus trap that leaks, a dropdown that drops focus on Escape, or a toggle that resets on reload are all invisible to it.

**Setup.**

```bash
npm run build
npx next start
```

Screen reader: **NVDA** on Windows (free, nvaccess.org). Start it, then press `Insert+Space` once to leave browse mode where the instructions say "forms mode" — otherwise arrow keys move the virtual cursor instead of reaching the widget. On macOS use VoiceOver (`Cmd+F5`); `VO` below means `Ctrl+Option`.

**The mouse stays untouched for the whole pass.** If you reach for it, that row fails.

- [ ] **Step 1: Walk all twelve rows and record pass/fail**

| # | Surface | Route | Steps | Expected |
|---|---|---|---|---|
| 1 | Skip link | `/` | Load, press `Tab` once | The skip link is the **first** focusable element, visible on focus with a 2px `primary` ring at 2px offset. `Enter` moves focus into `<main id="main">`; the next `Tab` lands on content, not back in the header. |
| 2 | Header dropdown | `/` | `Tab` to "Learn", `Enter` | Panel opens. `ArrowDown` walks the rows in visual order and wraps or stops consistently; `ArrowUp` walks back; `Home`/`End` jump to first/last if implemented. `Esc` closes the panel **and returns focus to the "Learn" trigger**. `Tab` from the trigger moves to "Work", not into the closed panel. NVDA announces "Learn, button, collapsed" then "expanded". |
| 3 | Mobile drawer | `/` at 375px | `Tab` to the menu button, `Enter` | Drawer opens as a dialog. Focus moves inside. `Tab` reaches the CTA first, then each accordion header; `Tab` cycles inside the drawer and never reaches the page behind it. `Esc` closes and returns focus to the menu button. Background scroll is locked. |
| 4 | Search palette | `/` | `Ctrl+K` from anywhere | Dialog opens with focus in the input. Typing `salary` filters; `ArrowDown`/`ArrowUp` move the active option and NVDA announces each one (`aria-activedescendant` on a listbox); `Enter` navigates; `Esc` closes and focus returns to the search trigger. |
| 5 | Wizard | `/plan` | `Tab` through question 1, choose with `Space`, `Enter` on Next | Each choice is reachable and operable from the keyboard; the step change moves focus to the new step's heading or first control, not back to the top of the document; `Back` restores the previous answer. NVDA announces the new step. |
| 6 | Accordion | `/` FAQ | `Tab` to the first question, `Enter`, then `Space` | Native `<details>`: both keys toggle. In single-open mode, opening one closes its sibling and focus stays on the summary you pressed. NVDA announces "collapsed"/"expanded". |
| 7 | Dialog | any route with one (`/tracker` row editor, or `/dev/ui` in dev) | `Enter` to open | Focus lands inside; `Tab` cycles without escaping; `Shift+Tab` from the first element wraps to the last; `Esc` closes; focus returns to the trigger; the page behind does not scroll. |
| 8 | Tabs | `/build` (a lab) | `Tab` to the tablist, then arrows | Roving tabindex: one stop for the whole list. `→`/`←` move **and** select; `Home`/`End` jump; a disabled tab is skipped. NVDA announces "tab, selected, 2 of 4". |
| 9 | Quiz | any guide, e.g. `/method` | `Tab` to the first option | Options are reachable and selectable by keyboard; submitting announces the result and the per-option explanation without moving focus off the question; the "next review" state survives (row 12 re-checks). |
| 10 | Scenario | `/conduct` (The 11 pm request) | `Tab` to a choice, `Enter` | The consequence and the next node render and are announced — an `aria-live="polite"` region, or focus moved to the new node's heading. Reaching the debrief lists the path taken. No choice is mouse-only. |
| 11 | Annotated hotspots | Build Labs (`/build`) | `Tab` through the artifact | Hotspots are buttons in **reading order**; focus alone (not hover) reveals the "why" and "rule" text; the revealed text is announced. |
| 12 | `ReaderControls` persistence | footer, then any route | `Tab` to the controls, set font size L, toggle comfortable reading, toggle low-data | Each is operable by keyboard and announces its state. Then **reload the page**: all three settings survive, and they are applied before paint (no flash of the default size). Then navigate to another route: still applied. Low-data mode makes `Figure` render its caption placeholder instead of the image. |

Two checks that run across every row rather than in one:

- **Focus is always visible.** At no point may focus land on an element with no ring. A missing ring is a **Must fix**.
- **Touch targets ≥ 44px** (48px for header controls, spec §10). Spot-check the header search button, the drawer trigger, the CTA pill, and one `Switch` with DevTools' element box model.

- [ ] **Step 2: Write `screenshots/final/keyboard.md`**

```markdown
# Keyboard and screen-reader pass

Date <YYYY-MM-DD>. Production build via `npx next start`. Chrome <version> + NVDA <version>.
Mouse unused throughout.

| # | Surface | Route | Result | Note |
|---|---|---|---|---|
| 1 | Skip link | `/` | pass / fail | … |
| 2 | Header dropdown | `/` | | |
| 3 | Mobile drawer | `/` @375 | | |
| 4 | Search palette | `/` | | |
| 5 | Wizard | `/plan` | | |
| 6 | Accordion (FAQ) | `/` | | |
| 7 | Dialog | <route> | | |
| 8 | Tabs | `/build` | | |
| 9 | Quiz | <route> | | |
| 10 | Scenario | `/conduct` | | |
| 11 | Annotated hotspots | `/build` | | |
| 12 | `ReaderControls` persist across reload | footer | | |

Focus ring visible on every stop: yes / no — <detail>
Touch targets: header search <N>px, drawer trigger <N>px, CTA <N>px, Switch <N>px

## Failures

<one paragraph per failed row: what happened, the file most likely responsible,
and the severity — Must / Should / Could — using DESIGN_REVIEW's levels.>
```

Every row must carry a verdict. A blank cell is not a result.

- [ ] **Step 3: Fix only what is broken keyboard behaviour**

A failed row is an accessibility defect, and spec §10 makes the dropdown, drawer, palette, and accordion keyboard-complete by requirement. Fix those here — they are small, local changes inside one `components/ui` or `components/site` file. Re-run the failing row afterwards and update the verdict.

Anything that is a *design* observation rather than a defect (a label that reads oddly, a rhythm that feels cramped) goes into `DESIGN_REVIEW.md` under Should or Could and is **not** changed here.

- [ ] **Step 4: Stop the server and commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/final/keyboard.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(a11y): record the keyboard and screen-reader pass"
```

Commit any behaviour fix from Step 3 separately, naming the surface it repaired.

---

### Task 7: Measure every row of the spec §1 success-criteria table

**Parallel group:** D

**Files:**
- Create: `scripts/measure.mjs`, `screenshots/final/measurements.md`
- Modify: `package.json` (add the `measure` script)

**Interfaces:**
- Consumes: `screenshots/final/heights.json` (Task 4), `screenshots/final/lighthouse/home.json` (Task 5), `data/site.json`, `data/library.json`, `package.json`, `public/images/`, `components/diagrams/`, and the two verify scripts.
- Produces: `screenshots/final/measurements.md` — the "Measure | Before | After | Target" table that Task 8 pastes into `DESIGN_REVIEW.md` verbatim.

Nine rows, nine functions. The "Before" column is the spec's own "Today" column, hard-coded with a citation so the comparison is against what the spec claimed, not against a fresh guess.

- [ ] **Step 1: Write `scripts/measure.mjs`**

```js
#!/usr/bin/env node
// Measures every row of spec §1 (docs/superpowers/specs/2026-08-21-ui-overhaul-design.md).
//
//   node scripts/measure.mjs              # measure, write the table, exit 1 on a missed target
//   node scripts/measure.mjs --report-only  # measure and write, always exit 0
//
// Depends on artifacts produced earlier in Phase 9:
//   screenshots/final/heights.json          (scripts/shoot.mjs)
//   screenshots/final/lighthouse/home.json  (npx lighthouse)
// A missing artifact is reported as "not measured", never guessed.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

const OUT = join("screenshots", "final", "measurements.md");
const HEIGHTS = join("screenshots", "final", "heights.json");
const LIGHTHOUSE = join("screenshots", "final", "lighthouse", "home.json");
const SCREEN_PX = 800;

/** Spec §1, the "Today" column. Quoted, not re-derived. */
const BEFORE = {
  screens: "~20 screens",
  nav: "5 + 31-link menu",
  clicks: "up to 3 (menu → group → link)",
  accentMaps: "14",
  rawCards: "128",
  iconLibs: "2 (lucide + Phosphor)",
  visuals: "0 / 0",
  contrast: "pass",
  lighthouse: "unmeasured",
};

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function walk(dir, exts, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function runScript(file) {
  try {
    return { out: execFileSync(process.execPath, [file], { encoding: "utf8" }), ok: true };
  } catch (error) {
    return { out: `${error.stdout ?? ""}${error.stderr ?? ""}`, ok: false };
  }
}

// 1 — Homepage length at 1280px.
function homepageScreens() {
  if (!existsSync(HEIGHTS)) {
    return { after: "not measured", ok: false, note: "run `node scripts/shoot.mjs` first" };
  }
  const entry = readJson(HEIGHTS)["home-1280"];
  if (!entry || !entry.height) {
    return { after: "not measured", ok: false, note: "no home-1280 entry in heights.json" };
  }
  const screens = entry.height / SCREEN_PX;
  return {
    after: `${screens.toFixed(1)} screens (${entry.height}px ÷ ${SCREEN_PX})`,
    ok: screens <= 8,
    note: "",
  };
}

// 2 — Top-level nav items.
function navItems() {
  const site = readJson(join("data", "site.json"));
  if (!Array.isArray(site.nav)) {
    return { after: "data/site.json has no `nav` array", ok: false, note: "Phase 2 incomplete" };
  }
  const top = site.nav.length;
  const cta = site.cta && site.cta.href ? 1 : 0;
  const menuLinks = site.nav.reduce(
    (n, item) => n + (item.groups ?? []).reduce((m, g) => m + (g.links ?? []).length, 0),
    0,
  );
  return {
    after: `${top} + search + ${cta} CTA (${menuLinks} links behind the dropdowns)`,
    ok: top === 4 && cta === 1,
    note: "",
  };
}

// 3 — Clicks from home to any route.
function clicksToAnyRoute() {
  const site = readJson(join("data", "site.json"));
  const lib = readJson(join("data", "library.json"));
  const entries = (lib.entries ?? lib).filter((e) => !e.pending);

  const one = new Set(["/"]);
  const two = new Set();
  for (const item of site.nav ?? []) {
    if (item.href) one.add(item.href);
    for (const group of item.groups ?? []) {
      for (const link of group.links ?? []) if (!link.pending) two.add(link.href);
    }
  }
  // The footer surfaces every navGroups link and the secondary links in one click.
  for (const group of site.navGroups ?? []) {
    for (const link of group.links ?? []) if (!link.pending) one.add(link.href);
  }
  for (const link of site.secondary ?? []) if (!link.pending) one.add(link.href);
  if (site.cta && site.cta.href) one.add(site.cta.href);
  one.add("/library");
  one.add("/privacy");

  const libraryIsOneClick = one.has("/library");
  const worst = [];
  let max = 0;
  for (const entry of entries) {
    const clicks = one.has(entry.href) ? 1 : two.has(entry.href) ? 2 : libraryIsOneClick ? 2 : 3;
    if (clicks > max) max = clicks;
    if (clicks > 2) worst.push(entry.href);
  }

  // Cross-check: a route that exists but is absent from the IA is unreachable at any depth.
  const EXEMPT = new Set(["/", "/path", "/privacy"]);
  const routes = walk("app", ["page.tsx"])
    .map((f) => {
      const parts = f.split(sep).slice(1, -1).filter((p) => !p.startsWith("("));
      return "/" + parts.join("/");
    })
    .filter((r) => !r.startsWith("/dev") && !r.startsWith("/educators/kit"));
  const known = new Set([...one, ...two, ...entries.map((e) => e.href)]);
  const missing = routes.filter((r) => !EXEMPT.has(r) && !known.has(r));

  return {
    after: `${max} click${max === 1 ? "" : "s"} worst case across ${entries.length} library routes`,
    ok: max <= 2 && missing.length === 0,
    note: [
      worst.length ? `over budget: ${worst.join(", ")}` : "",
      missing.length ? `routes absent from the IA: ${missing.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; "),
  };
}

// 4 — Inline accent maps outside lib/accent.ts.
function accentMaps() {
  const re = /const\s+accent(Text|Bar|Soft|Border)\b/g;
  const skip = [join("lib", "accent.ts"), join("lib", "accent.test.ts")];
  const hits = [];
  for (const dir of ["app", "components", "lib"]) {
    for (const file of walk(dir, [".ts", ".tsx"])) {
      if (skip.includes(file)) continue;
      const source = readFileSync(file, "utf8");
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(source)) !== null) hits.push(file);
    }
  }
  return { after: String(hits.length), ok: hits.length === 0, note: [...new Set(hits)].join(", ") };
}

// 5 — Raw card/border patterns in app/.
function rawCardPatterns() {
  const { out } = runScript(join("scripts", "verify-primitives.mjs"));
  const lines = out.split("\n").filter((l) => l.includes("[raw-card]"));
  return { after: String(lines.length), ok: lines.length === 0, note: lines.slice(0, 5).join(" | ") };
}

// 6 — Icon libraries.
function iconLibraries() {
  const KNOWN = ["lucide-react", "@phosphor-icons/react", "react-icons", "@heroicons/react", "phosphor-react"];
  const pkg = readJson("package.json");
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const found = KNOWN.filter((name) => name in deps);
  return { after: `${found.length} (${found.join(", ") || "none"})`, ok: found.length === 1, note: "" };
}

// 7 — First-party images and diagrams.
function firstPartyVisuals() {
  const images = existsSync(join("public", "images"))
    ? readdirSync(join("public", "images")).filter((f) => f.endsWith(".jpg")).length
    : 0;
  const dir = join("components", "diagrams");
  const diagrams = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".tsx") && !/^(index|types)\./.test(f)).length
    : 0;
  return {
    after: `${images} images / ${diagrams} diagrams`,
    ok: images >= 10 && diagrams >= 8,
    note: "charts under components/diagrams/charts/ are counted separately and excluded",
  };
}

// 8 — WCAG AA contrast.
function contrast() {
  const { out, ok } = runScript(join("scripts", "verify-contrast.mjs"));
  const line = out.split("\n").find((l) => l.includes("Contrast")) ?? out.trim().split("\n")[0] ?? "";
  return { after: ok ? `pass — ${line.trim()}` : `FAIL — ${out.trim()}`, ok, note: "" };
}

// 9 — Lighthouse, mobile home.
function lighthouse() {
  if (!existsSync(LIGHTHOUSE)) {
    return { after: "not measured", ok: false, note: "run the Task 5 lighthouse commands first" };
  }
  const report = readJson(LIGHTHOUSE);
  const score = (k) => Math.round((report.categories[k]?.score ?? 0) * 100);
  const a11y = score("accessibility");
  const perf = score("performance");
  const lcp = report.audits["largest-contentful-paint"]?.displayValue ?? "n/a";
  const cls = report.audits["cumulative-layout-shift"]?.displayValue ?? "n/a";
  return {
    after: `a11y ${a11y} / perf ${perf} (LCP ${lcp}, CLS ${cls})`,
    ok: a11y >= 95 && perf >= 90,
    note: "",
  };
}

const ROWS = [
  ["Homepage length, 1280px", BEFORE.screens, "≤ 8 screens", homepageScreens],
  ["Top-level nav items", BEFORE.nav, "4 + search + 1 CTA", navItems],
  ["Clicks from home to any route", BEFORE.clicks, "≤ 2", clicksToAnyRoute],
  ["Inline accent maps outside `lib/accent.ts`", BEFORE.accentMaps, "0 (enforced)", accentMaps],
  ["Raw card/border patterns in `app/`", BEFORE.rawCards, "0 (enforced)", rawCardPatterns],
  ["Icon libraries", BEFORE.iconLibs, "1 (Phosphor)", iconLibraries],
  ["First-party images / diagrams", BEFORE.visuals, "≥ 10 / ≥ 8", firstPartyVisuals],
  ["WCAG AA contrast (`verify:contrast`)", BEFORE.contrast, "pass", contrast],
  ["Lighthouse a11y / perf (home, mobile)", BEFORE.lighthouse, "≥ 95 / ≥ 90", lighthouse],
];

const reportOnly = process.argv.includes("--report-only");
const results = ROWS.map(([measure, before, target, fn]) => {
  let r;
  try {
    r = fn();
  } catch (error) {
    r = { after: `error: ${error.message}`, ok: false, note: "" };
  }
  return { measure, before, target, ...r };
});

const lines = [
  "# Success criteria — spec §1, measured",
  "",
  "Generated by `node scripts/measure.mjs`. The **Before** column is the spec's own",
  '"Today" column, quoted rather than re-derived. Every **After** value is read from the',
  "tree or from a committed Phase 9 artifact.",
  "",
  "| Measure | Before | After | Target | |",
  "|---|---|---|---|---|",
  ...results.map(
    (r) => `| ${r.measure} | ${r.before} | ${r.after} | ${r.target} | ${r.ok ? "✓" : "✗"} |`,
  ),
  "",
];
const notes = results.filter((r) => r.note);
if (notes.length) {
  lines.push("## Notes", "");
  for (const r of notes) lines.push(`- **${r.measure}:** ${r.note}`);
  lines.push("");
}

mkdirSync(join("screenshots", "final"), { recursive: true });
writeFileSync(OUT, lines.join("\n"));
console.log(lines.join("\n"));

const missed = results.filter((r) => !r.ok);
if (missed.length && !reportOnly) {
  console.error(`\n${missed.length} target(s) missed: ${missed.map((r) => r.measure).join("; ")}`);
  process.exit(1);
}
```

- [ ] **Step 2: Add the npm script**

In `package.json`, next to `shoot`:

```json
"measure": "node scripts/measure.mjs",
```

- [ ] **Step 3: Run it**

```bash
npm run measure; echo "exit=$?"
```

Expected: the nine-row table, then `exit=0`. `screenshots/final/measurements.md` now exists.

- [ ] **Step 4: Resolve every ✗ before continuing**

| Row shows ✗ | What it means and what to do |
|---|---|
| Homepage length | The homepage exceeds 8 screens at 1280px. This is a spec §1 target and a **Must fix**: the eight-section blueprint is intact but a section grew. Find the tallest section in `screenshots/final/home-1280.png` and report it — do not restructure the page in Phase 9; hand the finding back with the measured height. |
| Top-level nav items | `site.nav` is not 4 items, or `site.cta` is missing. Phase 2 gap. |
| Clicks | Either a library route is unreachable in two clicks, or the note lists an `app/` route absent from the IA. Both are **Must fix** — add the missing route to `data/site.json` and `data/library.json` (that is data, not design) and re-run. |
| Accent maps / raw cards | `verify:primitives --strict` passed in Task 3, so a ✗ here means Task 3's strict switch never got made. Go back to Task 3 Step 1. |
| Icon libraries | More than one icon package survives. Task 1 Step 6 should have removed `lucide-react`; re-run it. |
| Images / diagrams | Below the ≥ 10 / ≥ 8 floor. Count what is actually there and record the shortfall as a **Should fix** with the real number — spec §7.2 lists a nine-diagram first wave, and a genuine shortfall is a finding, not something to paper over. |
| Contrast | `verify:contrast` fails. **Must fix**, and it also means Task 3's gate was not actually green. |
| Lighthouse | Task 5's gate did not pass or its JSON is missing. Go back to Task 5. |

`--report-only` exists for a re-run while you work through a fix; the committed run must be the one that exits 0, or the table must carry an honest ✗ with the finding written up in `DESIGN_REVIEW.md`. Never edit `measurements.md` by hand.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/measure.mjs package.json screenshots/final/measurements.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(review): measure every spec §1 success criterion from the tree"
```

---

### Task 8: Documentation

**Parallel group:** E

**Files:**
- Rewrite: `DESIGN_REVIEW.md`
- Modify: `README.md` (Routes, Design, Run sections), `BUILD_GUIDE.md` (stale transition lines)
- Modify: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md:4` (status line)
- Modify: `docs/superpowers/plans/2026-08-21-ui-overhaul-*.md` (any missing Status block)

**Interfaces:**
- Consumes: `screenshots/final/gate.md`, `INDEX.md`, `lighthouse.md`, `keyboard.md`, `measurements.md`, and the triage notes from Tasks 1, 2, and 5.
- Produces: the published review Task 9's PR description links to.

Spec §15 names the four documents to update. This task does all four plus the plan Status blocks.

- [ ] **Step 1: Gather every artifact into one view**

```bash
cat screenshots/final/measurements.md
cat screenshots/final/lighthouse.md
cat screenshots/final/keyboard.md
sed -n '1,40p' screenshots/final/INDEX.md
cat screenshots/final/gate.md
```

Everything that follows is transcription from these five files. If a number you want is not in one of them, it was not measured — say "not measured", or go measure it.

- [ ] **Step 2: Write `DESIGN_REVIEW.md` v2**

Replace the whole file. The v1 structure is kept — screenshots table, summary, must/should/could, fixed during review, what works — because it is a good shape and the reader may be comparing the two.

````markdown
# Design Review: Hire From PH, UI overhaul

Reviewed against: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`, `BUILD_GUIDE.md`, `README.md`

Design system: Inter (text) × Cabinet Grotesk (display), navy ink on white paper with
lavender bands, one blue-violet primary (`#4B4EF6`) and four semantic accents, 8/12/20px
radii, bordered cards, no scroll motion.

Date: <YYYY-MM-DD> · Branch `redesign/ui-overhaul` · Commit `<short sha>`
Supersedes the 2026-08-17 audit of the pre-overhaul site.

## Screenshots captured

Full matrix and page heights: [`screenshots/final/INDEX.md`](screenshots/final/INDEX.md).

| Set | Widths | Files |
| --- | --- | --- |
| `/` home | 375 · 768 · 1280 · 1536 | `screenshots/final/home-*.png` |
| `/start` stage template | 375 · 768 · 1280 · 1536 | `screenshots/final/start-*.png` |
| `/method` guide with diagram | 375 · 768 · 1280 · 1536 | `screenshots/final/method-*.png` |
| `/reality` data page | 375 · 768 · 1280 · 1536 | `screenshots/final/reality-*.png` |
| `/tracker` workshop | 375 · 768 · 1280 · 1536 | `screenshots/final/tracker-*.png` |
| `/library` index | 375 · 768 · 1280 · 1536 | `screenshots/final/library-*.png` |
| `/dev/ui` component gallery | 375 · 768 · 1280 · 1536 | `screenshots/final/dev-ui-*.png` |
| `/practice`, `/glossary`, `/educators` | 375 · 1280 | `screenshots/final/{practice,glossary,educators}-*.png` |
| Header dropdown open | 1280 | `screenshots/final/nav-dropdown-1280.png` |
| Mobile drawer open | 375 | `screenshots/final/mobile-drawer-375.png` |
| Search palette open | 1280 | `screenshots/final/search-palette-1280.png` |

<If any page tiled: "The <N> pages taller than 16,000px are split into `-partN` files;
Chrome cannot rasterise a taller bitmap in one pass.">

## Summary

<Three paragraphs, written after reading the screenshots — not before.
Paragraph 1: what the overhaul changed and whether the calm-education aesthetic landed.
Paragraph 2: the measured result — quote the two or three numbers that matter most from
the table below.
Paragraph 3: the one editorial or structural question left open, stated as a product
decision rather than a cosmetic patch. The v1 review's closing question was homepage
weight; say plainly whether that is now resolved.>

## Success criteria, measured

<Paste `screenshots/final/measurements.md`'s table verbatim, from the `| Measure |`
header row through the last row. Do not retype it and do not round anything.>

Source: [`screenshots/final/measurements.md`](screenshots/final/measurements.md).

## Performance and accessibility

<Paste the table from `screenshots/final/lighthouse.md`.>

Budgets (spec §10): LCP < 2.5 s on mobile, CLS < 0.05, Lighthouse a11y ≥ 95 and perf ≥ 90
on `/` and `/start`. Raw reports: `screenshots/final/lighthouse/*.json`.

## Keyboard and screen-reader pass

<Paste the twelve-row table from `screenshots/final/keyboard.md`.>

Full notes: [`screenshots/final/keyboard.md`](screenshots/final/keyboard.md).

## Must fix

<Numbered. Each item: what is wrong, the screenshot or audit that shows it, the file and
line, and why it blocks. "None remain" is a valid answer only if it is true — a Must-fix
list that is empty because nothing was looked for is worse than a long one.>

## Should fix

<Numbered. Quality and consistency issues that do not block. Include here anything Task 1
found still importing a shim, anything Task 3 found unwired in `verify:all`, and any
shortfall against the ≥ 10 images / ≥ 8 diagrams floor.>

## Could improve

<Numbered. Taste and second-wave ideas. The deferred items in spec §7.4 and §7.5 belong in
the PR description's follow-ups, not here — this section is for things about what shipped.>

## Fixed during review

<One line per fix made inside Phase 9, each with the file. Expected entries:
- the service-worker cache strategy (`public/sw.js`) — see below
- any Lighthouse triage fix from Task 5 Step 4, with the score delta
- any keyboard defect from Task 6 Step 3
- the shims, components, and npm packages the dead-file sweep removed (Task 1)>

**Service worker.** The shipped worker cached every asset with an image, font, or script
extension cache-first. That is correct for `/_next/static/**`, which Next content-hashes,
and wrong for `public/images/**` and `public/kit/**`, whose URLs are stable while their
bytes are not: a visitor from before the overhaul would have kept the old hero photograph
indefinitely. `public/sw.js` now runs three strategies — cache-first for hashed assets,
stale-while-revalidate for first-party images, kit PDFs, the favicon and the manifest, and
network-first for documents — and the cache name moved to `hfph-v2`, which purges every
`hfph-v1` cache on activation.

## What works well

<Two or three paragraphs on what the redesign got right, grounded in specific screenshots.
Candidates worth checking before you write: the eight-section homepage against the v1
twenty-screen catalogue; two-click navigation replacing the 31-link mega-menu; bordered
cards and a single primary reading as calm at 1536; first-party photography with its
illustrative captions; the honesty rule holding through the whole redesign — every number
still carries its `Source`.>
````

Three rules for filling it in:

1. **Every number is transcribed, never remembered.** If it is not in one of the five artifacts, it does not go in.
2. **Severity uses the project's own levels** (`~/.claude/rules/ecc/common/code-review.md`): CRITICAL/Must blocks, HIGH/Should warns, MEDIUM–LOW/Could is optional.
3. **No fabricated praise.** "What works well" cites a screenshot for each claim, the same standard the site holds its own copy to.

- [ ] **Step 3: Rewrite the `README.md` Routes table**

Replace the whole `## Routes` section with a grouped table matching the shipped IA (spec §6.1). Add `/library`, `/practice`, `/glossary`, `/educators`; group the rest the way the header does.

```markdown
## Routes

**The path** — five stages, eleven steps.

| Route | What it is |
|---|---|
| `/` | Home — hero, how it works, the path, lanes, what you'll build, the standard, FAQ |
| `/start` | Stage 1 — set up a workspace and build proof before applying |
| `/get-hired` | Stage 2 — source leads, track applications, close the offer |
| `/deliver` | Stage 3 — onboard, write SOPs, communicate so clients keep you |
| `/level-up` | Stage 4 — specialise, automate, raise your rate on evidence |
| `/own` | Stage 5 — go direct, register with the BIR, grow into an end-goal role |
| `/path` | Personalized dashboard (progress, next moves, toolkit, weekly reflection) |
| `/plan` | Interactive 30-day plan wizard, exportable to calendar and Markdown |

**Learn — build skills.**

| Route | What it is |
|---|---|
| `/method` | The seven core methods — find, deconstruct, learn, vet, ask, unstick, give |
| `/ai-first` | Working AI-first without outsourcing your judgment |
| `/learn` | How to learn — what the evidence on studying actually supports |
| `/tasks` | Micro-tasks — real jobs you can do today, each finishing as a portfolio piece |
| `/build` | Build labs — write your own resume, portfolio, and SOPs from a blank page |
| `/tools` | The transferable method for learning any tool fast |
| `/portfolio` | The portfolio ladder |
| `/prompts` | AI leverage — learn to write your own prompts |
| `/equipment` | Interactive equipment checker with ₱ estimates |

**Learn — work like a professional.**

| Route | What it is |
|---|---|
| `/indispensable` | Become indispensable |
| `/english` | English at work — the habits that make fluent English read as junior |
| `/conduct` | Conduct & integrity — cases, do's and don'ts, and an oath you write yourself |
| `/simulator` | Career simulator — model 3 years; generalist flatline against a specialist curve |
| `/resources` | Resource shelf |

**Work — get hired.**

| Route | What it is |
|---|---|
| `/apply` | Source and vet opportunities yourself — search operators, red flags |
| `/interview` | Interview prep |
| `/tracker` | Application pipeline with a follow-up radar |
| `/niches` | Niche explorer + a weighted rubric to evaluate any niche yourself |

**Work — get paid and stay.**

| Route | What it is |
|---|---|
| `/salary` | Salary guide, with every figure sourced and vendor-grade data labelled |
| `/markets` | Client markets and timezone overlap |
| `/clients` | Own your clients — agency versus direct |
| `/legit` | Get legit — BIR, 8%, receipts, PhilHealth |
| `/languages` | Language premium + where to learn free in PH (TESDA, Japan Foundation) |

**Everything else.**

| Route | What it is |
|---|---|
| `/reality` | **Reality check** — sourced market data, what AI is doing to this work, and the claims nobody can back up |
| `/library` | The index — every route, filterable by group and type |
| `/practice` | Retrieval practice — what's due, decks, quiz history, streak |
| `/glossary` | A–Z of the terms the guides use, with Taglish glosses |
| `/educators` | The educator kit — doctrine, path map, run-sheets and slides as printable PDFs (CC BY 4.0) |
| `/privacy` | Privacy |
| `/dev/ui` | Component gallery. Development only — returns 404 in production, excluded from the sitemap |
```

Before committing, verify the table against reality:

```bash
find app -name "page.tsx" | sed 's|^app/||; s|/page.tsx$||; s|^|/|' | grep -v "^/(dev)" | sort
grep -oE '^\| `/[a-z/-]*`' README.md | tr -d '|` ' | sort -u
```
Every route in the first list (except `/educators/kit/*`, which are print targets rather than reader destinations) must appear in the second.

- [ ] **Step 4: Update the `README.md` Design and Run sections**

The Design section already describes the new system; extend it to name the primitives and the enforcement, since that is what a new contributor needs:

```markdown
## Design

Inter (text) × Cabinet Grotesk (display), navy ink on white with lavender bands, one
blue-violet primary (`#4B4EF6`) and four semantic accents, 8/12/20px radii, bordered
cards, no scroll motion. Tokens live in `app/globals.css` and reach Tailwind v4 through
`@theme inline`.

Every page is composed from two barrels — `@/components/ui` (primitives) and
`@/components/layout` (page structure). `npm run verify:primitives` fails the build when a
page re-implements a card, an input, an accent map, or the type scale by hand. Browse them
all at `/dev/ui` in development.

Visuals are first-party: photoreal images in `public/images/` through the `Figure`
primitive (always captioned "Illustrative image"), and SVG diagrams in
`components/diagrams/` that read the CSS tokens. The overhaul spec is
`docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`; the review of what shipped is
`DESIGN_REVIEW.md`. Shared conventions are in `BUILD_GUIDE.md` — **read it before building
any page.**
```

And the Run section, which must list every script a contributor will actually need:

```markdown
## Run

```bash
npm install
npm run dev                          # http://localhost:3000
npm run build                        # production build
set PORT=3000 && npx next start      # serve the build (Windows: PORT env, not -p)

npm test                             # node --test math suites + vitest component suites
npm run verify:all                   # contrast, claims, links, voice, kit, eslint, tsc, primitives
npm run verify:contrast              # WCAG AA over the tokens in app/globals.css
npm run verify:primitives            # fails when a page bypasses components/ui or layout

npm run images:optimize              # raw PNGs in design/images/raw → public/images/ + visuals.json
npm run kit:build                    # re-render public/kit/*.pdf from data/educators.json
npm run voice:lint                   # aphorism-cadence audit over data/*.json
npm run shoot                        # screenshot matrix into screenshots/final/
npm run measure                      # spec §1 success criteria → screenshots/final/measurements.md
```
```

Cross-check that every script named above exists, and drop any line that does not:

```bash
node -e "const s=require('./package.json').scripts;for(const k of ['dev','build','test','verify:all','verify:contrast','verify:primitives','images:optimize','kit:build','voice:lint','shoot','measure']) console.log((k in s ? 'ok  ' : 'MISSING '), k);"
```

**The honesty rule section is not touched.** It is the doctrine, it is still true, and it reads exactly as it should.

- [ ] **Step 5: `BUILD_GUIDE.md` final read-through**

The guide was written to carry the site *through* the migration, so it is full of transition scaffolding that is now false. Find every line and fix it:

```bash
grep -n "Phase 5\|being removed\|until Phase\|Deprecated\|no-op\|pre-overhaul\|lucide\|Reveal\|primaryNav\|Marquee\|ButtonLink\|ArrowLink\|\bPill\b" BUILD_GUIDE.md
```

| Line to fix | Fix |
|---|---|
| Header paragraph: "Phosphor icons via `components/icon.tsx` (lucide is being removed; add no new lucide imports)" | "Phosphor icons via `Icon` from `@/components/ui`." Lucide is gone; a warning about it dates the document. |
| "Legacy helpers `.kicker`, `.font-display`, `.link-sweep` remain until Phase 5." | Delete, or list only the helpers that actually survive. Check with `grep -n "\.kicker\|\.link-sweep\|\.font-display" app/globals.css`. |
| Radius note: "Tailwind's default `rounded-*` scale is not wiped in this phase" | Delete. Phase 5 wiped it; the token list above it is the whole story. |
| The "Deprecated, kept only so pre-overhaul pages compile (Phase 5 deletes them)" block — `Pill`, `ButtonLink`, `ArrowLink`, `Marquee`, `Reveal`, the old `PageHero`/`SectionHeading` | Delete the whole block. Task 1 deleted the code; a guide that documents deleted exports sends the next contributor looking for them. |
| The "Page shell pattern" code sample wrapping raw `<h1 className=…>` in `<Reveal>` | Replace with the shipped pattern: `<PageHero breadcrumb={…} kicker="…" title="…" lead={intro} />` inside the archetype from spec §8.3. |
| `site.json` shape line naming `primaryNav` | Update to the shipped shape: `nav`, `navGroups`, `cta`. |
| "Data shapes" list | Add the files Phases 6–7 introduced: `faq.json`, `library.json`, `visuals.json`, `home.json`, `practice.json`, `decks.json`, `scenarios.json`, `annotated.json`, `glossary.json`, `reflection.json`, `tldr.json`, `educators.json`. Compare against `ls data/`. |
| "Reference implementation for tone & polish: `app/page.tsx`" | Still correct — the homepage is the eight-section reference. Leave it. |

Also confirm the two doctrine amendments the spec required actually landed, and add them if not:

```bash
grep -n "hotlinked\|Illustrative image" BUILD_GUIDE.md          # spec §7.1 images rule
grep -n "export is for what the user wrote" BUILD_GUIDE.md      # spec §7.4.4 export rule
grep -n "facilitator more capable\|teaching material" BUILD_GUIDE.md  # spec §7.5 kit clarification
```
Each should print at least one line. A missing one is a Phase 6 or 7 gap — add the sentence from the spec section named beside it and note it in `DESIGN_REVIEW.md` under Should fix.

- [ ] **Step 6: Flip the spec's status line**

`docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` line 4 currently reads `**Status:** Design, awaiting approval`. Replace with:

```markdown
**Status:** Implemented 2026-08-21; see DESIGN_REVIEW.md
```

Leave everything else in the spec alone — including §16's open questions and the approval line at the bottom. The spec is the record of what was decided, not a living document.

- [ ] **Step 7: Make sure every plan carries a Status block**

```bash
grep -L "^## Status" docs/superpowers/plans/2026-08-21-ui-overhaul-*.md
```
Expected: no output. For any file listed, append a Status block in the shape Phase 1 used — a gate table, a "Delivered" paragraph, a "Deferred" paragraph — filled from that phase's own commits:

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite log --oneline --reverse master..HEAD -- <the paths that phase owned>
```

Do not invent results for a phase you did not run. If a phase's outcome cannot be reconstructed from its commits, write "Status recorded retroactively in Phase 9 from the commit log; per-task gate results were not captured at the time" and list the commits. That is honest and useful; a fabricated gate table is neither.

- [ ] **Step 8: Verify the docs do not break the link audit**

`verify:links` reads `data/` and source files, not markdown, so README and DESIGN_REVIEW links are not covered by it. Check the relative links by hand:

```bash
for p in screenshots/final/INDEX.md screenshots/final/measurements.md screenshots/final/keyboard.md docs/superpowers/specs/2026-08-21-ui-overhaul-design.md BUILD_GUIDE.md README.md; do
  [ -f "$p" ] && echo "ok   $p" || echo "MISS $p"
done
npm run verify:all
```
Expected: six `ok` lines and a green gate.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add DESIGN_REVIEW.md README.md BUILD_GUIDE.md docs/superpowers/specs/2026-08-21-ui-overhaul-design.md docs/superpowers/plans
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs: DESIGN_REVIEW v2, README routes and run sections, build guide read-through

Spec status flipped to implemented. Every number in the review is transcribed
from an artifact under screenshots/final/."
```

---

### Task 9: Branch finish — the PR description, and stop

**Parallel group:** F (last)

**Files:**
- Create: `docs/superpowers/PR-ui-overhaul.md`

**Interfaces:**
- Consumes: the commit log of `redesign/ui-overhaul`, the Status blocks in every plan, the artifacts under `screenshots/final/`, and the SDD ledgers under `.superpowers/sdd/*/progress.md`.
- Produces: the document the user reads before deciding whether to merge.

**Nothing is squashed, nothing is pushed, nothing is merged.** The branch history is the record of ten phases and it stays intact. Integration is the user's call; see `superpowers:finishing-a-development-branch` when they make it.

- [ ] **Step 1: Pull the commit log and split it by phase**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite log --oneline --reverse master..redesign/ui-overhaul | tee /tmp/branch-log.txt
wc -l < /tmp/branch-log.txt
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite merge-base master redesign/ui-overhaul
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite diff --stat master...redesign/ui-overhaul | tail -1
```

Map commits to phases using two sources, in this order:

1. **The plan Status blocks.** Task 8 Step 7 guaranteed each plan has one, and Phase 1's records its first and last commit. Those are authoritative.
2. **The commit log's boundaries.** Each phase opens with its first feature commit and closes with a `chore(phase-N)` / `docs(plan)` commit. `grep -nE "phase|plan" /tmp/branch-log.txt` finds the seams.

Record the range as `<first>..<last>` per phase, and count the commits in each:

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rev-list --count <first>..<last>
```

- [ ] **Step 2: Read the SDD ledgers and extract every deferred and parked item**

The per-phase ledgers hold the decisions that were made *during* implementation and never made it into a plan or a commit message. They are the only place the deferred minors exist.

```bash
ls .superpowers/sdd/*/progress.md
grep -rniE "minor \(deferred[^)]*\)|\bparked\b" .superpowers/sdd/*/progress.md | tee /tmp/deferred.txt
wc -l < /tmp/deferred.txt
```

**`.superpowers/` is git-ignored.** The ledgers exist only on this machine, so the PR description cannot link to them — every line must be **inlined** into the document. Copy each hit into `/tmp/deferred.txt`, then group them by phase and rewrite each into one readable sentence that names the file or component it concerns. Do not summarise the list down; a deferred minor that nobody wrote down is a bug nobody will find.

Two shapes you will see in the ledgers, both of which count:

- `Minor (deferred): <thing>` — a reviewer finding accepted as not-now.
- `Parked (plan-mandated): <thing> — RULING: <decision>` — a conflict between a review and the plan, resolved in the plan's favour.

If `grep` returns nothing, do not conclude there was nothing deferred — check that the ledgers exist at all (`ls .superpowers/sdd/`). Absent ledgers for Phases 5–8 mean those phases ran without one; say so in the PR description rather than implying a clean slate.

- [ ] **Step 3: Write `docs/superpowers/PR-ui-overhaul.md`**

````markdown
# UI/UX overhaul — Hire From PH

Branch `redesign/ui-overhaul` → `master`. <N> commits, <N> files changed.
Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (approved 2026-08-21).
Review: [`DESIGN_REVIEW.md`](../../DESIGN_REVIEW.md).

## Summary

A full visual and structural redesign of the site shell, design system, navigation,
homepage, stage template, and every interior page. All learning content is preserved;
no route was removed. New routes: `/library`, `/practice`, `/glossary`, `/educators`
(+ its print-only `kit/*` routes), and a development-only `/dev/ui` gallery.

What changed, in one line each:

- **Design system.** Inter × Cabinet Grotesk, a light vibrant palette on one blue-violet
  primary, 8/12/20px radii, bordered cards. The global `border-radius !important` hack is
  gone.
- **One component library.** `@/components/ui` and `@/components/layout` replace 128
  inline card patterns, 14 duplicated accent maps, and 37 hand-rolled buttons.
  `verify:primitives` fails the build when a page bypasses them.
- **Navigation.** Four top-level items with dropdowns and a `/library` index replace five
  links plus a 31-link mega-menu. Every route is two clicks from home.
- **Homepage.** Eight sections, down from roughly twenty screens of catalogue.
- **A visual layer.** First-party photography through `Figure` (always captioned
  "Illustrative image") and SVG diagrams that read the CSS tokens.
- **A practice layer.** Retrieval quizzes, flashcard decks, branching scenarios, annotated
  worked examples, exports, reflection, glossary, and reader accessibility controls.
- **An educator kit.** Doctrine, path map, method cheat-sheet, three workshop run-sheets
  and slides as printable PDFs under CC BY 4.0.
- **De-slop.** Blur blobs, the `Sparkles` icon, 59 hover lifts, the marquee, the squiggle
  underline, the dot grids and the abstract hero chart are all gone.

The honesty doctrine is unchanged and held throughout: no invented testimonials, no
learner counts, every statistic still carries a visible link to its primary source.

## Phases

| # | Phase | Commits | Range | Plan |
|---|---|---|---|---|
| 0 | Foundations | <n> | `<first>..<last>` | `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md` |
| 1 | Primitives and layout | | | `…-p1-primitives.md` |
| 2 | Navigation and IA | | | `…-p2-navigation.md` |
| 3 | Visual content pipeline | | | executed inside Phase 1; see that plan's ledger |
| 4 | Home and stage template | | | `…-p4-home-stages.md` |
| 5 | Interior migration | | | `…-p5-migration.md` |
| 6 | Practice layer | | | `…-p6-practice.md` |
| 7 | Educator kit | | | `…-p7-educators.md` |
| 8 | Copy pass | | | `…-p8-copy.md` |
| 9 | Verification and docs | | | `…-p9-verification.md` |

## Results

<Paste the measured table from `screenshots/final/measurements.md`.>

<Paste the Lighthouse table from `screenshots/final/lighthouse.md`.>

Gates on the final tree: `npm run verify:all` green, `npm test` green (<N> tests),
`npm run build` green (<N> routes). Details in
[`screenshots/final/gate.md`](../../screenshots/final/gate.md).

## Screenshots

Full matrix with page heights: [`screenshots/final/INDEX.md`](../../screenshots/final/INDEX.md)
— <N> captures across `/`, `/start`, `/method`, `/reality`, `/tracker`, `/library`,
`/dev/ui` at 375/768/1280/1536, `/practice`, `/glossary`, `/educators` at 375/1280, plus
the header dropdown, the mobile drawer, and the search palette open.

## How to verify

```bash
npm install
npm run verify:all      # contrast, claims, links, voice, kit, eslint, tsc, primitives
npm test                # node --test math suites + vitest component suites
npm run build
npm run measure         # re-derives every spec §1 row from the tree
```

Then serve and look:

```bash
npx next start          # http://localhost:3000
npm run dev             # /dev/ui — the component gallery, dev-only
```

Keyboard pass: the twelve-row checklist in
[`screenshots/final/keyboard.md`](../../screenshots/final/keyboard.md) reproduces the
manual accessibility review.

## Known follow-ups

**Deliberately deferred by the spec (second wave, §7.4 and §7.5).**

- Audio: read-aloud and speech drills (Web Speech API).
- Video: Remotion / Manim explainers generated from the diagram components.
- Sandboxes: formula playground (HyperFormula), typing test, live comms linter.
- Educator kit: editable PPTX / Google Slides export, translated editions, a facilitator
  feedback channel (needs a server).
- Second-wave diagrams (§7.2): `/plan` Gantt, an interactive `/niches` radar, a `/salary`
  pricing-model comparison, a `/legit` registration flow.
- The `og-default` composite in `app/opengraph-image.tsx` (Phase 4 left the Phase 0
  branded card in place deliberately; the JPEG is available at
  `public/images/og-default.jpg` for whoever revisits it).

**Needs a human.**

- **Tagalog TL;DRs are draft translations.** `data/tldr.json` carries `reviewed: false` on
  every entry and each block renders a "draft translation" note. A native speaker clears
  the flag; nothing else changes. Spec §7.4.7 and §16 Q10.
- **Content JSON voice.** The 30 content files got a mechanical banned-word sweep only. A
  real rewrite is a separate project (spec §11).

**Deferred minors carried out of the implementation ledgers.**

<Inline every `minor (deferred)` and `parked` line from `/tmp/deferred.txt`, grouped by
phase, each rewritten as one sentence naming the file or component. The ledgers live under
`.superpowers/sdd/*/progress.md`, which is git-ignored, so this list is the only copy that
travels with the branch. Example shape:

**Phase 1 — primitives.**
- `components/ui/button.tsx`: the `sm` size computes to 36px, under the 44px target; the
  plan mandated the size, so it was accepted for `sm` only.
- `components/ui/card.tsx`: `CardBody` inside a padded `Card` double-pads; documented in
  BUILD_GUIDE rather than guarded in code.
- `lib/utils.ts`: `cn()` has no `tailwind-merge`, so a later conflicting class does not
  reliably win.
>

**Findings from this review.**

<The Must and Should lists from `DESIGN_REVIEW.md`, one line each, or "none" if the Must
list is genuinely empty.>

## Not done here

The branch is not merged and not pushed. Nothing was squashed — the history is the record
of ten phases and each phase's plan is in `docs/superpowers/plans/`.
````

- [ ] **Step 4: Check the follow-ups list is complete**

Cross-check against the spec so nothing the spec deferred goes unlisted:

```bash
grep -n "Deferred\|deferred\|second wave\|Second wave" docs/superpowers/specs/2026-08-21-ui-overhaul-design.md
```
Every hit must be represented in the "Known follow-ups" section. Spec §2's non-goals, §7.2's second-wave candidates, §7.4's deferred list, §7.5's deferred list, and §16 Q10 are the five that matter.

- [ ] **Step 5: Commit the PR description**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add docs/superpowers/PR-ui-overhaul.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs: PR description for the UI overhaul branch

Inlines every deferred and parked item from the SDD ledgers, which are
git-ignored and would otherwise not travel with the branch."
```

- [ ] **Step 6: Final state check, then stop**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite status --porcelain
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite log --oneline -12
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite rev-parse --abbrev-ref HEAD
```
Expected: a clean tree, the Phase 9 commits at the top, and `redesign/ui-overhaul`.

**Do not run any of these.** They are for the user, and they go in the hand-back message, not in a terminal:

```bash
# merge, keeping the phase history
git checkout master && git merge --no-ff redesign/ui-overhaul

# or publish for review
git push -u origin redesign/ui-overhaul
gh pr create --base master --head redesign/ui-overhaul --body-file docs/superpowers/PR-ui-overhaul.md
```

- [ ] **Step 7: Hand back**

Report, in this order: the measured success-criteria table, the Lighthouse numbers, the
Must-fix list from `DESIGN_REVIEW.md` (or that it is empty), the three commands above, and
the sentence that the branch is unmerged and unpushed by design.

---

## Status

| # | Task | Group | Done |
|---|---|---|---|
| 1 | Dead-file sweep | A | [ ] |
| 2 | Service worker and caching | A | [ ] |
| 3 | The full static gate | B | [ ] |
| 4 | The screenshot matrix | C | [ ] |
| 5 | Lighthouse on four routes | C | [ ] |
| 6 | Keyboard and screen-reader pass | D | [ ] |
| 7 | Success-criteria measurement | D | [ ] |
| 8 | Documentation | E | [ ] |
| 9 | Branch finish | F | [ ] |

**Execution waves.** A → B → C → D → E → F. Tasks sharing a letter touch disjoint files and
can run in parallel. Task 3 waits for A because it gates the tree A modified; Tasks 4 and 5
both need the build Task 3 proved green; Task 7 reads artifacts from both C tasks; Task 8
reads everything; Task 9 is last.

**Phase 9 exit criteria (spec §14 row 9):**

- [ ] `npm run verify:all` green — recorded in `screenshots/final/gate.md`
- [ ] `npm test` green — record the total: ______ tests
- [ ] `npm run build` green — record the route count: ______
- [ ] `/dev/ui` and `/educators/kit/*` absent from `sitemap.xml`; `/dev/ui` 404s in production
- [ ] Six security headers still served on `/`
- [ ] Service worker cache bumped to `hfph-v2`; offline load of `/` verified after a fresh `next start`
- [ ] 37 screenshots in `screenshots/final/` with `INDEX.md` and `heights.json`
- [ ] Lighthouse mobile: `/` a11y ______ (≥ 95), perf ______ (≥ 90); `/start` a11y ______, perf ______
- [ ] Twelve-row keyboard checklist recorded, every row with a verdict
- [ ] `node scripts/measure.mjs` exits 0, or every ✗ is written up as a finding
- [ ] `DESIGN_REVIEW.md` v2 published with the measured table
- [ ] `README.md` routes / design / run sections current; `BUILD_GUIDE.md` free of transition scaffolding
- [ ] Spec status line reads "Implemented 2026-08-21; see DESIGN_REVIEW.md"
- [ ] `docs/superpowers/PR-ui-overhaul.md` written, with every ledger `minor (deferred)` and `parked` line inlined
- [ ] Branch unmerged, unpushed, unsquashed

---

## Self-review

Run against the spec with fresh eyes, per the writing-plans skill.

**1. Spec coverage.**

| Spec | Where |
|---|---|
| §1 row 1 — homepage ≤ 8 screens | Task 7 `homepageScreens()`, from Task 4's `heights.json` |
| §1 row 2 — 4 nav items + search + CTA | Task 7 `navItems()` |
| §1 row 3 — ≤ 2 clicks to any route | Task 7 `clicksToAnyRoute()`, incl. the routes-absent-from-the-IA cross-check |
| §1 row 4 — 0 inline accent maps | Task 7 `accentMaps()`; Task 3 Step 2 (`verify:primitives --strict`) |
| §1 row 5 — 0 raw card patterns | Task 7 `rawCardPatterns()`; Task 3 Step 2 |
| §1 row 6 — 1 icon library | Task 7 `iconLibraries()`; Task 1 Step 6 removes `lucide-react` |
| §1 row 7 — ≥ 10 images / ≥ 8 diagrams | Task 7 `firstPartyVisuals()` |
| §1 row 8 — WCAG AA contrast | Task 7 `contrast()`; Task 3 Step 2 |
| §1 row 9 — Lighthouse a11y ≥ 95 / perf ≥ 90 | Task 5 (gate), Task 7 `lighthouse()` |
| §10 LCP < 2.5 s, CLS < 0.05 | Task 5 Step 3 records both; Step 4 triages each |
| §10 skip link, focus ring, keyboard-complete dropdown and drawer | Task 6 rows 1–3, plus the two cross-cutting checks |
| §10 touch targets ≥ 44px / 48px header | Task 6 Step 1, closing bullet |
| §13 unit tests | Task 3 Step 3 |
| §13 static checks | Task 3 Steps 1–2 |
| §13 visual: 375/768/1280/1536 × 7 routes + dropdown + drawer | Task 4 `ROUTES` and `STATES` (plus the palette and the three Phase 6–7 routes) |
| §13 Lighthouse mobile home + one stage page | Task 5 gates `/` and `/start` |
| §13 manual keyboard pass | Task 6 |
| §14 row 9 — full check suite | Task 3 |
| §14 row 9 — screenshots | Task 4 |
| §14 row 9 — `DESIGN_REVIEW.md` v2 | Task 8 Step 2 |
| §14 row 9 — `README.md` routes/design sections | Task 8 Steps 3–4 |
| §14 row 9 — dead-file removal | Task 1 |
| §15 — `BUILD_GUIDE.md`, `README.md`, `DESIGN_REVIEW.md`, `AGENTS.md` unchanged | Task 8 Steps 3–5; `AGENTS.md` is deliberately untouched |
| §5.8 — `/dev/ui` excluded from sitemap and robots | Task 3 Step 5 |
| §7.1 — every generated image captioned | Task 4 Step 6 review table (`home-1280`, `start-*`) |
| §16 Q10 — Tagalog TL;DRs flagged for review | Task 9 Step 3, "Needs a human" |

Additions this plan makes that the spec does not name, each with a reason: the service
worker (Task 2 — a cache-first rule over non-hashed `public/` assets would have shown
returning visitors the pre-redesign site, which defeats the whole project); the search
palette and the three Phase 6–7 routes in the screenshot matrix (they shipped, so they
belong in the review); the security-header re-check (the CSP is the header a font or image
change breaks silently).

**2. Placeholder scan.** No "TBD", "TODO", "implement later", "add appropriate error
handling", or "similar to Task N". `scripts/shoot.mjs` and `scripts/measure.mjs` are given
in full and run as written. `knip.json` and `public/sw.js` are given in full. The `<…>`
slots that remain are all *measured values bound to a named artifact* — for example
"`<the "Link audit passed: …" line, verbatim>`" in `gate.md`, or the paste-from-
`measurements.md` instruction in `DESIGN_REVIEW.md` — never a decision left unmade. Every
conditional branch (Task 1's knip triage, Task 3's `verify:all` composition, Task 5's
Lighthouse triage, Task 8's `BUILD_GUIDE` lines) shows the concrete outcome for each case
rather than deferring the choice.

**3. Type and name consistency.** `scripts/shoot.mjs` writes
`screenshots/final/heights.json` keyed `"<slug>-<width>"` with `{ route, width, height,
kind, files[] }`; `scripts/measure.mjs` reads exactly `heights.json["home-1280"].height`.
Task 5 writes `screenshots/final/lighthouse/home.json` and `measure.mjs` reads that same
path, using `categories["accessibility"|"performance"].score` and
`audits["largest-contentful-paint"|"cumulative-layout-shift"].displayValue` — the same
audit ids Task 5's own extraction uses. The `verify:primitives` rule id parsed in
`rawCardPatterns()` is `raw-card`, which matches `scripts/verify-primitives.mjs`'s `RULES`
entry verbatim. The npm script names introduced here (`shoot`, `measure`) are the names
Task 8's README run-section lists and Task 8 Step 4's existence check verifies.

**4. Gaps deliberately left.** This plan does not verify the educator-kit PDFs render
correctly in Acrobat/Preview — that is Phase 7's exit criterion and re-running it here
would duplicate a gate rather than re-run it on a changed tree; Task 3 re-runs `verify:kit`
instead, which is the machine-checkable half. It also does not re-audit the content JSON
voice: Phase 8 owns that, and Task 3 records `voice:lint` rather than re-judging it.
