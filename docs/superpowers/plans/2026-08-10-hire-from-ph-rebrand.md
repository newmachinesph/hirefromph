# Hire From PH Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename DevUp to Hire From PH with a new logo, palette, and typography, leaving every learning resource, route, and behaviour identical.

**Architecture:** Task 1 runs alone and rewrites the design tokens plus a mechanical rename sweep that touches nearly every file. Tasks 2–6 then run in parallel under **strict file ownership** — no file appears in two tasks — so agents cannot collide. Task 7 verifies the whole.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (CSS-first tokens), TypeScript strict, `node --test`, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-08-10-hire-from-ph-rebrand-design.md` — read §2, §3, §4 before starting any task.

## Global Constraints

- **Content is frozen.** No learning resource, route, heading, or instructional copy changes except the brand strings named explicitly in a task. If a task tempts you to improve unrelated wording, don't.
- **Honesty doctrine (`BUILD_GUIDE.md`).** Never introduce a statistic, count, testimonial, or outcome claim. Every existing `source: {label,url}` object must still render.
- **Never write "virtual assistant" or "assistant".** Always "online professional" / "remote professional".
- **No external images.** Visuals are CSS/SVG only. After Task 2 the repo has zero raster assets.
- **Exact brand strings** come from spec §2 verbatim. Do not paraphrase them.
- **Palette values** come from spec §3 verbatim. Do not adjust a hex "to taste" — every value is contrast-checked.
- `git` in this repo needs `-c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite` on every invocation (the worktree is owned by a different Windows SID).
- **`node --test` has one PRE-EXISTING failure on master**, in `lib/calculators.test.mjs`: `monthlyEffective` returns `259.8 × 0.75` where the assertion expects `× 0.67`. It predates this branch, `lib/` is untouched by the rebrand, and fixing it is **out of scope**. Treat `node --test` as passing when that is the only failure — but if a *second* test starts failing, that one is yours.
- Never run `git stash`, `git reset --hard`, or `git checkout <branch>`. The repo has an unrelated pre-existing stash belonging to the user; popping it corrupts the working tree.
- Windows: use `set PORT=3000 && npx next start`, not `-p`.

## File Ownership

| Task | Owns (exclusively) |
|---|---|
| 1 | `app/globals.css`, `scripts/verify-contrast.mjs`, `package.json`, + rename sweep across all of `app/ components/ data/` |
| 2 | `components/logo.tsx`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/manifest.ts`, `public/devup-logo.png` |
| 3 | `data/site.json`, `app/layout.tsx`, `components/site-footer.tsx`, `app/privacy/page.tsx`, `lib/meta.ts`, `components/social-links.tsx`, `components/follow-modal.tsx` |
| 4 | `lib/storage.ts`, `lib/storage.test.mjs`, `lib/path-context.tsx`, `components/build-labs.tsx`, `components/rate-worksheet.tsx`, `public/sw.js`, `app/sitemap.ts` |
| 5 | `app/tasks/page.tsx`, `app/tracker/page.tsx`, `components/stage-page.tsx`, `components/icon.tsx`, `data/aifirst.json`, `data/apply.json`, `data/clients.json`, `data/tasks.json` |
| 6 | `README.md`, `BUILD_GUIDE.md`, `AGENTS.md` |

Task 1 must land before 2–6 start. Tasks 2–6 are mutually independent.

---

### Task 1: Tokens, typography, and the rename sweep

**Files:**
- Create: `scripts/verify-contrast.mjs`
- Modify: `app/globals.css`, `package.json`, `app/layout.tsx` (font consts only)
- Sweep: every file under `app/`, `components/`, `data/`

**Interfaces:**
- Produces: CSS custom properties `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--verified`, `--verified-tint`, `--info`, `--info-tint`, `--caution`, `--caution-tint`, `--caution-text`, `--shadow-signal`; Tailwind utilities `text-signal`, `bg-signal`, `border-signal`, `text-verified`, `text-info`, `text-caution-text`, etc. Tasks 2, 3, and 5 use these class names.
- Produces: `npm run verify:contrast`.

- [ ] **Step 1: Write the failing contrast check**

