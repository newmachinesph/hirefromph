# Rebrand: DevUp → Hire From PH

**Date:** 2026-08-10
**Status:** Design, awaiting approval
**Scope:** Brand identity only — name, logo, palette, typography. Every learning resource, route, component behaviour, and piece of instructional content stays exactly as it is.

---

## 1. Why

DevUp is a learner-facing career portal for Filipinos. The site is being renamed **Hire From PH**, a phrase spoken by an employer rather than a learner, because the product will pivot to an employer-facing talent platform later. The learning resources remain the entire product for now.

That gives the rebrand one governing constraint:

> **Build an identity that is already credible to an employer, wrap it around learner-facing content, and require no second rebrand at the pivot.**

Visual system reads professional and credible. Copy voice stays warm, direct, and Taglish-friendly, exactly as `BUILD_GUIDE.md` mandates.

### Decisions taken

| Question | Decision |
|---|---|
| Audience posture | Employer-legible visuals now; learner-facing copy now; employer pivot later without re-skinning |
| Philippine flag imagery | **None.** "PH" is carried by the name alone. No blue/red/gold heraldry, no eight-ray sun |
| Visual direction | **Signal** — cool near-white, graphite ink, one electric indigo |
| Logo | **Bracket PH** — the letters `PH` inside a hard bracket |
| Domain | `https://hirefrom.ph` |
| Social links | Removed entirely from this pass |

### Explicit non-goals

- No new routes, no new features, no content restructuring
- No changes to the core doctrine (`data/doctrine.json`) or the honesty doctrine
- No employer-facing pages, directory, or sign-up in this pass
- No dark mode (site remains light-only)
- No refactoring unrelated to the rebrand

---

## 2. Brand core

| | Old | New |
|---|---|---|
| Name | DevUp | **Hire From PH** |
| Wordmark accent | `Up` | `PH` |
| Meaning | "Developing upwards" | **"Be the reason they hire from the Philippines."** |
| Lockup sub-line | "developing upwards" | **"the standard, not the discount"** |
| Standard kicker | "The DevUp standard" | "The Hire From PH standard" |

The sub-line is deliberate positioning work for the pivot. Filipino remote talent is routinely sold on price; the brand stakes the opposite claim. It is a positioning statement, not a statistic, so it carries no sourcing obligation under the honesty doctrine.

### Exact copy for `data/site.json`

```json
"brand": "Hire From PH",
"wordmarkAccent": "PH",
"meaning": "Be the reason they hire from the Philippines.",
"tagline": "Be the reason they hire from the Philippines. The complete platform for building an online career, open to every Filipino.",
"mission": "Hire From PH is built on one idea: the people companies hire from the Philippines should be the ones worth hiring anywhere. Every step compounds on the last, and every skill you gain is one you keep. An open, path-based platform that takes Filipinos from zero to a thriving remote career as an online professional, trusted with outcomes, not just tasks. Built to the standard of a real operations team, and given openly.",
"standard": {
  "kicker": "The Hire From PH standard",
  "title": "We don't hand you files. We make you resourceful.",
  "body": "Anyone can give you a resume template. It makes you look like every other applicant, and it stops helping the moment the job is different. Hire From PH teaches you the anatomy, the rules, and the judgment, then you build your own, from a blank page, for any situation. That skill is the actual asset, and no one can take it off you."
}
```

The final clause of `standard.body` changes because "it only ever develops upwards" was a DevUp pun with nothing to attach to now.

Unchanged: `standard.principles[]`, `stats[]` (factual counts of site content, not social proof), `navGroups[]`, `primaryNav[]`.
Removed: the entire `social` block.

### Exact copy for `app/layout.tsx` metadata

| Field | New value |
|---|---|
| `title.default` | `Hire From PH — Be the reason they hire from the Philippines.` |
| `title.template` | `%s · Hire From PH` |
| `applicationName` | `Hire From PH` |
| `openGraph.siteName` | `Hire From PH` |
| `openGraph.title` / `twitter.title` | `Hire From PH — Build the online career you actually own.` |
| `viewport.themeColor` | `#3A35D6` |

