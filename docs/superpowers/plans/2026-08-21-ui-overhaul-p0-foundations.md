# UI Overhaul — Phase 0: Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-theme the entire site on the new tokens (Inter + Cabinet Grotesk, light vibrant palette, new radii), add the shared accent map, the test runner, the skip link, and the new logo — without restructuring any page yet.

**Architecture:** Tokens change in one file (`app/globals.css`) and are exposed to Tailwind v4 via `@theme inline`; legacy token names stay as hex aliases so every existing page still compiles and renders on the new palette. Fonts load through `next/font` from `lib/fonts.ts`. The accent map in `lib/accent.ts` becomes the only source of accent classes from Phase 1 onward. The logo is replaced in place behind the existing `Logo`/`LogoMark` API so the header and footer need no changes.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first), TypeScript strict, Vitest 3 + Testing Library (new), `node --test` (existing math tests), Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§4 design system, §2 logo row, §13 testing). This is plan 1 of 9; later phases have their own plan files.

## Global Constraints

- Fonts: Inter via `next/font/google`; Cabinet Grotesk 500/700/800 self-hosted via `next/font/local` from Fontshare woff2 (ITF Free Font License). Space Grotesk, Inter Tight, Space Mono are removed.
- Palette (exact hex): paper `#FFFFFF`, band `#F7F6FF`, tint `#EEEDFF`, ink `#0E1230`, ink-soft `#4A4F66`, ink-faint `#6B7087`, line `#E4E4EA`, line-strong `#CFCFD8`, control `#8A8FA3`, primary `#4B4EF6`, primary-deep `#3634D8`, primary-soft `#C9C8FF`, verified `#067647` / fill `#12B76A` / tint `#E6F7EE`, caution `#9A5B00` / fill `#F5A623` / tint `#FFF4DB`, info `#026AA2` / fill `#0BA5EC` / tint `#E0F2FE`, coral `#B42318` / fill `#FF5A5F` / tint `#FFECEB`, on-navy `#F7F6FF`.
- Naming convention (deviation from the spec table, documented in BUILD_GUIDE): the bare semantic name (`--verified`) is the **text/deep** value so legacy `text-verified` usages stay AA; the vibrant shape colour is `--verified-fill`.
- Radii: sm 8px, md 12px, lg 20px, pill 999px. The global `* { border-radius: 6px !important }` rule and `.is-circle` are deleted. Tailwind's default `rounded-*` scale is **not** wiped in this phase (legacy pages still use `rounded-2xl`); Phase 5 wipes it.
- Legacy aliases kept until Phase 5: `--paper-2`, `--paper-3`, `--signal`, `--signal-deep`, `--signal-tint`, `--signal-light`, `--caution-text`, `--radius`, `--shadow-lg`, `--shadow-signal`, `.kicker`, `.font-display`, `.container-x`, `.link-sweep`, `.font-mono`.
- White text only on `primary`, `primary-deep`, `ink`, and the deep semantic values; never on `*-fill` colours.
- No new `lucide-react` imports. No new `hover:-translate-y-*`, `blur-*`, or `Sparkles`.
- Honesty doctrine unchanged; no copy changes in this phase except the logo tagline, which is unchanged ("the standard, not the discount").
- Git: work on branch `redesign/ui-overhaul`; run git as `git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite …` (repo ownership quirk on this machine). Commit after every task.
- Commands run from the repo root in Git Bash. `npm run build` must pass at the end of every task that touches `app/` or `lib/`.

---

## File structure

| Path | Responsibility |
|---|---|
| `vitest.config.ts`, `vitest.setup.ts` | React/jsdom unit test runner; `@` alias |
| `lib/accent.ts`, `lib/accent.test.ts` | The single accent → Tailwind class map |
| `app/fonts/CabinetGrotesk-{Medium,Bold,Extrabold}.woff2`, `app/fonts/CabinetGrotesk-Bold.ttf`, `app/fonts/LICENSE.txt` | Self-hosted display font (ttf only for the OG image renderer) |
| `lib/fonts.ts` | `inter`, `cabinet` font objects |
| `app/globals.css` | All tokens, base styles, legacy helper classes |
| `app/layout.tsx` | Font variables, skip link, `<main id="main">`, theme colour |
| `scripts/verify-contrast.mjs` | Contrast gate for the new token pairs |
| `components/logo.tsx`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/manifest.ts` | New ladder-H mark everywhere the brand appears |
| `BUILD_GUIDE.md`, `README.md` | Tokens section rewritten; design line updated |
| `package.json` | `test`, `test:unit`, `verify:all` scripts; vitest deps |

---

### Task 1: Vitest runner and the accent map

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `lib/accent.ts`, `lib/accent.test.ts`
- Modify: `package.json` (scripts, devDependencies)

**Interfaces:**
- Produces: `ACCENTS: readonly ["signal","caution","verified","info","coral"]`, `type Accent`, `type AccentClasses = { text; fill; tint; border; ring; soft }`, `ACCENT: Record<Accent, AccentClasses>`, `accent(id: string | undefined): AccentClasses`, `isAccent(x: unknown): x is Accent`. Later phases import only these.

- [ ] **Step 1: Install the test runner**

Run:
```bash
npm i -D vitest@^3 @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: installs without peer-dependency errors (React 19 is supported by RTL 16+).