Create `scripts/verify-contrast.mjs`. It parses hex values out of `app/globals.css` by custom-property name and asserts each documented pair clears 4.5:1.

```js
import { readFile } from "node:fs/promises";

const PAIRS = [
  ["signal", "paper", 4.5],
  ["signal", "signal-tint", 4.5],
  ["signal-light", "ink", 4.5],
  ["verified", "paper", 4.5],
  ["verified", "verified-tint", 4.5],
  ["info", "paper", 4.5],
  ["caution", "paper", 4.5],
  ["caution-text", "caution-tint", 4.5],
  ["ink", "paper", 4.5],
  ["ink-soft", "paper", 4.5],
  ["ink-faint", "paper", 4.5],
];
// White-on-fill pairs, checked against #ffffff rather than a token.
const ON_FILL = [["signal", 4.5], ["signal-deep", 4.5], ["verified", 4.5], ["info", 4.5]];

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  return m[1];
}

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const failures = [];
for (const [fg, bg, min] of PAIRS) {
  const r = ratio(token(fg), token(bg));
  if (r < min) failures.push(`--${fg} on --${bg}: ${r.toFixed(2)}:1 (need ${min}:1)`);
}
for (const [fill, min] of ON_FILL) {
  const r = ratio("#ffffff", token(fill));
  if (r < min) failures.push(`white on --${fill}: ${r.toFixed(2)}:1 (need ${min}:1)`);
}

if (failures.length) {
  console.error("Contrast failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log(`Contrast OK — ${PAIRS.length + ON_FILL.length} pairs pass.`);
```

Add to `package.json` scripts: `"verify:contrast": "node scripts/verify-contrast.mjs"`. Also change `"name": "freelearning"` to `"name": "hire-from-ph"`.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run verify:contrast`
Expected: FAIL — `token --signal not found in globals.css`. This is the RED step; the tokens don't exist yet.

- [ ] **Step 3: Rewrite the tokens in `app/globals.css`**

In `:root`, replace the surface/ink/accent block with spec §3 values exactly:

```css
  --paper: #F6F7F9;
  --paper-2: #FFFFFF;
  --paper-3: #ECEEF2;
  --card: #FFFFFF;

  --ink: #0F1115;
  --ink-soft: #464B57;
  --ink-faint: #676D7C;
  --line: #E2E5EA;
  --line-strong: #C9CED8;

  --signal: #3A35D6;
  --signal-deep: #2A26A8;
  --signal-tint: #E8E7FC;
  --signal-light: #8E8AFF;

  --verified: #12724E;
  --verified-tint: #DDF1E7;

  --info: #0E6FA8;
  --info-tint: #DDEEF8;
  --caution: #B45309;
  --caution-tint: #FBEBD5;
  --caution-text: #8A3F07;

  --radius: 6px;
  --radius-sm: 4px;
  --radius-lg: 10px;
```

Change `--shadow-coral` to `--shadow-signal: 0 10px 30px rgba(58, 53, 214, 0.28);`.

Update the file's header comment from the warm-paper/coral description to: `Hire From PH — Design tokens. Signal: cool near-white, graphite ink, electric indigo.`

- [ ] **Step 4: Rewrite the `@theme inline` map**

Rename every `--color-coral*` to `--color-signal*`, `--color-emerald*` to `--color-verified*`, `--color-indigo*` to `--color-info*`, `--color-amber*` to `--color-caution*`, each pointing at its renamed custom property. Keep `--color-paper*`, `--color-card`, `--color-ink*`, `--color-line*` as they are.

- [ ] **Step 5: Wire the three fonts**

In `@theme inline` replace the three font lines:

```css
  --font-display: var(--font-space-grotesk);
  --font-sans: var(--font-inter-tight);
  --font-mono: var(--font-space-mono);