`description`, `keywords`, `openGraph.locale`, and `robots` are unchanged — they describe the audience and subject matter, which the rebrand does not alter. Organization and WebSite JSON-LD `name` fields become `Hire From PH`; their `description` fields drop no substance.

### Exact copy for `app/manifest.ts`

| Field | New value |
|---|---|
| `name` | `Hire From PH — the standard, not the discount` |
| `short_name` | `Hire From PH` |
| `description` | unchanged |
| `background_color` | `#F6F7F9` |
| `theme_color` | `#3A35D6` |

**Honesty-doctrine constraint on all rewritten copy:** no new statistic, count, testimonial, or outcome claim may be introduced. The rebrand rewords brand identity only. Any existing `source: {label,url}` object stays attached to its claim.

---

## 3. Palette

Direction: **Signal**. Cool near-white surfaces, graphite ink, one electric indigo doing all the emphasis work.

The existing token names are already misleading — `--coral` currently holds a teal `#0a736a`. The rebrand renames them semantically rather than propagating the lie.

### Token map

| Old token | New token | Value | Role |
|---|---|---|---|
| `--coral` | `--signal` | `#3A35D6` | primary, CTA, emphasis |
| `--coral-deep` | `--signal-deep` | `#2A26A8` | hover / pressed |
| `--coral-tint` | `--signal-tint` | `#E8E7FC` | tinted surfaces |
| `--coral-light` | `--signal-light` | `#8E8AFF` | accent on dark `--ink` surfaces |
| `--emerald` | `--verified` | `#12724E` | free / sourced / passed / growth |
| `--emerald-tint` | `--verified-tint` | `#DDF1E7` | |
| `--indigo` | `--info` | `#0E6FA8` | cool support, neutral information |
| `--indigo-tint` | `--info-tint` | `#DDEEF8` | |
| `--amber` | `--caution` | `#B45309` | warning |
| `--amber-tint` | `--caution-tint` | `#FBEBD5` | |
| `--amber-text` | `--caution-text` | `#8A3F07` | text on caution tint |
| `--shadow-coral` | `--shadow-signal` | indigo rgba | |

### Surfaces and ink

| Token | Old | New |
|---|---|---|
| `--paper` | `#f1f6f4` | `#F6F7F9` |
| `--paper-2` | `#ffffff` | `#FFFFFF` |
| `--paper-3` | `#e3efeb` | `#ECEEF2` |
| `--card` | `#ffffff` | `#FFFFFF` |
| `--ink` | `#0e1f1b` | `#0F1115` |
| `--ink-soft` | `#435551` | `#464B57` |
| `--ink-faint` | `#5c6d67` | `#676D7C` |
| `--line` | `#dbe8e3` | `#E2E5EA` |
| `--line-strong` | `#c3d5ce` | `#C9CED8` |

### Contrast (WCAG AA, 4.5:1 minimum)

| Pair | Ratio |
|---|---|
| `signal` on `paper` | 7.3:1 |
| white on `signal` fill | 7.9:1 |
| `signal` on `signal-tint` | 6.5:1 |
| `signal-light` on `ink` | 6.5:1 |
| `verified` on `paper` | 5.5:1 |
| `verified` on `verified-tint` | 5.0:1 |
| `info` on `paper` | 5.1:1 |
| white on `info` fill | 5.4:1 |
| `caution` on `paper` | 4.7:1 |
| `caution-text` on `caution-tint` | 6.4:1 |

`caution` on `caution-tint` is 4.3:1 and **fails**. This is why `--caution-text` exists as a separate darker token, mirroring the existing `--amber-text` arrangement. The rename must preserve that split.

### Known risk

