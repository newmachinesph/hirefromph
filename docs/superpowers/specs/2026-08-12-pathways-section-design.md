# New Section: The Complete Beginner Pathway (`/pathways`)

**Date:** 2026-08-12
**Status:** Design, awaiting approval
**Scope:** One new route that groups existing content into two named tracks and shows how they combine. **No new lessons, no new curricula, no changes to any existing route.**

---

## 1. Why

The site has 33 routes of real depth, but a beginner landing on it cannot tell which pages teach *the craft* and which teach *getting hired*. This section is a wayfinding layer: it names the two halves, shows how they feed each other, and points into the pages that already exist.

### Decisions taken

| Question | Decision |
|---|---|
| Paid or free? | **Free.** Non-commercial claims in `/privacy`, the footer, and JSON-LD stay true and untouched |
| "Virtual assistant" naming? | **Doctrine wins.** Renamed — the sitewide ban in `BUILD_GUIDE.md:40` stands |
| New curricula or new framing? | **Framing only.** Zero new lessons; every link points at an existing route |
| Relationship to the 5-stage journey? | **Fully separate.** The journey stays the spine; this page does not reference or restructure it |
| Diagram conventions | `cathrynlavery/diagram-design`, adapted to this site's tokens |
| Imagery | Hand-authored inline SVG diagram **plus** one generated decorative header image |

### Explicit non-goals

- No pricing, no purchase flow, no "enroll" language — the site sells nothing
- No new lessons, workshops, or teaching content
- No edits to the five-stage journey, the homepage, or `PathChooser`
- No new routes beyond `/pathways`
- No templates, scripts, or downloadable artifacts of any kind (core doctrine)

---

## 2. The naming

The submitted copy used "Virtual Assistant Foundations", "VA", "Blueprint", "Bundle", "System", and "Premium". Each collides with a standing rule.

| Submitted | Ships as | Rule it collided with |
|---|---|---|
| Virtual Assistant Foundations | **Do the Work** | `BUILD_GUIDE.md:40` — never say "virtual assistant" |
| Client Acquisition Blueprint | **Find the Work** | Core doctrine — "Blueprint" promises a handed-over artifact |
| The Complete VA Career Launch System | **The Complete Beginner Pathway** | Banned term; "System"/"Bundle" read as a paid product |
| "Stronger, More Premium Name Options" | *(dropped)* | Commercial framing on a non-commercial site |

**Page title:** The Complete Beginner Pathway
**Subtitle:** Learn the work. Find the clients. Build the career.

The subtitle is the submitted tagline, lightly adjusted ("skills" → "work") so it matches the two track names.

---

## 3. Exact copy

All of it lives in `data/pathways.json`. Nothing below may be paraphrased at implementation time.

```json
{
  "kicker": "Two tracks, one pathway",
  "title": "The Complete Beginner Pathway",
  "subtitle": "Learn the work. Find the clients. Build the career.",
  "intro": "Everything on this site falls into one of two halves. One half teaches you to do the work well enough that people keep you. The other teaches you to find the people who need it. Most beginners do only the first and wonder why nothing happens. Here is how the two fit together, and where each one lives.",
  "flow": [
    { "n": "01", "label": "Build the skills" },
    { "n": "02", "label": "Position your offer" },
    { "n": "03", "label": "Find clients" },
    { "n": "04", "label": "Deliver great work" }
  ],
  "tracks": [
    {
      "id": "do-the-work",
      "name": "Do the Work",
      "accent": "signal",
      "summary": "Learn the tools, workflows, and professional standards that make a remote professional worth keeping, plus the method for picking up any new tool in an afternoon, so the list never goes stale.",
      "teaches": "How to perform the work.",
      "links": [
        { "label": "The Method", "href": "/method" },
        { "label": "How to Learn", "href": "/learn" },
        { "label": "Learn Any Tool", "href": "/tools" },
        { "label": "Micro-Tasks", "href": "/tasks" },
        { "label": "Build Labs", "href": "/build" },
        { "label": "AI-First", "href": "/ai-first" }
      ]
    },
    {
      "id": "find-the-work",
      "name": "Find the Work",
      "accent": "verified",
      "summary": "Learn how to judge which opportunities are worth your time, how to position what you actually do, and how to write your own outreach from a blank page. No scripts to paste, because the message that works is the one that sounds like you.",
      "teaches": "How to find and approach the people who need it.",
      "links": [
        { "label": "Find Work", "href": "/apply" },
        { "label": "Get Legit", "href": "/legit" },
        { "label": "Own Your Clients", "href": "/clients" },
        { "label": "Portfolio Ladder", "href": "/portfolio" },
        { "label": "Interview Prep", "href": "/interview" }
      ]
    }
  ],
  "together": {
    "title": "Neither half works alone.",
    "body": "Skill without a pipeline is a hobby. A pipeline without skill is a short career and a bad reputation. Run both, in that order, and each one makes the other easier: the work you can do decides what you can honestly offer, and the clients you meet tell you which skill to build next."
  },
  "doctrineNote": "You will not find a script, a template, or a done-for-you file on either track. Both teach the anatomy and the judgment, then hand you a blank page. What you write is yours, it sounds like you, and it keeps working when the situation changes."
}
```