```

In `app/layout.tsx` replace the single `Geist` import and const with:

```tsx
import { Space_Grotesk, Inter_Tight, Space_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], display: "swap" });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"], display: "swap" });
```

Space Mono is a static font — omitting `weight` is a build error, not a silent default. The other two are variable and take no `weight`.

Change the `<html>` className to `` `${spaceGrotesk.variable} ${interTight.variable} ${spaceMono.variable} h-full antialiased` ``.

**Touch nothing else in `layout.tsx`** — Task 3 owns its metadata, JSON-LD, and `FollowModal`.

- [ ] **Step 6: Radius reset and grain removal**

Change the global reset value, keeping the reset itself:

```css
*,
*::before,
*::after {
  border-radius: var(--radius) !important;
}
```

Delete the entire `body::before` grain block. In the focus-ring rule change `outline: 2px solid var(--coral)` to `var(--signal)`.

- [ ] **Step 7: Run the contrast check — it must now pass**

Run: `npm run verify:contrast`
Expected: PASS, `Contrast OK — 15 pairs pass.`

If any pair fails, the hex was mistyped. Re-copy from spec §3; do not adjust the value to make the check pass.

- [ ] **Step 8: Mechanical rename sweep**

Replace across `app/`, `components/`, `data/` only.

```bash
cd d:/startups/my-projects/DevUpProject/devupwebsite
grep -rl --include='*.tsx' --include='*.ts' --include='*.json' --include='*.css' \
  -E 'coral|emerald|indigo|amber' app components data \
| xargs sed -i \
    -e 's/amber-text/caution-text/g' \
    -e 's/coral/signal/g' \
    -e 's/emerald/verified/g' \
    -e 's/indigo/info/g' \
    -e 's/amber/caution/g'
```

`amber-text` is replaced **before** bare `amber`, or it would become `caution--text`.

- [ ] **Step 9: Verify the sweep left nothing behind**

Run:
```bash
grep -rniE 'coral|emerald|indigo|amber' app components data
```
Expected: no output.

Then check the JSON accent values changed correctly:
```bash
grep -rho '"accent": "[a-z-]*"' data | sort | uniq -c
```
Expected: only `signal`, `verified`, `info`, `caution` appear.

- [ ] **Step 10: Build**

Run: `npm run build`
Expected: success. Then `npm run lint` and `node --test` — both clean.

- [ ] **Step 11: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "refactor: retoken palette and type for Hire From PH

Signal direction: cool near-white, graphite ink, electric indigo.
Renames coral/emerald/indigo/amber to signal/verified/info/caution,
since the old names no longer described their values. Adds
verify:contrast to assert every pair clears WCAG AA 4.5:1."
```

---

### Task 2: The Bracket PH mark

**Files:**
- Modify: `components/logo.tsx`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/manifest.ts`
- Delete: `public/devup-logo.png`

**Interfaces:**
- Consumes: `text-signal`, `text-signal-light`, `--signal` from Task 1.
- Produces: `LogoMark({ size, className, title, onDark })` and `Logo({ className, markSize, wordmark, onDark, showTagline })` — **signatures unchanged**, so `site-header.tsx` and `site-footer.tsx` need no edit for the mark itself. Also exports `Bracket({ className })` for reuse.
- Removes: `FacebookGlyph` — Task 3 removes its only consumer in the same wave. Both deletions must land or neither builds.

**Ordering constraint:** `app/opengraph-image.tsx:11` reads `public/devup-logo.png` off disk at build time. The OG rewrite must be committed *before or with* the PNG deletion, never after.

- [ ] **Step 1: Replace the mark with inline SVG**

**Geometry chosen from the codex-bridge exploration sheet.** The mark is **48×32 (3:2), not square**. Bracket stroke weight (4 units) is deliberately close to the letter stem weight (3 units) so brackets and letters read as one system; returns are short (7 units) so they frame without crowding. Thin brackets disappeared below 20px in the exploration and heavier ones swallowed the letters — do not adjust these weights.

`size` is the **height**; width is derived as `size * 1.5`, matching how the old raster `LogoMark` derived width from its intrinsic ratio. Callers passing `markSize={34}` therefore need no change.

In `components/logo.tsx`, delete the `next/image` import and the `MARK_W`/`MARK_H` constants.

```tsx
/** Aspect of the bracket-PH mark: 48 wide × 32 tall. */
const MARK_RATIO = 48 / 32;

