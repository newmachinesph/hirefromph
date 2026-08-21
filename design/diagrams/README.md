# Diagrams

Branded diagrams for Hire From PH, authored with the `diagram-design` Claude Code plugin (v2.6.1) under the saved profile **`hirefromph`**.

Two artefacts per diagram:

| Artefact | Path | Role |
|---|---|---|
| Plugin HTML | `design/diagrams/<id>.html` | **Source of truth.** Self-contained, opens in any browser, passes the plugin's `self_check.py`. |
| React component | `components/diagrams/<id>.tsx` | What ships. Same geometry, hard-coded hexes replaced with the site's CSS custom properties. |

Change the HTML first, then port the change to the component. Never the other way round.

---

## The profile and the marker

- **Profile:** `~/.diagram-design/profiles/hirefromph.md` — a complete style guide, stored outside the plugin so a plugin update can't erase it. It was produced with the plugin's **Folder** onboarding method, reading the committed tokens in `app/globals.css`.
- **Marker:** `.diagram-design` at the repo root, containing exactly `profile: hirefromph`. The plugin reads the marker before every generation and loads that profile directly. It never copies the profile over the plugin's installed `references/style-guide.md`, so other projects on this machine are unaffected.
- A recovery snapshot of the pristine shipped guide sits at `~/.diagram-design/profiles/default.md`.

**Semantic role → site token**

| Plugin role | Token | Value |
|---|---|---|
| `paper` | `--paper` | `#FFFFFF` |
| `paper-2` | `--band` | `#F7F6FF` |
| `ink` | `--ink` | `#0E1230` |
| `muted` | `--ink-soft` | `#4A4F66` |
| `soft` | `--ink-faint` | `#6B7087` |
| `rule` | `--line` | `#E4E4EA` |
| `rule-solid` | `--line-strong` | `#CFCFD8` |
| `accent` | `--primary` | `#4B4EF6` |
| `accent-tint` | `--primary-tint` | `#EEEDFF` |
| `link` | `--info` | `#026AA2` |

**Type roles.** Title — Cabinet Grotesk 700. Node name — Inter 600 12px. Sublabel — Inter 500 10px with `font-variant-numeric: tabular-nums`. Eyebrow — Inter 600 10px uppercase, tracked. Arrow label — Inter 500 10px. Editorial aside — Inter italic 12px. **There is no mono family in this brand**; numbers that need to line up get tabular figures instead.

The plugin's shipped ramp puts eyebrows and arrow labels at 9px. These diagrams raise them to 10px, because the components can render below 1× inside a narrow frame and nothing should drop under 10px at 1×. The profile records that rule.

---

## The rules every diagram here follows

From the plugin's style guide and spec §7.2:

- Density 4/10; **at most 9 nodes**; split rather than crowd.
- **One or two accent elements.** Everything else is ink / muted / soft. The accent is `--primary` and only `--primary` — the site's `verified` / `caution` / `info` / `coral` tokens are UI status colours and never enter a diagram.
- **No shadows.** Borders carry hierarchy. Radius ≤ 8px.
- Bordered, not filled. A plain node is white with a `--line-strong` hairline.
- Every coordinate, width, height and gap divisible by 4.
- Connectors are straight or rounded right angles (`r=8`); no diagonals. Arrows are drawn before nodes. Every arrow label sits on an opaque paper mask with a visible 6–10px gap above its stroke, and never overlaps a node.
- No dot-pattern background, no in-diagram legend, no container chrome: these sit inside product pages, and `DiagramFrame` supplies the frame, the title, and the caption.
- No invented numbers. Where a shape implies a quantity it does not have (the funnel), the diagram says so in its own footnote.

---

## The four diagrams

### `journey-map` — *The path — five stages, eleven steps*

Journey / process. A left-to-right spine with **5 stage nodes** (numeral + name + step range) and **11 step ticks** beneath, each tick group sitting on its own rail segment so the grouping needs no bracket. `viewBox 0 0 720 224`.

- **Accent (≤2):** stage 1, the entry point, always; plus the stage named by the `current` prop, together with its `YOU ARE HERE` tag and drop line (marker + tag count as one focal element). With no `current`, only stage 1 is accented.
- **Content:** `data/stages.json` (stage names, step ranges) and `data/roadmap.json` (the eleven steps and which stage owns each).
- The standalone HTML renders `current = 2` as a demonstration.

### `method-loop` — *The method — seven ways to get unstuck*

Process with a loop-back. **7 nodes**, serpentine: FIND → DECONSTRUCT → LEARN → VET on the top row, then ASK → UNSTICK → GIVE right-to-left on the second, with the VET → ASK hand-off routed down the outer corridor. `viewBox 0 0 704 248`.

- **Accent (1):** GIVE. No accent arrows.
- **The loop:** UNSTICK → ASK, dashed (a return, not a step), routed 28px below the row so it can't overlap the forward arrow, labelled **"time-box, then ask"** on a paper mask 8px clear of the stroke. The label is 18 characters in sentence case rather than the plugin's ≤14-character uppercase convention: the brand has no mono face and the phrase is the instruction.
- **Content:** `data/doctrine.json` → `methods`. The label is UNSTICK's fifth step, *"Time-box, then ask well."*