**Every label above is the route's real nav label from `data/site.json`, verified against the live nav.** They are deliberately not "better" names — a reader who clicks "Get Legit" here must land on a page the nav also calls "Get Legit", or the wayfinding this whole section exists to provide is broken. If a nav label changes later, this JSON follows it; never the reverse.

Two things that look like mistakes but are not:

- **The tracks are asymmetric — 6 links and 5.** `Find the Work` has five because `/findwork` is not a route: `data/findwork.json` is consumed by `app/apply/page.tsx`, which the nav calls "Find Work". Listing both would be the same page twice under two names.
- **`/get-hired` is deliberately absent** even though it fits the theme. It is a stage of the five-stage journey, and this page was scoped to stay fully separate from that model.

---

## 4. Route and structure

**New route:** `app/pathways/page.tsx`. Named `/pathways` rather than `/path` (taken by the path chooser) or `/tracks` (`data/tracks.json` already means niche tracks — reusing the word would be actively confusing).

Server Component. The diagram is static SVG with no interactivity, so nothing on this page needs `"use client"`.

Page shell follows the standard pattern from `BUILD_GUIDE.md`:

1. `Kicker` → `h1` → lead paragraph, wrapped in `Reveal`
2. Decorative header image (§6)
3. The flow diagram (§5)
4. Two track cards, side by side on `lg`, stacked on mobile
5. "Neither half works alone" panel
6. Doctrine note, visually quieter than the rest

Reuse existing components — `Kicker`, `SectionHeading`, `ArrowLink`, `Reveal` from `@/components/ui` and `@/components/reveal`. Do not re-invent a card or a link style; the conventions are in `BUILD_GUIDE.md`.

**Nav:** one entry added to the "Learn to build" group in `data/site.json` — `{ "label": "The Pathway", "href": "/pathways" }`. That group drives both the mobile nav and the footer, so one edit surfaces it in both.

**Metadata:** `export const metadata` with title and description, per the site's per-route convention.

**Sitemap:** `app/sitemap.ts` derives its URL list from the nav. Confirm this at implementation; if it uses a hardcoded list instead, add `/pathways` there too.

---

## 5. The diagram

`components/pathway-diagram.tsx` — inline SVG, no props, no state, no external dependency.

### Conventions from `cathrynlavery/diagram-design`, applied

| Rule | How it's applied here |
|---|---|
| One accent, 1–2 focal elements | Accent reserved for the two track-entry nodes only. The four flow steps are `--ink` on `--paper-2` |
| paper / ink / muted roles | `--paper-2`, `--ink`, `--ink-soft` — already the site's tokens |
| Every coord, width, gap divisible by 4 | Enforced. 960×320 viewBox, 16px gutters, 48px node height |
| No shadows | None. The site's `--shadow-*` tokens are not used in the diagram |
| Border-radius ≤ 10px | `6px`, matching `--radius` |
| 1px hairline borders | `stroke="var(--line-strong)" stroke-width="1"` |
| Self-contained, no external deps | Pure inline SVG in a `.tsx` file |
| WCAG AA verified | All text/background pairs use tokens already asserted by `npm run verify:contrast` |
| Density target 4/10 | 6 nodes and 5 connectors total. Nothing decorative |
| Deletion is the highest-quality move | No legend, no title block inside the SVG, no annotations. The page's `h1` and the track cards carry that text as real HTML |

### Three deliberate deviations

1. **Typography.** The repo specifies Instrument Serif + Geist Sans + Geist Mono. This site ships Space Grotesk + Inter Tight + Space Mono. The diagram uses **the site's families in the repo's roles** — display for headings, sans for node labels, mono restricted to the `01`–`04` step numbers. Importing two more families for one diagram is not worth the payload.
2. **Second accent.** The repo says one accent. This diagram uses `--signal` for one track and `--verified` for the other, because the two tracks are *peers* and colouring them identically would defeat the diagram's only job. Two focal colours total, both already contrast-verified.
3. **Text scale.** The repo's 9–12px guidance suits dense technical diagrams. Node labels here are 14px so they stay readable on a phone.

### Shape