export function LogoMark({
  size = 32,
  className,
  title,
  onDark,
}: {
  size?: number;
  className?: string;
  title?: string;
  onDark?: boolean;
}) {
  const bracket = onDark ? "#FFFFFF" : "var(--signal)";
  const letters = onDark ? "#FFFFFF" : "var(--ink)";
  return (
    <svg
      width={Math.round(size * MARK_RATIO)}
      height={size}
      viewBox="0 0 48 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d="M0 0H11V4H4V28H11V32H0V0Z" fill={bracket} />
      <path d="M48 0H37V4H44V28H37V32H48V0Z" fill={bracket} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 6H18.75A5.25 5.25 0 0 1 18.75 16.5H17V26H14V6ZM17 9V13.5H18.75A2.25 2.25 0 0 0 18.75 9H17Z"
        fill={letters}
      />
      <path d="M26 6H29V14.5H32V6H35V26H32V17.5H29V26H26V6Z" fill={letters} />
    </svg>
  );
}
```

Delete `FacebookGlyph` entirely.

- [ ] **Step 2: Update the wordmark**

In `Logo`, change the default wordmark and the tagline text:

```tsx
{wordmark ?? (
  <>
    Hire From <span className="text-signal">PH</span>
  </>
)}
```

and the `showTagline` sub-line from `developing upwards` to `the standard, not the discount`.

- [ ] **Step 3: Export the bracket as a reusable device**

```tsx
/** The lockup's bracket on its own, for pull-quotes and section rules. */
export function Bracket({ className }: { className?: string }) {
  return (
    <svg width="12" height="32" viewBox="0 0 12 32" fill="none" className={className} aria-hidden>
      <path d="M12 3H3v26h9v-3H6V6h6V3Z" fill="currentColor" />
    </svg>
  );
}
```

- [ ] **Step 4: Rewrite `app/icon.svg`**

The favicon must stay square, so it is the same 48×32 mark scaled to `26/48` and centred on a 32×32 indigo tile. Reuse the identical path data — a favicon that is a redrawn approximation of the mark drifts from it over time.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" fill="#3A35D6"/>
  <g transform="translate(3 7.33) scale(0.5417)" fill="#fff">
    <path d="M0 0H11V4H4V28H11V32H0V0Z" fill-opacity="0.6"/>
    <path d="M48 0H37V4H44V28H37V32H48V0Z" fill-opacity="0.6"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14 6H18.75A5.25 5.25 0 0 1 18.75 16.5H17V26H14V6ZM17 9V13.5H18.75A2.25 2.25 0 0 0 18.75 9H17Z"/>
    <path d="M26 6H29V14.5H32V6H35V26H32V17.5H29V26H26V6Z"/>
  </g>
</svg>
```

The brackets drop to 60% opacity here only because on a saturated indigo tile a full-white bracket competes with the letters; in the on-paper mark they stay solid.

- [ ] **Step 5: Rewrite the OG image — do this before deleting the PNG**

In `app/opengraph-image.tsx`: delete the `readFile`/`join` imports, both `logo`/`logoSrc` lines, and the `<img>` element. Replace it with an inline `<svg>` using the same paths as Step 1 at `width={82} height={82}` — `next/og` renders inline SVG. Then:

- `alt` → `"Hire From PH — Be the reason they hire from the Philippines."`
- background `#f1f6f4` → `#F6F7F9`; text `#0e1f1b` → `#0F1115`
- corner glow `rgba(13,148,136,0.14)` → `rgba(58,53,214,0.14)`
- brand row: `Dev`/`Up` → `Hire From ` / `PH`, accent `#0d9488` → `#3A35D6`
- kicker `DEVELOPING UPWARDS` → `THE STANDARD, NOT THE DISCOUNT`, colour `#3a4a46` → `#464B57`
- headline accent `#0d9488` → `#3A35D6`; sub-copy `#435551` → `#464B57`
- footer row `#798a84` → `#676D7C`, accent `#0d9488` → `#3A35D6`

Headline copy stays "Build the online career you actually own."

- [ ] **Step 6: Update the manifest**