### `hiring-funnel` — *What each stage of the hunt needs*

Funnel, point down. **4 bands** — Applications → Replies → Interviews → Offers — each labelled with what that stage needs. `viewBox 0 0 560 288`.

- **Accent (1):** the Offers band at the narrow end.
- **No numbers anywhere.** The band widths are ordinal — they show that each stage is narrower than the last, not by how much. The diagram carries its own footnote saying so: *"The widths show the shape of the drop-off, not measured rates."* Do not add percentages to this diagram without a cited source.
- **Content:** `data/stages.json` → `get-hired.doFirst` ("Show proof, not promises", "Track every application", "Negotiate with evidence"), plus `data/interview.json` (`star`, `askThem`) and `data/apply.json`.

### `first-week-timeline` — *Your first week, day by day*

Timeline. **5 markers** on one baseline, Day 1 to Day 5, each with a two-line checkpoint. `viewBox 0 0 720 176`.

- **Accent (1):** Day 1 — the enlarged marker and its accent label, counted as one focal element.
- Equal spacing is honest here: the intervals really are one day each.
- **Content:** the `first-week` scenario in `data/scenarios.json` (Monday's recap, the dated log, the SOP, the Thursday time-box, Friday's unrequested update) and the `first-week-plan` lab in `data/labs.json`.

---

## Using the components

```tsx
import { JourneyMap, DIAGRAMS, type DiagramId } from "@/components/diagrams";

<DiagramFrame title="The path" caption="…">
  <JourneyMap current={2} />
</DiagramFrame>
```

`components/diagrams/index.ts` exports the four components, the `DIAGRAMS` map keyed by id (`journey-map`, `method-loop`, `hiring-funnel`, `first-week-timeline`), the `DiagramId` union, and the shared `DiagramProps` type.

Every component takes the same props:

| Prop | Type | Notes |
|---|---|---|
| `current` | `number \| undefined` | Journey map only — the 1-based stage to highlight. Out-of-range and omitted values highlight nothing. The other three accept it and ignore it, so the `DIAGRAMS` map stays uniformly typed. |
| `className` | `string \| undefined` | Passed straight to the `<svg>`. |

**Deliberate differences between the HTML source and the component:**

1. The component has **no `<title>`, no `role`, and does not set `aria-hidden`.** `DiagramFrame` owns the accessible name and description. The standalone HTML keeps `role="img"` + `<title>` + `<desc>` because it is a page in its own right and the plugin's self-check requires them.
2. The component drops the `<rect width="100%" height="100%">` paper background, so the diagram inherits whatever surface the frame sits on (paper or band).
3. Colours are `var(--ink)`, `var(--primary)`, `var(--line-strong)`, … instead of hexes; families are `var(--font-inter)` / `var(--font-cabinet)` with fallbacks.
4. Every component sets `width="100%"`, `preserveAspectRatio="xMidYMid meet"`, and `min-width: 560px`, so on a phone the diagram keeps its type size and the frame scrolls sideways instead of shrinking the labels.

**Font fidelity.** Inter is exact in both places. Cabinet Grotesk is self-hosted from `app/fonts/` through `next/font/local`, which the plugin's single-file allowlist cannot reach — so the standalone HTML and `preview.html` fall back to Inter for the display face while the shipped components render it correctly. That is a disclosed fallback, not a match; never add a remote font URL to work around it.

---

## Preview, verify, regenerate

**Preview.** `design/diagrams/preview.html` inlines all four SVGs on one page with the site's token values on `:root` and every hex swapped for its `var()`. Open the file directly — there is no build step.

Regenerate it after editing any source HTML:

```bash
node design/diagrams/build-preview.mjs
```

**Verify.** Run the plugin's own check on any file you touch:

```bash
python3 ~/.claude/plugins/cache/diagram-design/diagram-design/2.6.1/skills/diagram-design/scripts/self_check.py \
  design/diagrams/*.html
```

It checks the accessible-SVG contract (`role="img"`, first-child `<title>`, non-empty `<desc>`, diagram-prefixed ids), single-file safety (no remote assets beyond the approved Google Fonts `/css2` stylesheet), and that nothing has smuggled in a script. All five files in this folder pass.

Then type-check the components:

```bash
npx tsc --noEmit
```

**Add a diagram.** Ask the plugin for the type you need; it resolves `.diagram-design` → the `hirefromph` profile automatically. Save the HTML here as `<id>.html`, run the self-check, hand-convert to `components/diagrams/<id>.tsx` following the four differences above, register it in `components/diagrams/index.ts`, add it to the `DIAGRAMS` array in `build-preview.mjs`, and rebuild the preview.

**Export.** PNG/SVG export is manual and never automatic. Ask the plugin to export a specific file, or follow `references/export.md` in the skill. Exports are diagram-only — the page header and caption are dropped by design — and the PNG path needs Playwright (`pip install playwright && playwright install chromium`).