Two track lanes on the left, converging into the four-stage flow left-to-right. `Do the Work` feeds steps 01 and 04; `Find the Work` feeds steps 02 and 03 — which is the actual claim being made, and is more honest than drawing both tracks feeding all four.

### Accessibility

`role="img"` with a `<title>` and `<desc>`. The `<desc>` states the relationship in prose, because a screen-reader user gets nothing from node coordinates. Every one of the four flow steps also appears as real text in the track cards below, so no information exists only inside the SVG.

### Responsive

`viewBox` with `width="100%"` and `preserveAspectRatio="xMidYMid meet"`. At 360px the 960-wide viewBox scales to roughly 37%, taking 14px labels to ~5px — illegible. So below `md` the SVG is hidden (`aria-hidden`) and the same relationship renders as a stacked ordered list of the four steps, which is already real text in the DOM. The diagram is an enhancement, never the only carrier of meaning.

---

## 6. The decorative header image

**This reverses the site's zero-raster state** and requires amending a standing rule. Doing it explicitly so the rule does not silently rot.

### The rule change

`BUILD_GUIDE.md:42` currently reads:

> No external images. Build visuals with CSS/SVG/gradients/`dotgrid`. Emoji flags OK.

It becomes:

> No external images, with one exception: `public/pathways-header.webp`, a decorative header on `/pathways`. Everything else is CSS/SVG/gradients/`dotgrid`. Emoji flags OK. Do not add a second raster without changing this line again.

### Generation

Produced through the **codex bridge (`gpt-image-bridge`)**, per the standing instruction that all imagery goes through it.

**Subject constraints:**
- **Abstract only — no people.** A stock-photo-style image of someone at a laptop would be a cliché, and on a site about Filipino professionals it invites a representation decision that a decorative asset has no business making.
- No text, no letterforms, no UI mockups — text inside a raster cannot be translated, selected, or kept in sync with the copy.
- Signal palette only: indigo `#3A35D6`, graphite `#0F1115`, cool near-white `#F6F7F9`.
- Flat, geometric, editorial. No gradients-as-decoration, no 3D, no drop shadows — it must sit beside the diagram without contradicting it.

### Implementation constraints

- **Format:** WebP. **Budget: ≤ 120 KB.** If the generated PNG exceeds it, convert and re-check rather than shipping it heavy.
- **Dimensions:** 1600×600, displayed responsively at `max-width: 100%`.
- Rendered with `next/image`, `priority={false}` — it sits below the `h1` and must not compete with LCP.
- **`alt=""` and `aria-hidden="true"`.** It is decorative. Descriptive alt text would make a screen reader announce something carrying no information.
- CSP already permits it: `img-src 'self' data: https:` in `next.config.ts`.

---

## 7. File inventory

### New

| File | Purpose |
|---|---|
| `app/pathways/page.tsx` | The route |
| `data/pathways.json` | All copy (§3) |
| `components/pathway-diagram.tsx` | Inline SVG diagram (§5) |
| `public/pathways-header.webp` | Decorative header (§6) |

### Modified

| File | Change |
|---|---|
| `data/site.json` | One nav entry in the "Learn to build" group |
| `BUILD_GUIDE.md` | Amend the no-external-images rule (§6); add `pathways.json` to the data-shapes list |
| `README.md` | Add `/pathways` to the Routes table |

**No existing route, component, or lesson is modified.**

---

## 8. Verification

| Check | Command |
|---|---|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Tests | `node --test` (one pre-existing `calculators` failure is expected) |
| Claims | `npm run verify:claims` |
| Contrast | `npm run verify:contrast` |

### Acceptance

- `/pathways` renders and is reachable from both the mobile nav and the footer
- All 11 track links resolve — no 404s — and each label matches its nav label in `data/site.json` exactly
- None of "virtual assistant", "VA", "bundle", "premium", "enroll", "buy", or "price" appears on the page
- The page promises no template, script, or downloadable file
- Header image is ≤ 120 KB and carries `alt=""`
- At 360px width the SVG is hidden and the stacked step list renders instead
- `verify:contrast` still passes — the diagram introduces no new colour pairs

### Completion grep

```
grep -rniE 'virtual assistant|\bVA\b|bundle|premium|enroll|blueprint' app/pathways data/pathways.json
```
Expected: no output.

---

## 9. Open item

The submitted copy listed alternate names ("Client Outreach & Positioning Accelerator", "Freelancer Client-Getting System", "Beginner-to-Client-Ready VA Training"). All were set aside for one reason: each is longer and more product-like than the site's existing plain labels (`Build Labs`, `Find Work`, `Portfolio Ladder`). If a more marketing-forward voice is wanted later, that is a sitewide voice decision, not a decision for this one page.