In `app/manifest.ts`: `name` → `"Hire From PH — the standard, not the discount"`, `short_name` → `"Hire From PH"`, `background_color` → `"#F6F7F9"`, `theme_color` → `"#3A35D6"`. `description` and `icons` unchanged.

- [ ] **Step 7: Delete the raster**

```bash
rm public/devup-logo.png
```

- [ ] **Step 8: Build and verify no raster remains**

Run: `npm run build`
Expected: success — in particular the OG route must build without the PNG.

Run: `ls public/`
Expected: `sw.js` only.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "feat: Bracket PH mark, inline SVG

Replaces the DevUp raster monogram with a pure-SVG bracket mark drawn
on a 32px grid so it stays crisp at favicon size. Rewrites the OG image
to draw the mark inline, which is what lets the PNG be deleted — the
site now ships zero raster assets."
```

---

### Task 3: Name, metadata, and removing socials

**Files:**
- Modify: `data/site.json`, `app/layout.tsx`, `components/site-footer.tsx`, `app/privacy/page.tsx`, `lib/meta.ts`
- Delete: `components/social-links.tsx`, `components/follow-modal.tsx`

**Interfaces:**
- Consumes: `Logo` from Task 2 (unchanged signature); `text-signal-light`, `bg-signal` from Task 1.
- Note: Task 2 deletes `FacebookGlyph`. This task removes its only import, in `site-footer.tsx`. Both must land together.

**Why one task:** `site-footer.tsx` reads `site.social.facebook`. Removing the `social` block from `site.json` in a different agent would break the type-check mid-flight, so both belong to one owner.

- [ ] **Step 1: Rewrite the brand block in `data/site.json`**

Apply spec §2 "Exact copy for `data/site.json`" **verbatim** — `brand`, `wordmarkAccent`, `meaning`, `tagline`, `mission`, `standard.kicker`, `standard.body`. Leave `standard.title`, `standard.principles`, `stats`, `navGroups`, `primaryNav` untouched. Delete the entire `social` object.

- [ ] **Step 2: Update `app/layout.tsx` metadata and JSON-LD**

Apply spec §2 "Exact copy for `app/layout.tsx` metadata". Then in `jsonLd`, set both `name` fields to `"Hire From PH"` and **delete the `sameAs` line** (its only value was `site.social.facebook`). Remove the `FollowModal` import and its `<FollowModal />` render.

Leave the font consts from Task 1 alone.

- [ ] **Step 3: Update `lib/meta.ts`**

`siteName: "DevUp"` → `"Hire From PH"`. In the doc comment, `"%s · DevUp"` → `"%s · Hire From PH"`.

- [ ] **Step 4: Strip socials from the footer**

In `components/site-footer.tsx`: remove the `SocialLinks` import and its `<SocialLinks />`, the `FacebookGlyph` import, the `Users` import from `lucide-react`, and the entire `<div className="mt-6 flex flex-wrap gap-3">` block containing both Facebook links plus the "The group is where the surprises land" paragraph beneath it.

Change the footer wordmark from `Dev<span className="text-signal-light">Up</span>` to `Hire From <span className="text-signal-light">PH</span>`.

Change the independence paragraph's opening from `DevUp is an independent...` to `Hire From PH is an independent...`.

The bottom row loses its right-hand child; change `md:justify-between` to `md:justify-start` so the paragraph doesn't sit oddly.

- [ ] **Step 5: Rewrite the Facebook sections of `/privacy`**

In `app/privacy/page.tsx`:
- Delete the whole `title="Facebook is Facebook's rules, not ours"` section and its three `<Out>` links.
- Rewrite the contact section. It currently says the Facebook Page "is the one channel that reaches us" with a `<Out href={site.social.facebook}>` link. Replace that body with:

> "There is no contact channel right now. The Facebook Page this site used to point at belonged to its previous name, and we would rather say so than leave you messaging somewhere nobody reads. When a channel exists, it will be published here."

Remove the `<Out href={site.social.facebook}>` link entirely.
- Replace `DevUp` with `Hire From PH` at lines 10, 42, and 63.

- [ ] **Step 6: Delete the dead components**

```bash
rm components/social-links.tsx components/follow-modal.tsx
```

- [ ] **Step 7: Verify nothing references them**

Run:
```bash
grep -rn "social-links\|follow-modal\|SocialLinks\|FollowModal\|site.social\|FacebookGlyph" app components lib
```
Expected: no output.

- [ ] **Step 8: Build**

Run: `npm run build` then `npm run lint`
Expected: both clean. TypeScript must not complain about a missing `social` property.

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "feat: rename to Hire From PH, remove social links

Drops all five devupph handles rather than repointing them, since the
new accounts do not exist yet and dead links are worse than none.
Facebook was the site's only contact route, so /privacy now states the
absence plainly instead of promising a channel that isn't there."
```