`signal` (violet-indigo, hue ≈ 242°) and `info` (true blue, hue ≈ 202°) sit 40° apart. Distinguishable, but weakest where they appear adjacent. Implementation includes an audit pass over every location that renders both in the same component, with `info` re-assigned to a neutral treatment where the two collide.

### Rename cost

| Term | Occurrences |
|---|---|
| `coral` in `app/` + `components/` | 505 |
| `emerald` in `app/` + `components/` | 333 |
| `indigo` in `app/` + `components/` + `data/` | 219 |
| `amber` in `app/` + `components/` + `data/` | 264 |
| `coral` / `emerald` in `data/*.json` | 108 |

All occurrences are token-shaped: Tailwind utilities (`text-coral`, `bg-emerald`, `border-indigo`), CSS custom properties, `@theme inline` mappings, or `"accent"` string values in JSON content. Tailwind's own `accent-color` utility appears as `accent-emerald` in four files and becomes `accent-verified`, which remains valid.

The sweep is mechanical and scriptable. Verification is `npm run build` plus a grep asserting zero surviving occurrences of the old names.

---

## 4. Typography

Three real families replace today's arrangement, where `--font-display`, `--font-sans`, and `--font-mono` all resolve to Geist.

| Token | Old | New | Used for |
|---|---|---|---|
| `--font-display` | Geist | **Space Grotesk** | headings, `.font-display` |
| `--font-sans` | Geist | **Inter Tight** | body |
| `--font-mono` | Geist | **Space Mono** | `.kicker`, figures, `.font-mono` |

All three load via `next/font/google`, matching the existing `Geist` pattern in `app/layout.tsx`. Latin subset only, `display: "swap"`.

Space Grotesk and Inter Tight are variable fonts, so they ship a single axis-spanning file and take no explicit `weight` array. Space Mono is static and must declare `weight: ["400", "700"]` — omitting it is a build error, not a silent default.

### Two intended side effects

1. **Every kicker on the site changes appearance.** `.kicker` sets `font-family: var(--font-mono)`, which currently resolves to the sans. A real monospace makes kickers read as intended for the first time.
2. **`.font-mono` tabular figures start working properly.** The class currently only sets `font-variant-numeric: tabular-nums` against a proportional face. Rate calculators and comparison tables will finally align.

### Cost

Three font families instead of one. Mitigated by subsetting, weight limits, and `swap`. Net payload increase is accepted as the price of the rebrand; it is measured after implementation and reported.

---

## 5. Geometry and texture

### Radius

`app/globals.css` currently forces `border-radius: 0 !important` on `*`, `*::before`, and `*::after`, with an `.is-circle` escape hatch. Underneath that reset the markup contains **552 neutralised `rounded-*` utilities**:

| Utility | Count |
|---|---|
| `rounded-2xl` | 217 |
| `rounded-full` | 128 |
| `rounded-xl` | 94 |
| `rounded-` (token form) | 89 |
| `rounded-lg` | 14 |
| others | 16 |

**Removing the reset is rejected.** It would uncork 217 `rounded-2xl` and 128 `rounded-full` simultaneously, producing a large uncontrolled visual change across 40 routes.

**Chosen approach:** keep the reset, change its value.

```css
:root { --radius: 6px; --radius-sm: 4px; --radius-lg: 10px; }

*, *::before, *::after { border-radius: var(--radius) !important; }
```

One line of behaviour change, uniform soft corners site-wide, total control, `.is-circle` still functions. The `--radius-sm` and `--radius-lg` tokens stay defined for any future opt-in but are not wired to the reset.

### Grain

The `body::before` fractal-noise overlay is removed. Signal is a clean surface; the grain belonged to the warm-paper editorial system it replaces.

### Focus ring

`outline-color` follows `--signal`; `border-radius: 6px` on the ring now matches the global radius rather than contradicting it.

---

## 6. Logo