- [ ] **Step 2: Add config and setup files**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "**/*.test.mjs"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add scripts to `package.json`**

Change the `scripts` block to:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "node --test && vitest run",
  "test:unit": "vitest run",
  "test:watch": "vitest",
  "verify:claims": "node scripts/verify-claims.mjs",
  "verify:contrast": "node scripts/verify-contrast.mjs",
  "verify:links": "node scripts/verify-links.mjs",
  "verify:all": "npm run verify:contrast && npm run verify:claims && npm run lint && npx tsc --noEmit"
}
```
(`verify:links` is left out of `verify:all` on purpose: read its header first; if it needs a running server it stays a manual step.)

- [ ] **Step 4: Write the failing accent test**

`lib/accent.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { ACCENT, ACCENTS, accent, isAccent } from "@/lib/accent";

const KEYS = ["text", "fill", "tint", "border", "ring", "soft"] as const;

describe("accent map", () => {
  it("defines every class key for every accent", () => {
    for (const a of ACCENTS) {
      for (const k of KEYS) {
        expect(ACCENT[a][k], `${a}.${k}`).toMatch(/\S/);
      }
    }
  });

  it("uses white text only on the primary fill", () => {
    expect(ACCENT.signal.fill).toMatch(/text-white/);
    for (const a of ACCENTS) {
      if (a === "signal") continue;
      expect(ACCENT[a].fill, a).not.toMatch(/text-white/);
      expect(ACCENT[a].fill, a).toMatch(/text-ink/);
    }
  });

  it("falls back to signal for unknown or missing ids", () => {
    expect(accent("nope")).toBe(ACCENT.signal);
    expect(accent(undefined)).toBe(ACCENT.signal);
    expect(accent("coral")).toBe(ACCENT.coral);
  });

  it("guards accent ids", () => {
    expect(isAccent("info")).toBe(true);
    expect(isAccent("emerald")).toBe(false);
    expect(isAccent(3)).toBe(false);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run lib/accent.test.ts`
Expected: FAIL — `Cannot find module '@/lib/accent'`.

- [ ] **Step 6: Implement `lib/accent.ts`**

```ts
/**
 * The single accent → Tailwind class map. Stage ids in data/*.json
 * (signal | caution | verified | info) are kept; coral is new for
 * red-flag content. Import from here; never re-declare accent maps in pages.
 *
 * Class strings are literal so Tailwind v4's scanner sees them.
 */
export const ACCENTS = ["signal", "caution", "verified", "info", "coral"] as const;
export type Accent = (typeof ACCENTS)[number];

export type AccentClasses = {
  /** Text in the deep/legible value of the accent. */
  text: string;
  /** Solid chip/shape fill with the contrast-safe text colour. */
  fill: string;
  /** Pale background only. */
  tint: string;
  /** Border in the deep value. */
  border: string;
  /** Focus/selection ring in the deep value. */
  ring: string;
  /** Tinted surface with deep text and a faint border (badges, callouts). */
  soft: string;
};

export const ACCENT: Record<Accent, AccentClasses> = {
  signal: {
    text: "text-primary",
    fill: "bg-primary text-white",
    tint: "bg-primary-tint",
    border: "border-primary",
    ring: "ring-primary",
    soft: "bg-primary-tint text-primary-deep border-primary/20",
  },
  caution: {
    text: "text-caution",
    fill: "bg-caution-fill text-ink",
    tint: "bg-caution-tint",
    border: "border-caution",
    ring: "ring-caution",
    soft: "bg-caution-tint text-caution border-caution/20",
  },
  verified: {
    text: "text-verified",
    fill: "bg-verified-fill text-ink",
    tint: "bg-verified-tint",
    border: "border-verified",
    ring: "ring-verified",
    soft: "bg-verified-tint text-verified border-verified/20",
  },
  info: {
    text: "text-info",
    fill: "bg-info-fill text-ink",
    tint: "bg-info-tint",
    border: "border-info",
    ring: "ring-info",
    soft: "bg-info-tint text-info border-info/20",
  },
  coral: {
    text: "text-coral",
    fill: "bg-coral-fill text-ink",
    tint: "bg-coral-tint",
    border: "border-coral",
    ring: "ring-coral",
    soft: "bg-coral-tint text-coral border-coral/20",
  },
};

export function isAccent(x: unknown): x is Accent {
  return typeof x === "string" && (ACCENTS as readonly string[]).includes(x);
}

/** Resolve an accent id from JSON; unknown ids fall back to the primary. */
export function accent(id: string | undefined): AccentClasses {
  return isAccent(id) ? ACCENT[id] : ACCENT.signal;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: `node --test` passes the existing `lib/*.test.mjs` files, then Vitest reports `4 passed`.

- [ ] **Step 8: Commit**

```bash
G="git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite"
$G add vitest.config.ts vitest.setup.ts lib/accent.ts lib/accent.test.ts package.json package-lock.json
$G commit -m "feat(tokens): add accent map and vitest runner"
```

---

### Task 2: Fonts — Inter and self-hosted Cabinet Grotesk

**Files:**
- Create: `app/fonts/CabinetGrotesk-Medium.woff2`, `app/fonts/CabinetGrotesk-Bold.woff2`, `app/fonts/CabinetGrotesk-Extrabold.woff2`, `app/fonts/CabinetGrotesk-Bold.ttf`, `app/fonts/LICENSE.txt`, `lib/fonts.ts`
- Modify: `app/layout.tsx:1-15` (imports and font consts), `app/layout.tsx:95-98` (`<html className>`)

**Interfaces:**
- Produces: `inter` and `cabinet` (`NextFont` objects with `.variable` = `--font-inter` / `--font-cabinet`). `globals.css` (Task 3) references `var(--font-inter)` and `var(--font-cabinet)`.

- [ ] **Step 1: Download the font files from Fontshare's CDN**

Run (Git Bash, repo root):
```bash
mkdir -p app/fonts
BASE="https://cdn.fontshare.com/wf"
curl -fsSL -o app/fonts/CabinetGrotesk-Medium.woff2   "$BASE/CKQBK2QBTCDREE7L3MXZ3PPW7LDNJCWU/OTOY7FQFSFOJVZKJWKO2EHUJLOGBDN4Q/4CO2ETY7NITKLUDKMYJ75RHJSPHOJ7XT.woff2"
curl -fsSL -o app/fonts/CabinetGrotesk-Bold.woff2     "$BASE/XMXWOHABYLQDJ42L65EFRYNVRY37HQCB/B2O4O6V3JMFM2WDCYQI3A47L5U4THDUL/WN5274VQ3AUBDFP74GB4EC4XYJ3EKVNE.woff2"
curl -fsSL -o app/fonts/CabinetGrotesk-Extrabold.woff2 "$BASE/ZX6AQLSFYVDPN2URWO2MQFGTYYOHIS64/TPYPKOYWFQVNJHLLRXD4KFYX4LUOUW4Z/6QH2ALVTTK7IRVO5MYOQQ3OZNXW5SSS3.woff2"
curl -fsSL -o app/fonts/CabinetGrotesk-Bold.ttf       "$BASE/XMXWOHABYLQDJ42L65EFRYNVRY37HQCB/B2O4O6V3JMFM2WDCYQI3A47L5U4THDUL/WN5274VQ3AUBDFP74GB4EC4XYJ3EKVNE.ttf"
ls -la app/fonts && file app/fonts/* 2>/dev/null || true
```
Expected: four files, each 30–120 KB; `file` (if available) reports "Web Open Font Format (Version 2)" for the woff2 files and "TrueType" for the ttf. If any URL 404s, fetch the current URLs with `curl -sL "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&display=swap"` and use the `woff2`/`ttf` paths it prints.

- [ ] **Step 2: Record the licence**

`app/fonts/LICENSE.txt`:
```
Cabinet Grotesk — designed by Indian Type Foundry, distributed by Fontshare.
Licensed under the ITF Free Font License (https://www.fontshare.com/licenses/itf-ffl).
Self-hosted copies: Medium (500), Bold (700), Extrabold (800) as woff2; Bold as ttf for server-side OG image rendering.
Downloaded 2026-08-21 from https://cdn.fontshare.com/.
```

- [ ] **Step 3: Create `lib/fonts.ts`**

```ts
import { Inter } from "next/font/google";
import localFont from "next/font/local";

/** Body and UI face. Variable font, one file. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Display face for headings, buttons, and the wordmark. */
export const cabinet = localFont({
  src: [
    { path: "../app/fonts/CabinetGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/CabinetGrotesk-Bold.woff2", weight: "700", style: "normal" },
    { path: "../app/fonts/CabinetGrotesk-Extrabold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
```

- [ ] **Step 4: Wire the fonts into `app/layout.tsx`**

Replace lines 1–15 (the `next/font/google` import and the three font constants) so the top of the file reads:
```tsx
import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BASE_URL } from "./sitemap";
import { inter, cabinet } from "@/lib/fonts";
import { PathProvider } from "@/lib/path-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion-provider";
import { SWRegister } from "@/components/sw-register";
import { BackToTop } from "@/components/back-to-top";
```
and change the `<html>` className to:
```tsx
className={`${inter.variable} ${cabinet.variable} h-full antialiased`}
```

- [ ] **Step 5: Build to verify the fonts resolve**

Run: `npm run build`
Expected: build succeeds; no "Failed to find font override values" or missing-file errors. (Until Task 3, headings still reference `--font-space-grotesk`, which is now undefined and falls back to the system stack — expected for one commit.)

- [ ] **Step 6: Commit**

```bash
$G add app/fonts lib/fonts.ts app/layout.tsx
$G commit -m "feat(fonts): Inter + self-hosted Cabinet Grotesk via next/font"
```

---

### Task 3: Token rewrite in `app/globals.css` and the contrast gate

**Files:**
- Modify: `app/globals.css` (full rewrite), `scripts/verify-contrast.mjs` (full rewrite)

**Interfaces:**
- Produces Tailwind utilities: colours `paper band tint card ink ink-soft ink-faint on-navy line line-strong control primary primary-deep primary-tint primary-soft verified verified-fill verified-tint caution caution-fill caution-tint info info-fill info-tint coral coral-fill coral-tint` (+ legacy `paper-2 paper-3 signal signal-deep signal-tint signal-light caution-text`); fonts `font-sans font-display font-mono`; radii `rounded-sm rounded-md rounded-lg rounded-pill`; type `text-hero text-display text-h2 text-h3 text-h4 text-h5 text-lead text-body text-small text-caption text-kicker` (each carrying its line-height / weight / tracking); helpers `.container-x .kicker .font-display .link-sweep .skip-link .font-mono`.

- [ ] **Step 1: Replace `app/globals.css` wholesale**

```css
@import "tailwindcss";

/* ------------------------------------------------------------------ */
/*  Hire From PH — design tokens                                       */
/*  Spec: docs/superpowers/specs/2026-08-21-ui-overhaul-design.md §4   */
/*  Inter (text) + Cabinet Grotesk (display). Light only.              */
/* ------------------------------------------------------------------ */

:root {
  /* Surfaces */
  --paper: #FFFFFF;
  --band: #F7F6FF;
  --tint: #EEEDFF;
  --card: #FFFFFF;

  /* Ink */
  --ink: #0E1230;
  --ink-soft: #4A4F66;
  --ink-faint: #6B7087;
  --on-navy: #F7F6FF;

  /* Lines */
  --line: #E4E4EA;
  --line-strong: #CFCFD8;
  --control: #8A8FA3;

  /* Primary */
  --primary: #4B4EF6;
  --primary-deep: #3634D8;
  --primary-tint: #EEEDFF;
  --primary-soft: #C9C8FF;

  /* Semantic accents. Bare name = deep/text value (AA on paper and on its tint).
     *-fill = vibrant shape colour (ink text only). *-tint = pale surface. */
  --verified: #067647;
  --verified-fill: #12B76A;
  --verified-tint: #E6F7EE;
  --caution: #9A5B00;
  --caution-fill: #F5A623;
  --caution-tint: #FFF4DB;
  --info: #026AA2;
  --info-fill: #0BA5EC;
  --info-tint: #E0F2FE;
  --coral: #B42318;
  --coral-fill: #FF5A5F;
  --coral-tint: #FFECEB;

  /* Legacy aliases — consumed by pre-overhaul pages. Removed in Phase 5. */
  --paper-2: #FFFFFF;
  --paper-3: #F7F6FF;
  --signal: #4B4EF6;
  --signal-deep: #3634D8;
  --signal-tint: #EEEDFF;
  --signal-light: #8D8BFF;
  --caution-text: #9A5B00;

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;
  --radius: 12px; /* legacy */

  /* Depth — borders carry hierarchy; shadows are for floating layers only */
  --shadow-sm: 0 1px 2px rgb(14 18 48 / 0.06);
  --shadow-md: 0 8px 24px rgb(14 18 48 / 0.08);
  --shadow-lg: 0 8px 24px rgb(14 18 48 / 0.08); /* legacy alias */
  --shadow-signal: none; /* legacy; hover lifts are gone */

  /* Motion */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 150ms;

  /* Layout */
  --maxw: 1280px;
  --maxw-wide: 1440px;
  --maxw-narrow: 720px;
  --gutter: clamp(1.25rem, 4vw, 2.5rem);
}

@theme inline {
  --color-paper: var(--paper);
  --color-band: var(--band);
  --color-tint: var(--tint);
  --color-card: var(--card);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-ink-faint: var(--ink-faint);
  --color-on-navy: var(--on-navy);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-control: var(--control);
  --color-primary: var(--primary);
  --color-primary-deep: var(--primary-deep);
  --color-primary-tint: var(--primary-tint);
  --color-primary-soft: var(--primary-soft);
  --color-verified: var(--verified);
  --color-verified-fill: var(--verified-fill);
  --color-verified-tint: var(--verified-tint);
  --color-caution: var(--caution);
  --color-caution-fill: var(--caution-fill);
  --color-caution-tint: var(--caution-tint);
  --color-info: var(--info);
  --color-info-fill: var(--info-fill);
  --color-info-tint: var(--info-tint);
  --color-coral: var(--coral);
  --color-coral-fill: var(--coral-fill);
  --color-coral-tint: var(--coral-tint);

  /* Legacy colour utilities (Phase 5 removes) */
  --color-paper-2: var(--paper-2);
  --color-paper-3: var(--paper-3);
  --color-signal: var(--signal);
  --color-signal-deep: var(--signal-deep);
  --color-signal-tint: var(--signal-tint);
  --color-signal-light: var(--signal-light);
  --color-caution-text: var(--caution-text);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-cabinet), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-pill: var(--radius-pill);

  /* Type scale — Learnora's desktop values (78/60/40/32/24/20/18/16/15/13) made fluid */
  --text-hero: clamp(2.75rem, 1.6rem + 4.2vw, 4.875rem);
  --text-hero--line-height: 1.1;
  --text-hero--letter-spacing: -0.01em;
  --text-hero--font-weight: 800;
  --text-display: clamp(2.25rem, 1.4rem + 3vw, 3.75rem);
  --text-display--line-height: 1.1;
  --text-display--letter-spacing: -0.01em;
  --text-display--font-weight: 800;
  --text-h2: clamp(1.875rem, 1.3rem + 1.9vw, 2.5rem);
  --text-h2--line-height: 1.15;
  --text-h2--letter-spacing: -0.01em;
  --text-h2--font-weight: 700;
  --text-h3: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  --text-h3--line-height: 1.2;
  --text-h3--font-weight: 700;
  --text-h4: 1.5rem;
  --text-h4--line-height: 1.3;
  --text-h4--font-weight: 700;
  --text-h5: 1.25rem;
  --text-h5--line-height: 1.4;
  --text-h5--font-weight: 700;
  --text-lead: clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem);
  --text-lead--line-height: 1.6;
  --text-body: 1.125rem;
  --text-body--line-height: 1.6;
  --text-small: 0.9375rem;
  --text-small--line-height: 1.5;
  --text-caption: 0.8125rem;
  --text-caption--line-height: 1.4;
  --text-kicker: 0.8125rem;
  --text-kicker--line-height: 1;
  --text-kicker--letter-spacing: 0.06em;
  --text-kicker--font-weight: 600;
}

/* ------------------------------------------------------------------ */
/*  Base                                                               */
/* ------------------------------------------------------------------ */

* {
  border-color: var(--line);
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

::selection {
  background: var(--primary);
  color: #fff;
}

:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Skip link: first focusable element, visible only on focus */
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--ink);
  color: var(--on-navy);
  border-radius: var(--radius-sm);
  font-weight: 600;
}
.skip-link:focus {
  top: 1rem;
}

/* Page gutter + max width */
.container-x {
  width: 100%;
  max-width: var(--maxw);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

/* ------------------------------------------------------------------ */
/*  Legacy helpers (pre-overhaul pages). Phase 1 ships primitives;     */
/*  Phase 5 deletes these.                                             */
/* ------------------------------------------------------------------ */

.font-display {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.01em;
}

@layer base {
  .kicker {
    font-family: var(--font-sans);
    font-size: var(--text-kicker);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
}

.font-mono {
  font-variant-numeric: tabular-nums;
}

.link-sweep {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.2em;
  transition: text-decoration-color var(--dur) var(--ease-out);
}
.link-sweep:hover {
  text-decoration-color: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Rewrite `scripts/verify-contrast.mjs` for the new pairs**

```js
// WCAG contrast gate over the tokens in app/globals.css.
// Text pairs need 4.5:1; UI-component pairs (form borders) need 3:1.
// Run: npm run verify:contrast
import { readFile } from "node:fs/promises";

const TEXT = [
  ["ink", "paper"],
  ["ink-soft", "paper"],
  ["ink-faint", "paper"],
  ["ink-faint", "band"],
  ["ink", "band"],
  ["ink", "tint"],
  ["primary", "paper"],
  ["primary", "band"],
  ["primary-deep", "primary-tint"],
  ["verified", "paper"],
  ["verified", "verified-tint"],
  ["caution", "paper"],
  ["caution", "caution-tint"],
  ["info", "paper"],
  ["info", "info-tint"],
  ["coral", "paper"],
  ["coral", "coral-tint"],
  ["on-navy", "ink"],
  ["primary-soft", "ink"],
  // legacy aliases still rendered by pre-overhaul pages
  ["signal", "paper"],
  ["signal-deep", "signal-tint"],
  ["signal-light", "ink"],
  ["caution-text", "caution-tint"],
];
// White text on these fills must pass 4.5:1.
const WHITE_ON = ["primary", "primary-deep", "ink", "verified", "caution", "info", "coral", "signal", "signal-deep"];
// Ink text on the vibrant fills must pass 4.5:1.
const INK_ON = ["verified-fill", "caution-fill", "info-fill", "coral-fill"];
// Non-text UI boundaries need 3:1.
const UI = [["control", "paper", 3]];

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function token(name, depth = 0) {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  const v = m[1].trim();
  const hex = v.match(/^#[0-9a-fA-F]{6}$/);
  if (hex) return v.toUpperCase();
  const ref = v.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (ref && depth < 3) return token(ref[1], depth + 1);
  throw new Error(`token --${name} is not a 6-digit hex or var() alias: ${v}`);
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
let checked = 0;
const check = (label, fg, bg, min) => {
  checked++;
  const r = ratio(fg, bg);
  if (r < min) failures.push(`${label}: ${r.toFixed(2)}:1 (need ${min}:1)`);
};

for (const [fg, bg] of TEXT) check(`--${fg} on --${bg}`, token(fg), token(bg), 4.5);
for (const fill of WHITE_ON) check(`white on --${fill}`, "#FFFFFF", token(fill), 4.5);
for (const fill of INK_ON) check(`--ink on --${fill}`, token("ink"), token(fill), 4.5);
for (const [fg, bg, min] of UI) check(`--${fg} on --${bg} (UI)`, token(fg), token(bg), min);

if (failures.length) {
  console.error("Contrast failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log(`Contrast OK — ${checked} pairs pass.`);
```

- [ ] **Step 3: Run the contrast gate**

Run: `npm run verify:contrast`
Expected: `Contrast OK — 37 pairs pass.` (23 text + 9 white-on-fill + 4 ink-on-fill + 1 UI) If a pair fails, the hex in `globals.css` is wrong — compare against the Global Constraints list; do not lower the threshold.

- [ ] **Step 4: Build and eyeball**

Run: `npm run build && npm run lint`
Expected: both pass. Then `npm run dev` briefly and open `/`, `/start`, `/reality`: headings render in Cabinet Grotesk, body in Inter, background white, links/buttons blue-violet, no element is still forced to 6px radius (cards now show Tailwind's default `rounded-2xl` — acceptable until Phase 5).

- [ ] **Step 5: Commit**

```bash
$G add app/globals.css scripts/verify-contrast.mjs
$G commit -m "feat(tokens): new palette, type scale, radii; drop global radius hack; update contrast gate"
```

---

### Task 4: Skip link, `<main id="main">`, theme colour

**Files:**
- Modify: `app/layout.tsx` (the `viewport` export and the `<body>` JSX)

- [ ] **Step 1: Update the viewport theme colour**

Change:
```tsx
export const viewport: Viewport = {
  themeColor: "#3A35D6",
};
```
to:
```tsx
export const viewport: Viewport = {
  themeColor: "#4B4EF6",
};
```

- [ ] **Step 2: Add the skip link and the main landmark id**

Inside `<body …>`, immediately after the JSON-LD `<script>` and before `<PathProvider>`, add:
```tsx
<a href="#main" className="skip-link">
  Skip to content
</a>
```
and change `<main className="relative z-[2] flex-1">` to:
```tsx
<main id="main" tabIndex={-1} className="relative z-[2] flex-1 outline-none">
```

- [ ] **Step 3: Verify with the keyboard**

Run: `npm run dev`, open `/`, press Tab once.
Expected: a navy "Skip to content" pill appears top-left; Enter moves focus past the header (the URL gains `#main`).

- [ ] **Step 4: Commit**

```bash
$G add app/layout.tsx
$G commit -m "feat(a11y): skip link and main landmark; new theme colour"
```

---

### Task 5: The new logo — ladder-H mark

**Concept (from the `logo-conceptualization` skill, recorded here so the drawing carries the idea, not the document):**
The field's clichés (graduation cap, open book, lightbulb, up-and-right arrow, globe, handshake, rocket, people-circle, Philippine sun) are all excluded. The mark depicts the site's own doctrine: *"send the ladder back down"* (the GIVE method) and *you climb it yourself*. The letter **H** of Hire is literally a ladder segment — two rails and a rung — so the mark is an H drawn as a three-rung ladder. Wrong-read audit: "#" (no — nothing crosses past the rails), railway track (no — three rungs, not many), fence/table (weak at 3 rungs with a dominant vertical). Passes one-colour, reads at 16 px (five rectangles), has a square token (the mark) and a wide lockup (mark + wordmark).

**Files:**
- Modify: `components/logo.tsx` (full rewrite, same exports), `app/icon.svg` (replace), `app/opengraph-image.tsx` (mark + font), `app/manifest.ts` (theme colour if present)

**Interfaces:**
- Keeps: `LogoMark({ size?, className?, title?, onDark?, mono? })`, `Logo({ className?, markSize?, wordmark?, onDark?, showTagline? })`, `Bracket({ className? })` (now draws a single rail-and-rung glyph; check callers first).

- [ ] **Step 1: Find callers of the current exports**

Run: `grep -rn "Bracket\|LogoMark\|from \"@/components/logo\"" app components --include=*.tsx`
Expected: `site-header.tsx`, `site-footer.tsx`, possibly `opengraph-image.tsx` and `not-found.tsx`. Note any `Bracket` caller; the new `Bracket` keeps the same signature.

- [ ] **Step 2: Rewrite `components/logo.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ladder-H mark. The H of "Hire" drawn as a three-rung ladder:
 * you climb it yourself, then send it back down (the GIVE method).
 * Five rectangles on a 32×32 grid, so it survives 16 px and one colour.
 */
export function LogoMark({
  size = 32,
  className,
  title,
  onDark,
  mono,
}: {
  size?: number;
  className?: string;
  title?: string;
  /** On the navy band: soft-violet rails, white rungs. */
  onDark?: boolean;
  /** Single colour (currentColor) for stamps, print, and favicons. */
  mono?: boolean;
}) {
  const rail = mono ? "currentColor" : onDark ? "var(--primary-soft)" : "var(--primary)";
  const rung = mono ? "currentColor" : onDark ? "#FFFFFF" : "var(--ink)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <rect x="6" y="3" width="4" height="26" rx="1" fill={rail} />
      <rect x="22" y="3" width="4" height="26" rx="1" fill={rail} />
      <rect x="10" y="5" width="12" height="4" fill={rung} />
      <rect x="10" y="14" width="12" height="4" fill={rung} />
      <rect x="10" y="23" width="12" height="4" fill={rung} />
    </svg>
  );
}

/** Wide lockup: mark + "Hire From PH" wordmark in the display face. */
export function Logo({
  className,
  markSize = 30,
  wordmark,
  onDark,
  showTagline,
}: {
  className?: string;
  markSize?: number;
  wordmark?: ReactNode;
  onDark?: boolean;
  /** Show "the standard, not the discount" under the wordmark. */
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} onDark={onDark} />
      <span className="inline-flex flex-col">
        <span className="font-display text-[1.25rem] font-bold leading-none tracking-[-0.01em]">
          {wordmark ?? (
            <>
              Hire From{" "}
              <span className={onDark ? "text-primary-soft" : "text-primary"}>PH</span>
            </>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[0.625rem] font-medium uppercase leading-none tracking-[0.08em] min-[400px]:block",
              onDark ? "text-on-navy/70" : "text-ink-faint",
            )}
          >
            the standard, not the discount
          </span>
        )}
      </span>
    </span>
  );
}

/** A single rail-and-rung glyph for pull-quotes and section rules. */
export function Bracket({ className }: { className?: string }) {
  return (
    <svg width="12" height="32" viewBox="0 0 12 32" fill="currentColor" className={className} aria-hidden>
      <rect x="0" y="2" width="4" height="28" rx="1" />
      <rect x="4" y="14" width="8" height="4" />
    </svg>
  );
}
```

- [ ] **Step 3: Replace `app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="#4B4EF6"/>
  <g fill="#FFFFFF" transform="translate(16 16) scale(0.78) translate(-16 -16)">
    <rect x="6" y="3" width="4" height="26" rx="1"/>
    <rect x="22" y="3" width="4" height="26" rx="1"/>
    <rect x="10" y="5" width="12" height="4"/>
    <rect x="10" y="14" width="12" height="4"/>
    <rect x="10" y="23" width="12" height="4"/>
  </g>
</svg>
```

- [ ] **Step 4: Update `app/opengraph-image.tsx`**

Read the file first. Keep its `size`, `contentType`, and `runtime` exports. Replace the old bracket-PH path elements with the five rectangles from Step 3 (scaled to the card), set the background to flat `#4B4EF6` (no gradient), the headline to "Be the reason they hire from the Philippines." and the URL line `hirefrom.ph`. Load Cabinet Grotesk Bold for the headline:

```tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
// inside the default export, before `new ImageResponse(...)`:
const cabinetBold = await readFile(join(process.cwd(), "app/fonts/CabinetGrotesk-Bold.ttf"));
// pass to ImageResponse options:
{ ...size, fonts: [{ name: "Cabinet Grotesk", data: cabinetBold, weight: 700, style: "normal" }] }
```
and set `fontFamily: "Cabinet Grotesk"` on the headline element. If the route declares `export const runtime = "edge"`, change it to `"nodejs"` (the Node `readFile` requires it; the image is generated at build time either way).

- [ ] **Step 5: Update `app/manifest.ts` colours**

Read it; replace any `#3A35D6` with `#4B4EF6` and any `#F6F7F9` background with `#FFFFFF`.

- [ ] **Step 6: Verify**

Run: `npm run build && npx tsc --noEmit`
Expected: pass. Then `npm run dev`, open `/` — header shows the ladder mark beside "Hire From PH" with violet "PH"; footer shows the dark variant; open `/opengraph-image` — the card renders with the mark and the Cabinet Grotesk headline; the browser tab shows the violet rounded square with the white ladder.

- [ ] **Step 7: Commit**

```bash
$G add components/logo.tsx app/icon.svg app/opengraph-image.tsx app/manifest.ts
$G commit -m "feat(brand): ladder-H logo mark, favicon, and OG card"
```

---

### Task 6: Build guide and README tokens section

**Files:**
- Modify: `BUILD_GUIDE.md` (the "Design tokens" block and the first paragraph), `README.md` (the "Design" section)

- [ ] **Step 1: Replace the tokens block in `BUILD_GUIDE.md`**

Replace the paragraph starting `## Design tokens (Tailwind utilities already wired)` through the `Helpers (globals.css)` line with:

```markdown
## Design tokens (Tailwind utilities already wired)
Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` §4. Phase 0 of the overhaul shipped these; Phases 1–5 replace the page structure.

Surfaces: `paper` (white), `band` (lavender section band), `tint`, `card`. Ink: `ink`, `ink-soft`, `ink-faint`, `on-navy`. Lines: `line`, `line-strong`, `control` (form borders, 3:1).
Primary: `primary`, `primary-deep`, `primary-tint`, `primary-soft`.
Semantic accents — the bare name is the **text/deep** value (AA on paper and on its tint); `*-fill` is the vibrant shape colour and takes **ink text only**; `*-tint` is the pale surface: `verified`, `caution`, `info`, `coral` (red flags). Stage ids in JSON (`signal|caution|verified|info`) resolve through `lib/accent.ts` — **never re-declare accent maps in a page.**
White text is allowed only on `primary`, `primary-deep`, `ink`, and the deep semantic values.

Fonts: `font-display` (Cabinet Grotesk — headings, buttons, wordmark), `font-sans` (Inter — everything else). No mono family.
Type: `text-hero` `text-display` `text-h2` `text-h3` `text-h4` `text-h5` `text-lead` `text-body` `text-small` `text-caption` `text-kicker` — each utility already carries its line-height, weight, and tracking; do not pair with `leading-*`.
Radius: `rounded-sm` (8) `rounded-md` (12) `rounded-lg` (20) `rounded-pill`. Shadows: `shadow-[var(--shadow-sm)]` (dropdowns) and `--shadow-md` (dialogs) only — cards use borders, never shadows, never hover lifts.
Helpers (globals.css): `.container-x`, `.skip-link`. Legacy helpers `.kicker`, `.font-display`, `.link-sweep` remain until Phase 5.
```

Also change the opening line `Next.js 16 App Router, React 19, Tailwind v4 (CSS-first, tokens in `app/globals.css`), `motion` for animation, `lucide-react` icons.` to `… `motion` for state-change animation only, Phosphor icons via `components/icon.tsx` (lucide is being removed; add no new lucide imports).`

- [ ] **Step 2: Update README's Design section**

Replace the `## Design` paragraph with:
```markdown
## Design

Inter (text) × Cabinet Grotesk (display), navy ink on white with lavender bands, one blue-violet primary and four semantic accents, 8/12/20px radii, bordered cards. Tokens in `app/globals.css`; the overhaul spec lives in `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md`. Shared conventions in `BUILD_GUIDE.md` — **read it before building any page.**
```

- [ ] **Step 3: Commit**

```bash
$G add BUILD_GUIDE.md README.md
$G commit -m "docs: tokens and font conventions for the overhaul"
```

---

### Task 7: Phase exit verification

**Files:** none modified unless a check fails.

- [ ] **Step 1: Run the whole gate**

Run:
```bash
npm run verify:all && npm test && npm run build
```
Expected: contrast OK (37 pairs), claims check exits 0 (warnings allowed), lint clean, `tsc` clean, node tests + 4 vitest tests pass, build succeeds with every route listed.

- [ ] **Step 2: Check the font files shipped**

Run: `ls .next/static/media | grep -i -E "cabinet|inter" | head`
Expected: hashed woff2 files for Cabinet Grotesk (3) and Inter (≥ 1).

- [ ] **Step 3: Record the state**

Append to `docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md` under a new `## Status` heading: the date, the commit SHA of the last task, and the `verify:contrast` pair count. Commit:
```bash
$G add docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md
$G commit -m "docs(plan): phase 0 complete"
```

---

## Self-review notes

- Spec §4.1 type scale → Task 3 `@theme` block (all 11 roles + button/nav handled by primitives in Phase 1). §4.2 colour → Task 3 `:root` + Task 1 accent map. §4.3 radii/shadows → Task 3. §4.6 icons → constraint only (migration in Phase 5). §10 skip link/focus ring → Task 4 and Task 3. §2 logo row → Task 5. §13 Vitest → Task 1. §15 docs → Task 6.
- Names used consistently: `ACCENT`, `accent()`, `isAccent`, `--font-inter`, `--font-cabinet`, `text-primary`, `bg-*-fill`.
- Deliberate deviations from the spec: semantic token naming (bare = text value) — recorded in Global Constraints and BUILD_GUIDE.