---

### Task 4: Storage migration and infrastructure

**Files:**
- Create: `lib/storage.ts`, `lib/storage.test.mjs`
- Modify: `lib/path-context.tsx`, `components/build-labs.tsx`, `components/rate-worksheet.tsx`, `public/sw.js`, `app/sitemap.ts`

**Interfaces:**
- Produces: `migrateKey(oldKey: string, newKey: string): void` from `@/lib/storage`.

**This is the only task with real behavioural risk.** Three keys hold user data; `devup.labs.v1` holds prose the user wrote themselves. Read spec §8.1 before starting.

- [ ] **Step 1: Write the failing test**

Create `lib/storage.test.mjs`, matching the existing `lib/*.test.mjs` convention.

```js
import { test } from "node:test";
import assert from "node:assert/strict";

function makeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

async function load() {
  const { migrateKey } = await import("./storage.ts");
  return migrateKey;
}

test("copies the old value to the new key and clears the old", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({ "devup.path.v1": '{"stage":2}' });
  migrateKey("devup.path.v1", "hfph.path.v1");
  assert.equal(localStorage.getItem("hfph.path.v1"), '{"stage":2}');
  assert.equal(localStorage.getItem("devup.path.v1"), null);
});

test("never overwrites an existing new-key value", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({
    "devup.labs.v1": "old",
    "hfph.labs.v1": "current",
  });
  migrateKey("devup.labs.v1", "hfph.labs.v1");
  assert.equal(localStorage.getItem("hfph.labs.v1"), "current");
});

test("copies malformed values verbatim without parsing or throwing", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({ "devup.labs.v1": "{not json" });
  assert.doesNotThrow(() => migrateKey("devup.labs.v1", "hfph.labs.v1"));
  assert.equal(localStorage.getItem("hfph.labs.v1"), "{not json");
});

test("no-ops when the old key is absent", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({});
  migrateKey("devup.path.v1", "hfph.path.v1");
  assert.equal(localStorage.getItem("hfph.path.v1"), null);
});

test("swallows a throwing storage rather than breaking render", async () => {
  const migrateKey = await load();
  globalThis.localStorage = {
    getItem() { throw new DOMException("denied", "SecurityError"); },
    setItem() {},
    removeItem() {},
  };
  assert.doesNotThrow(() => migrateKey("devup.path.v1", "hfph.path.v1"));
});
```

If `node --test` cannot import a `.ts` file in this Node version, write `lib/storage.mjs` instead and have `lib/storage.ts` be a thin typed re-export — do **not** weaken the test to accommodate it.

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test lib/storage.test.mjs`
Expected: FAIL — cannot resolve `./storage.ts`.

- [ ] **Step 3: Implement `lib/storage.ts`**

```ts
/**
 * One-time rename of a localStorage key. Used by the DevUp → Hire From PH
 * rebrand: three keys hold user data, one of them the resume/portfolio/SOP
 * prose the user wrote themselves, so a silent wipe is not acceptable.
 *
 * The value moves as an opaque string. Validation stays in each consumer's
 * existing load path, which already tolerates bad JSON — parsing here would
 * mean three shapes to validate and a second place for that logic to rot.
 */