**Concept: Bracket PH.** The letters `PH` held inside a hard bracket — the universal marker for *selected, this one*. It ties directly to the name, survives at favicon size, and the bracket alone becomes a reusable brand device.

### Production form

Pure inline SVG in a React component. No raster asset. `public/devup-logo.png` (39.9 KB) is deleted, returning the site to **zero external image assets**, which `BUILD_GUIDE.md` already requires of every page.

- **Mark:** drawn on a 32×32 grid so strokes land on whole pixels at 16px and 24px. Indigo bracket, graphite `PH`. `onDark` variant inverts to white.
- **Lockup:** mark + `Hire From ` in graphite + `PH` in `--signal`, optional `the standard, not the discount` sub-line.
- **`app/icon.svg`:** `--signal` fill, white bracket-PH glyph.
- **Device:** the bracket is exposed as a small reusable component for pull-quotes and section rules.

### Concept exploration

Bracket proportion, stroke weight, and letter fit are chosen by generating a set of raster explorations through the **codex bridge (`gpt-image-bridge`)**, per the standing instruction that all imagery goes through the codex bridge. The chosen exploration is then hand-cut as SVG — AI raster does not hold up at 24px, but it is the right tool for selecting proportion.

Exploration output is written to the session scratchpad, not committed.

### Interface

`components/logo.tsx` keeps its existing exported shape so no consumer changes:

- `LogoMark({ size, className, title, onDark })` — was `Image`-based, becomes `<svg>`
- `Logo({ className, markSize, wordmark, onDark, showTagline })` — unchanged signature
- `FacebookGlyph` — **deleted** (dead once socials are removed)

---

## 7. Removing social links

All five handles (`facebook.com/devupph`, the FB group, Instagram, YouTube, TikTok) are removed rather than repointed, because new accounts do not yet exist and dead links are worse than no links.

### Consequence that must be handled

**Facebook is currently the site's only contact channel.** `data/site.json` has no `contact` block, and `app/privacy/page.tsx:204` states the Facebook Page "is the one channel that reaches us."

Removing socials leaves `/privacy` promising a route that no longer exists. Under the site's own honesty doctrine that is not acceptable. Resolution:

- Delete the "Facebook is Facebook's rules, not ours" section and its three outbound links — the Meta privacy discussion no longer applies once nothing links to Meta.
- Rewrite the contact section to state plainly that there is currently no contact channel, and that one will be published when it exists. Stating the absence is the doctrine-compliant move; inventing an email is not.

### Surface

| File | Change |
|---|---|
| `components/social-links.tsx` | delete (37 lines) |
| `components/follow-modal.tsx` | delete (203 lines) |
| `app/layout.tsx` | drop `FollowModal` import + render; drop `sameAs` from JSON-LD |
| `components/site-footer.tsx` | drop `SocialLinks`, `FacebookGlyph`, and both FB links |
| `components/logo.tsx` | drop `FacebookGlyph` |
| `app/privacy/page.tsx` | rewrite as above |
| `data/site.json` | drop `social` block |

Deleting `follow-modal.tsx` also retires the `devup:fb-prompt` localStorage key, so it needs no migration.

---

## 8. Migration hazards

Three items would quietly damage existing visitors if handled naively.

### 8.1 Progress loss — highest risk

The site writes **three** independent `localStorage` keys, all namespaced `devup`:

| Key | Owner | Holds |
|---|---|---|
| `devup.path.v1` | `lib/path-context.tsx:90` | chosen path, stage, roadmap steps, 30-day plan answers and day ticks, equipment checklist |
| `devup.labs.v1` | `components/build-labs.tsx:18` | **the user's own written resume, portfolio, and SOP drafts** |
| `devup.worksheet.v1` | `components/rate-worksheet.tsx:13` | rate worksheet figures |

A fourth, `devup:fb-prompt` in `components/follow-modal.tsx:10`, is retired with that component and needs no migration.