export function migrateKey(oldKey: string, newKey: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem(newKey) !== null) return;
    const old = localStorage.getItem(oldKey);
    if (old === null) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
    // Quota, private mode, or a blocked-storage SecurityError. A failed
    // migration must never break page render.
  }
}
```

- [ ] **Step 4: Run the tests**

Run: `node --test lib/storage.test.mjs`
Expected: 5 passing.

- [ ] **Step 5: Wire the three call sites**

Each file: import `migrateKey`, rename its key constant, and call the migration once on mount **before** the first read.

- `lib/path-context.tsx:90` — `const KEY = "hfph.path.v1";` and inside the existing mount effect, first line: `migrateKey("devup.path.v1", KEY);`
- `components/build-labs.tsx:18` — `const LABS_KEY = "hfph.labs.v1";` and `migrateKey("devup.labs.v1", LABS_KEY);` on mount before its first read.
- `components/rate-worksheet.tsx:13` — `const KEY = "hfph.worksheet.v1";` and `migrateKey("devup.worksheet.v1", KEY);` likewise.

The migration must run inside the same `useEffect` that already reads storage, ahead of the read — not in a separate effect, whose ordering isn't guaranteed.

- [ ] **Step 6: Bump the service worker cache**

`public/sw.js:4` — `const CACHE = "hfph-v1";`. Update the file's opening comment from `DevUp service worker` to `Hire From PH service worker`. This bust is intentional: it's what makes returning visitors fetch the rebranded CSS instead of the cached teal shell.

- [ ] **Step 7: Update the canonical URL**

`app/sitemap.ts:4` — `export const BASE_URL = "https://hirefrom.ph";`

- [ ] **Step 8: Verify and commit**

Run: `node --test` (all files), then `npm run build`.
Expected: clean.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "feat: migrate localStorage keys to hfph namespace

Three keys hold user data and one of them, devup.labs.v1, holds the
resume/portfolio/SOP prose users wrote themselves. Renaming without a
migration would have wiped it. Shared migrateKey helper copies values
across on mount, never overwrites an existing new-key value, and
swallows storage errors so a failed migration can't break render."
```

---

### Task 5: Remaining brand strings

**Files:**
- Modify: `app/tasks/page.tsx`, `app/tracker/page.tsx`, `components/stage-page.tsx`, `components/icon.tsx`, `data/aifirst.json`, `data/apply.json`, `data/clients.json`, `data/tasks.json`

Pure string replacement. Change **only** the brand name; leave surrounding sentences intact.

- [ ] **Step 1: Replace each occurrence**

| File:line | Change |
|---|---|
| `app/tasks/page.tsx:22` | `name: "DevUp micro-tasks"` → `"Hire From PH micro-tasks"` |
| `app/tracker/page.tsx:94` | `Everywhere else on DevUp we refuse` → `Everywhere else on Hire From PH we refuse` |
| `components/stage-page.tsx:96` | `DevUp · {stage.subtitle}` → `Hire From PH · {stage.subtitle}` |
| `components/icon.tsx:140` | comment `DevUp icon set` → `Hire From PH icon set` |
| `data/aifirst.json:186` | `the same transferable method DevUp uses everywhere` → `...method Hire From PH uses everywhere` |
| `data/apply.json:3` | `The complete DevUp list of agencies` → `The complete Hire From PH list of agencies` |
| `data/apply.json:4` | `not necessarily endorsed by DevUp` → `not necessarily endorsed by Hire From PH` |
| `data/clients.json:6` | `DevUp is built for the second road` → `Hire From PH is built for the second road` |
| `data/clients.json:85` | `DevUp has a workshop for each piece` → `Hire From PH has a workshop for each piece` |

Also grep `data/tasks.json` for `DevUp` and apply the same treatment to whatever occurrences exist there.

- [ ] **Step 2: Verify**

Run:
```bash
grep -rn "DevUp" app/tasks app/tracker components/stage-page.tsx components/icon.tsx data
```
Expected: no output.

- [ ] **Step 3: Build and commit**

Run: `npm run build` and `npm run verify:claims`
Expected: clean — `verify:claims` confirms no sourced claim lost its source.

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "docs: rename remaining DevUp copy references to Hire From PH"
```

---

### Task 6: Documentation

**Files:** `README.md`, `BUILD_GUIDE.md`, `AGENTS.md`

- [ ] **Step 1: `README.md`**

Retitle to `# Hire From PH — Online Career Portal`. Replace the "DevUp — developing upwards" gloss with the new meaning from spec §2. In the **Design** section replace the whole description with: `Signal system: Space Grotesk display × Inter Tight body × Space Mono kickers, graphite ink on cool near-white, electric indigo signature, 6px radius. Tokens in app/globals.css.` Add `npm run verify:contrast` to the Run block. Leave the Routes table and the honesty rule as they are.

- [ ] **Step 2: `BUILD_GUIDE.md`**

Retitle to `# Hire From PH — Build Guide`. Update three things and nothing else:
- **Design tokens** line: colours become `paper`, `paper-2`, `paper-3`, `card`, `ink`, `ink-soft`, `ink-faint`, `line`, `line-strong`, `signal`, `signal-deep`, `signal-tint`, `signal-light`, `verified`, `verified-tint`, `info`, `caution`, `caution-text`.
- **Fonts** line: `font-display` (Space Grotesk), default sans (Inter Tight), `font-mono` (Space Mono).
- **accent maps**: `signal→text-signal`, `verified→text-verified`, `caution→text-caution-text`, `info→text-info`; bars `bg-signal`, `bg-verified`, `bg-caution`, `bg-info`.

Also update the Cards convention line — it says `rounded-2xl`, which the global reset now renders as 6px. Change it to `rounded-[var(--radius)]` so new pages are written honestly.

The two doctrine sections are untouched. Update the `site.json` shape note to drop `social`.

- [ ] **Step 3: `AGENTS.md`**

Verify it still reads correctly; it only points at the Next.js docs and `CLAUDE.md`. Change only a brand mention if one exists.

- [ ] **Step 4: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "docs: update README and BUILD_GUIDE for the Signal design system"
```

---

### Task 7: Whole-site verification

Runs after 2–6 have all landed.

- [ ] **Step 1: Full check suite**

```bash
npm run build && npm run lint && node --test && npm run verify:claims && npm run verify:contrast
```
Expected: all clean.

- [ ] **Step 2: Completion grep**

```bash
grep -rnE '\b(devup|DevUp|coral|emerald|indigo|amber)\b|#0a736a|#f1f6f4|#0e1f1b|#0d9488' \
  app components data lib public scripts \
  | grep -v 'Red/Amber/Green' | grep -v 'Amber = at risk'
```
Expected: no output. Any hit is a missed rename.

**Two known-legitimate exclusions**, confirmed during Task 1 — do not "fix" either:
- `data/tasks.json:715` and `:758` contain `RAG (Red/Amber/Green)` — project-management terminology in frozen learning content, not a design token.
- `app/globals.css`'s header comment says "electric violet", not "electric indigo". Task 1's sweep would have rewritten the literal word `indigo` to `info` mid-sentence. The colour is unchanged; only the prose word differs.

- [ ] **Step 3: Signal-vs-info adjacency audit**

`--signal` (violet-indigo) and `--info` (true blue) sit 40° apart in hue. Find components that render both:

```bash
grep -rln "signal" app components | xargs grep -ln "info"
```

Open each hit and check whether the two colours appear as adjacent peers in the same visual group (e.g. two cards side by side in an accent-mapped list). Where they do, reassign the `info` one to `text-ink-soft` / `bg-paper-3`. Where they appear in unrelated regions, leave them.

- [ ] **Step 4: Manual acceptance**

Run `npm run build && set PORT=3000 && npx next start`, then confirm:
- Mark is legible at 16px and 24px and as a browser favicon
- No network request for any image on `/`, `/start`, `/path`
- A visitor with a pre-existing `devup.path.v1` value loads with path, stage, plan, and checklist intact — set one in DevTools before loading to check
- `/privacy` shows no Facebook link and states the absent contact channel
- `/build` retains previously written lab text after migration

- [ ] **Step 5: Final commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite add -A
git -c safe.directory=D:/startups/my-projects/DevUpProject/devupwebsite commit -m "chore: verify Hire From PH rebrand end to end"
```