Renaming any of these without migration silently destroys user data. **`devup.labs.v1` is the most damaging** — Build Labs is where the user writes their resume, portfolio, and SOPs from a blank page, in their own words. That prose is the doctrine's entire deliverable ("the artifact you leave with is written in your words"). Losing it would be the rebrand contradicting the product.

**Chosen approach: one shared helper, not three ad-hoc migrations.**

A new `lib/storage.ts` exports a single function used by all three call sites:

```ts
migrateKey(oldKey: string, newKey: string): void
```

Behaviour:
- No-op if `localStorage` is unavailable or throws (private mode, disabled storage).
- No-op if `newKey` already has a value — an existing new-key value is **never** overwritten by an old one.
- If `oldKey` is present and `newKey` is absent: copy the raw string across, then remove `oldKey`.
- The value is copied **as an opaque string, not parsed**. Validation stays where it already lives, in each consumer's existing load path, which already tolerates bad JSON. Parsing here would mean three different shapes to validate and a second place for that logic to rot.
- Any thrown `DOMException` (quota, security) is swallowed; a failed migration must never break page render.

Call sites migrate `devup.path.v1` → `hfph.path.v1`, `devup.labs.v1` → `hfph.labs.v1`, `devup.worksheet.v1` → `hfph.worksheet.v1`, each on mount before its first read.

This is the only part of the rebrand with genuine behavioural risk. It gets its own test file.

### 8.2 Service worker cache

`public/sw.js:4` uses `const CACHE = "devup-v1"` → `"hfph-v1"`.

This bust is **desired**. Returning visitors hold a cached copy of the teal site; changing the cache name is what causes them to fetch the rebranded assets rather than serving stale CSS from the old shell.

### 8.3 Canonical URL

`app/sitemap.ts:4` exports `BASE_URL = "https://devup.ph"`, consumed by the sitemap, `robots.ts`, `metadataBase`, canonical alternates, OpenGraph URLs, and both JSON-LD `@id` values.

Changes to `https://hirefrom.ph`.

**Out of scope, flagged for the operator:** DNS, hosting, TLS, and 301 redirects from the old domain. The code change alone does not preserve search ranking; redirects at the edge are required and are not a code deliverable.

---

## 9. Full file inventory

Brand strings appear in 24 files (~70 occurrences of `DevUp`).

### New

| File | Purpose |
|---|---|
| `scripts/verify-contrast.mjs` | parses tokens from `globals.css`, asserts every documented pair clears 4.5:1 |
| `lib/storage.ts` | `migrateKey(oldKey, newKey)` — shared localStorage rename helper (§8.1) |
| `lib/storage.test.mjs` | migration behaviour, alongside the existing `lib/*.test.mjs` convention |

### Deleted

| File |
|---|
| `public/devup-logo.png` |
| `components/social-links.tsx` |
| `components/follow-modal.tsx` |

### Modified

| File | Change |
|---|---|
| `app/globals.css` | tokens, `@theme inline` map, radius reset, grain removal, focus ring, header comment |
| `app/layout.tsx` | three fonts, metadata, `themeColor`, JSON-LD, `FollowModal` removal |
| `app/manifest.ts` | name, short_name, description, `background_color`, `theme_color` |
| `app/icon.svg` | new mark |
| `app/opengraph-image.tsx` | new brand, palette, type |
| `app/sitemap.ts` | `BASE_URL` |
| `app/privacy/page.tsx` | Facebook sections removed, contact rewritten |
| `app/tasks/page.tsx`, `app/tracker/page.tsx` | brand strings |
| `components/logo.tsx` | SVG mark + wordmark, `FacebookGlyph` deleted |
| `components/site-footer.tsx` | socials removed |
| `components/build-labs.tsx`, `rate-worksheet.tsx`, `stage-page.tsx`, `icon.tsx` | brand strings |
| `lib/path-context.tsx` | storage key `hfph.path.v1` + `migrateKey` call |
| `components/build-labs.tsx` | storage key `hfph.labs.v1` + `migrateKey` call |
| `components/rate-worksheet.tsx` | storage key `hfph.worksheet.v1` + `migrateKey` call |
| `lib/meta.ts` | title template |
| `public/sw.js` | cache name |
| `data/site.json` | brand block rewritten, `social` removed |
| `data/aifirst.json`, `apply.json`, `clients.json`, `tasks.json` | brand strings |
| all `data/*.json` | `"accent"` value rename |
| every file under `app/` + `components/` | token rename sweep |
| `README.md`, `BUILD_GUIDE.md`, `AGENTS.md` | brand, palette, font, token, doctrine-reference updates |
| `package.json` | `name` `freelearning` → `hire-from-ph`; add `verify:contrast` script |

---

## 10. Implementation phases

Ordered so each phase leaves the build green.

| Phase | Work | Green when |
|---|---|---|
| 1 | Contrast script written against the new palette | script fails against the current teal tokens — the RED step |
| 2 | Tokens + type in `globals.css` and `layout.tsx` | `verify:contrast` passes; build passes; site renders indigo under the old class names |
| 3 | Mechanical token rename sweep across `app/`, `components/`, `data/` | build passes; the §11 grep returns nothing |

Phases 1 and 2 land in **one commit**. Phase 1 alone would put a failing `npm run verify:contrast` on the branch, and a check that is known-red is a check people learn to ignore.
| 4 | Logo: codex-bridge exploration → hand-cut SVG → `icon.svg`, OG, manifest, PNG deleted | build passes; no raster assets remain |
| 5 | Name and copy strings across 24 files + `data/site.json` + docs | build passes; grep finds zero `DevUp` |
| 6 | Socials removed, `/privacy` rewritten | build passes; no dead links |
| 7 | Storage-key migration, SW cache, `BASE_URL` | migration test passes |
| 8 | Adjacency audit for `signal` vs `info` | visual pass |

---

## 11. Verification

| Check | Command |
|---|---|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Tests | `node --test` |
| Claims | `npm run verify:claims` |
| Contrast | `npm run verify:contrast` *(new)* |

### New test coverage

1. **Path migration** — old-key value is read, rewritten under the new key, old key cleared; malformed old value is discarded without throwing; existing new-key value is never overwritten by an old one.
2. **Contrast** — every foreground/background pair in §3 asserted at 4.5:1, parsed from `globals.css` so the test tracks the real tokens rather than a copy.

### Completion grep

Scoped to `app/ components/ data/ lib/ public/ scripts/` — **not** `docs/`, where this spec legitimately discusses the old names:

```
grep -rniE 'devup|coral|emerald|indigo|amber|#0a736a|#f1f6f4|#0e1f1b' \
  app components data lib public scripts
```

Must return nothing. `README.md`, `BUILD_GUIDE.md`, and `AGENTS.md` are checked separately by eye, since they describe the design system in prose.

### Manual acceptance
- Mark legible at 16px and 24px, and as a browser favicon
- A visitor with existing `devup.path.v1` progress loads the rebranded site with their path, stage, plan, and checklist intact
- No external image request on any route
- Every `source: {label,url}` that existed before still renders

---

## 12. Open items for the operator

Not code deliverables; flagged so they are not forgotten.

1. **Register `hirefrom.ph`** and point DNS at the host.
2. **301 redirects from `devup.ph`**, path-for-path, or search ranking is lost.
3. **Create the new social accounts**, then a follow-up pass restores the footer links and a contact channel.
4. **Google Analytics moves to a new property, `G-41TT5P31BY`** (hardcoded in `app/layout.tsx` via `@next/third-parties/google`, replacing `G-TYFCQVVHK6`). Because this is a *different* property rather than a rename, historical DevUp traffic does not carry over — the new property starts empty. If year-over-year continuity matters, export the old property's reports before its retention window closes, or keep both tags firing during a transition period.
