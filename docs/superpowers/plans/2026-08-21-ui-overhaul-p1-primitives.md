# UI Overhaul — Phase 1: Primitives and Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared component library (`components/ui` + `components/layout`) that every later phase composes pages from, cover its behaviour with Vitest tests, add the warn-only enforcement script, and ship the `/dev/ui` gallery — without changing a single existing page's structure.

**Architecture:** One primitive per file under `components/ui/`, re-exported from a hand-written `components/ui/index.ts` barrel whose export list is a contract later phases depend on. Page-structure components live in `components/layout/` and are built *on* the primitives. The old `components/ui.tsx` becomes a compatibility shim (`export * from "./ui/index"` plus deprecated wrappers) so all 33 existing `page.tsx` files keep compiling untouched; Phase 5 deletes the shim. Presentational components stay server components; only the ones that own state or DOM focus carry `"use client"`.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Tailwind v4 (CSS-first tokens from Phase 0), TypeScript strict, Vitest 3 + @testing-library/react 16 + user-event 14, Phosphor Icons, Git Bash on Windows.

Spec: `docs/superpowers/specs/2026-08-21-ui-overhaul-design.md` (§4 design system, §5.1–5.3 component architecture, §5.7 enforcement, §5.8 dev gallery, §10 accessibility, §13 testing). This is plan 2 of 9. Phase 0 (`docs/superpowers/plans/2026-08-21-ui-overhaul-p0-foundations.md`) is **done**: tokens, fonts, `lib/accent.ts`, the Vitest runner, the skip link and the new logo are all in place.

## Global Constraints

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

### Phase 1 additions to the constraints

- **The barrel is a contract.** `components/ui/index.ts` and `components/layout/index.ts` must export exactly the names listed in Task 11. Phases 2–7 import those names. Do not rename, do not add, do not drop.
- **Cards are bordered, never shadowed.** `interactive` means `hover:border-ink hover:bg-band` only — no translate, no shadow, no scale. Shadows exist only on `Dialog` and dropdown surfaces.
- **Pages never reach the type scale directly.** `Heading` and `Text` are the only way in. Headline accent colouring is the `Heading accent` prop, never an ad-hoc `<span className="text-primary">`.
- **Every accent class comes from `lib/accent.ts`.** `ACCENT[a]` / `accent(id)`. No new accent literal maps anywhere, including inside `components/ui`.
- **Generated imagery is always captioned.** `Figure` appends "Illustrative image" to the caption of any entry with `generated: true`. This is honesty-doctrine, not styling — do not make it optional.
- **`git` concurrency:** other agents commit unrelated `data/*.json` files on this branch while Phase 1 runs. If a git command fails with `Unable to create '.git/index.lock': File exists`, wait a few seconds and re-run the same command. Never delete `index.lock` by hand. Always `git add` explicit paths — never `git add -A`.
- Tests are behavioural and small. Assert what a user or assistive technology observes (roles, labels, `aria-*`, focus, which panel is on screen). Class-name assertions are allowed only where the class *is* the contract (bordered-not-shadowed, band vs navy, container width).

---

## File structure

| Path | Responsibility |
|---|---|
| `components/ui/icon.tsx` | Phosphor registry, `Icon`, `ICON_NAMES`, `IconProps` (moved from `components/icon.tsx`) |
| `components/icon.tsx` | One-line re-export so the 32 existing importers keep working |
| `components/ui/button.tsx` | `Button` — the only button/CTA in the system |
| `components/ui/card.tsx` | `Card`, `CardMedia`, `CardBody`, `CardFooter` |
| `components/ui/badge.tsx`, `components/ui/kicker.tsx` | Pill labels; `BadgeTone` is the shared tone union |
| `components/ui/heading.tsx`, `components/ui/text.tsx` | The only entry points to the type scale |
| `components/ui/field.tsx` | `Field` context + `useFieldControl` + `controlClass` |
| `components/ui/{input,textarea,select,checkbox,radio,choice-card,range,switch}.tsx` | Controls that consume the field context |
| `components/ui/tabs.tsx` | `Tabs`/`TabList`/`Tab`/`TabPanel`, roving tabindex |
| `components/ui/accordion.tsx` | `Accordion`/`AccordionItem` on native `<details>` |
| `components/ui/dialog.tsx` | Portal, focus trap, Esc, return focus, scroll lock |
| `components/ui/{stat,callout,source,step-list,progress-bar,empty-state}.tsx` | Content primitives |
| `data/visuals.json`, `lib/visuals.ts` | Image manifest (empty in Phase 1; Phase 3 fills it) |
| `components/ui/figure.tsx`, `components/ui/diagram-frame.tsx` | Visual layer wrappers |
| `components/ui/index.ts` | **Contract barrel** |
| `components/layout/*.tsx`, `components/layout/index.ts` | `Container`, `Section`, `SectionHeading`, `PageHero`, `Breadcrumb`, `CardGrid`, `FeatureRow`, `CtaBand`, `PageFooterNav`, `Toc` |
| `components/ui.tsx` | Compatibility shim for the 33 pre-overhaul pages |
| `scripts/verify-primitives.mjs`, `package.json` | Warn-only enforcement, wired into `verify:all` |
| `app/(dev)/dev/ui/page.tsx`, `app/(dev)/dev/ui/demos.tsx` | Component gallery, 404 in production |
| `app/sitemap.ts`, `app/robots.ts` | Keep `/dev/ui` out of the index |
| `BUILD_GUIDE.md` | "Shared components" rewritten; card + accent bullets fixed |

## Parallel groups

Groups run in order; tasks **inside** a group touch disjoint files and can run concurrently.

| Group | Tasks | Depends on |
|---|---|---|
| A | T1 Icon | — |
| B | T2 Button · T3 Card/Badge/Kicker · T4 Heading/Text | A (Button and Card do not import Icon, but B lands after A so the gallery has one icon source) |
| C | T5 Field family · T6 Tabs · T7 Accordion · T8 Dialog | — (independent of B; run alongside if you have the agents) |
| D | T9 Content primitives · T10 Visuals + Figure + DiagramFrame | A, B (`Source` uses `Badge`; `EmptyState` uses `Heading`/`Text`/`Icon`) |
| E | T11 Barrels + layout | A, B, C, D |
| F | T12 `components/ui.tsx` shim · T13 `verify-primitives.mjs` | E (T12); none (T13) |
| G | T14 Dev gallery · T15 BUILD_GUIDE · then T16 exit verification | E, F |

---

### Task 1: Move `Icon` into the primitives and publish `ICON_NAMES`

**Parallel group:** A

**Files:**
- Create (by move): `components/ui/icon.tsx` (from `components/icon.tsx`)
- Modify: `components/ui/icon.tsx` (add `ArrowRight`, export `ICON_NAMES` and `IconProps`, default `aria-hidden`)
- Modify: `components/icon.tsx` (becomes a one-line re-export)
- Test: `components/ui/icon.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export type IconProps = { name: string; size?: number | string; className?: string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"; "aria-hidden"?: boolean; "aria-label"?: string; role?: string }`
  - `export function Icon(props: IconProps): JSX.Element` — resolves the kebab name against the Phosphor registry, falls back to `Sparkle`, and marks itself `aria-hidden` unless given an `aria-label` or `role`.
  - `export const ICON_NAMES: readonly string[]` — every registry key, sorted. The gallery (T14) and later data-integrity checks read it.
  - `components/icon.tsx` keeps re-exporting `Icon`, `ICON_NAMES`, `IconProps` so the 32 existing `@/components/icon` importers are untouched.

- [ ] **Step 1: Move the file with git so history follows it**

```bash
mkdir -p components/ui
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite mv components/icon.tsx components/ui/icon.tsx
```

- [ ] **Step 2: Write the failing test**

Create `components/ui/icon.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ICON_NAMES, Icon } from "@/components/ui/icon";

describe("Icon", () => {
  it("exposes every registry name, sorted", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(100);
    expect(ICON_NAMES).toContain("compass");
    expect(ICON_NAMES).toContain("arrow-right");
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort());
  });

  it("renders an svg for a known name", () => {
    const { container } = render(<Icon name="compass" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back instead of crashing on an unknown name", () => {
    const { container } = render(<Icon name="definitely-not-an-icon" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("is decorative by default and labelled on request", () => {
    const { container: plain } = render(<Icon name="compass" />);
    expect(plain.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    const { container: labelled } = render(
      <Icon name="compass" aria-label="Open the method" />,
    );
    const svg = labelled.querySelector("svg");
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("aria-label", "Open the method");
  });

  it("passes className through", () => {
    const { container } = render(<Icon name="compass" className="text-primary" />);
    expect(container.querySelector("svg")).toHaveClass("text-primary");
  });
});
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npx vitest run components/ui/icon.test.tsx`
Expected: FAIL — `No "ICON_NAMES" export is defined on the "@/components/ui/icon" mock` / `does not provide an export named 'ICON_NAMES'`, and the aria-hidden assertion fails.

- [ ] **Step 4: Add `ArrowRight` to the registry**

In `components/ui/icon.tsx`, add `ArrowRight,` to the alphabetical Phosphor import list (immediately before `ArrowsClockwise,`) and add this line to `REGISTRY`, immediately before `"arrow-up": ArrowUp,`:

```ts
  "arrow-right": ArrowRight,
```

- [ ] **Step 5: Replace the bottom of the file (everything from `type IconProps`) with the exported API**

```tsx
export const ICON_NAMES: readonly string[] = Object.keys(REGISTRY).sort();

export type IconProps = {
  /** Kebab name as stored in `data/*.json`. Unknown names fall back to Sparkle. */
  name: string;
  size?: number | string;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  role?: string;
};

/**
 * Icons are decorative unless the caller gives them a name. Passing
 * `aria-label` (or `role`) opts into being announced; everything else is
 * hidden from assistive technology so labels are not read twice.
 */
export function Icon({ name, weight = "regular", ...rest }: IconProps) {
  const Cmp = REGISTRY[name] ?? Sparkle;
  const decorative = rest["aria-label"] === undefined && rest.role === undefined;
  return <Cmp weight={weight} aria-hidden={decorative ? true : undefined} {...rest} />;
}
```

- [ ] **Step 6: Leave a re-export at the old path**

Replace the whole of `components/icon.tsx` with:

```tsx
/** Moved to `components/ui/icon.tsx` in Phase 1. Kept so the 32 pre-overhaul importers compile; Phase 5 removes it. */
export { Icon, ICON_NAMES, type IconProps } from "@/components/ui/icon";
```

- [ ] **Step 7: Run the test and watch it pass**

Run: `npx vitest run components/ui/icon.test.tsx`
Expected: PASS — 5 tests.

- [ ] **Step 8: Confirm nothing else broke**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 9: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/icon.tsx components/ui/icon.test.tsx components/icon.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): move Icon into components/ui, export ICON_NAMES, make icons decorative by default"
```

---

### Task 2: `Button`

**Parallel group:** B

**Files:**
- Create: `components/ui/button.tsx`
- Test: `components/ui/button.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link"`
  - `export type ButtonSize = "sm" | "md" | "lg"`
  - `export type ButtonProps = { children: ReactNode; href?: string; external?: boolean; variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; iconEnd?: ReactNode; type?: "button" | "submit" | "reset"; disabled?: boolean; onClick?: (event: MouseEvent<HTMLElement>) => void; className?: string; "aria-label"?: string }`
  - `export function Button(props: ButtonProps)` — `href` + `external` → `<a target="_blank" rel="noopener noreferrer">`; `href` alone → `next/link`; no `href` (or `disabled`) → `<button>`.

- [ ] **Step 1: Write the failing test**

Create `components/ui/button.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// next/link needs the App Router context, which jsdom cannot provide. The stub
// keeps every assertion on markup this component owns (href, target, rel).
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an internal link when href is set", () => {
    render(<Button href="/start">Find your path</Button>);
    const link = screen.getByRole("link", { name: "Find your path" });
    expect(link).toHaveAttribute("href", "/start");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links in a new tab with a safe rel", () => {
    render(
      <Button href="https://psa.gov.ph" external variant="outline">
        Read the source
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Read the source" });
    expect(link).toHaveAttribute("href", "https://psa.gov.ph");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a real button when there is no href", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("honours type=submit", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("never renders a disabled link", () => {
    render(
      <Button href="/start" disabled>
        Find your path
      </Button>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("button", { name: "Find your path" })).toBeDisabled();
  });

  it("renders leading and trailing slots", () => {
    render(
      <Button icon={<span data-testid="lead" />} iconEnd={<span data-testid="trail" />}>
        Continue
      </Button>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/button.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/button"`.

- [ ] **Step 3: Write the implementation**

Create `components/ui/button.tsx`:

```tsx
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  /** Present → renders a link. Absent → renders a <button>. */
  href?: string;
  /** Only meaningful with `href`: new tab plus a safe rel. */
  external?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  type?: "button" | "submit" | "reset";
  /** A disabled control is never a link — it renders a real disabled <button>. */
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  "aria-label"?: string;
};

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-display font-bold transition-colors duration-150 ease-out";

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-small",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-body",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  secondary: "bg-tint text-primary-deep hover:bg-primary-soft",
  outline: "border border-line-strong bg-paper text-ink hover:border-ink hover:bg-band",
  ghost: "text-ink hover:bg-band",
  link: "h-auto px-0 text-primary underline decoration-transparent underline-offset-4 hover:decoration-current",
};

export function Button({
  children,
  href,
  external = false,
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  type = "button",
  disabled = false,
  onClick,
  className,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const cls = cn(
    BASE,
    variant !== "link" && SIZES[size],
    VARIANTS[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );

  const inner = (
    <>
      {icon}
      {children}
      {iconEnd}
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          aria-label={ariaLabel}
          className={cls}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cls}
    >
      {inner}
    </button>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run components/ui/button.test.tsx`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/button.tsx components/ui/button.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Button primitive (link/anchor/button, five variants)"
```

---

### Task 3: `Card`, `Badge`, `Kicker`

**Parallel group:** B

**Files:**
- Create: `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/kicker.tsx`
- Test: `components/ui/card.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `ACCENT`, `isAccent`, `type Accent` from `@/lib/accent`.
- Produces:
  - `export type CardPadding = "none" | "sm" | "md" | "lg"`
  - `export type CardMediaRatio = "16/9" | "4/3" | "3/2" | "1/1"`
  - `export type CardProps = { children: ReactNode; padding?: CardPadding; interactive?: boolean; href?: string; as?: "div" | "article" | "li" | "section"; onBand?: boolean; className?: string }`
  - `export function Card(props: CardProps)`, `export function CardMedia({ children, ratio?, className? })`, `export function CardBody({ children, className? })`, `export function CardFooter({ children, className? })`
  - `export type BadgeTone = "neutral" | Accent` — the shared tone union; `Kicker`, `Callout` (T9) and `PageHero` (T11) all reuse it.
  - `export type BadgeVariant = "soft" | "outline"`
  - `export type BadgeProps = { children: ReactNode; tone?: BadgeTone; variant?: BadgeVariant; className?: string }`
  - `export type KickerTone = BadgeTone`; `export function Kicker({ children, tone?, className? })`

- [ ] **Step 1: Write the failing test**

Create `components/ui/card.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/link needs the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardFooter, CardMedia } from "@/components/ui/card";
import { Kicker } from "@/components/ui/kicker";

describe("Card", () => {
  it("is bordered and never shadowed or lifted", () => {
    render(<Card>Stage 1</Card>);
    const card = screen.getByText("Stage 1");
    expect(card.className).toContain("border-line");
    expect(card.className).toContain("rounded-md");
    expect(card.className).not.toContain("shadow");
    expect(card.className).not.toContain("translate");
  });

  it("uses the stronger hairline on a band", () => {
    render(<Card onBand>On band</Card>);
    expect(screen.getByText("On band").className).toContain("border-line-strong");
  });

  it("hovers on border and background only when interactive", () => {
    render(<Card interactive>Hover me</Card>);
    const card = screen.getByText("Hover me");
    expect(card.className).toContain("hover:border-ink");
    expect(card.className).toContain("hover:bg-band");
    expect(card.className).not.toContain("translate");
  });

  it("renders the whole card as a link when href is set", () => {
    render(
      <Card href="/start" padding="none">
        <CardMedia ratio="3/2">
          <div data-testid="media" />
        </CardMedia>
        <CardBody>Start here</CardBody>
        <CardFooter>Stage 1</CardFooter>
      </Card>,
    );
    const link = screen.getByRole("link", { name: /Start here/ });
    expect(link).toHaveAttribute("href", "/start");
    expect(screen.getByTestId("media")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("defaults to a neutral soft pill", () => {
    render(<Badge>Guide</Badge>);
    const badge = screen.getByText("Guide");
    expect(badge.className).toContain("rounded-pill");
    expect(badge.className).toContain("bg-band");
  });

  it("takes its accent classes from lib/accent", () => {
    render(<Badge tone="verified">Sourced</Badge>);
    expect(screen.getByText("Sourced").className).toContain("bg-verified-tint");
  });

  it("outline variant has no fill", () => {
    render(
      <Badge tone="caution" variant="outline">
        Vendor-grade
      </Badge>,
    );
    const badge = screen.getByText("Vendor-grade");
    expect(badge.className).toContain("bg-transparent");
    expect(badge.className).toContain("border-caution");
  });
});

describe("Kicker", () => {
  it("renders an uppercase outlined pill with no dot", () => {
    const { container } = render(<Kicker>Stage 2 of 5</Kicker>);
    const kicker = screen.getByText("Stage 2 of 5");
    expect(kicker.className).toContain("uppercase");
    expect(kicker.className).toContain("rounded-pill");
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("accepts an accent tone", () => {
    render(<Kicker tone="info">Notes</Kicker>);
    expect(screen.getByText("Notes").className).toContain("text-info");
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/card.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/badge"`.

- [ ] **Step 3: Write `components/ui/badge.tsx`**

```tsx
import type { ReactNode } from "react";
import { ACCENT, isAccent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/** "neutral" plus every stage accent. Shared by Badge, Kicker and Callout. */
export type BadgeTone = "neutral" | Accent;
export type BadgeVariant = "soft" | "outline";

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  className?: string;
};

const NEUTRAL: Record<BadgeVariant, string> = {
  soft: "bg-band text-ink-soft border-line-strong",
  outline: "bg-transparent text-ink-soft border-line-strong",
};

export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  className,
}: BadgeProps) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  const toneClass = a
    ? variant === "soft"
      ? a.soft
      : cn("bg-transparent", a.text, a.border)
    : NEUTRAL[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-caption font-medium",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Write `components/ui/kicker.tsx`**

```tsx
import type { ReactNode } from "react";
import { ACCENT, isAccent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "./badge";

export type KickerTone = BadgeTone;

/**
 * Section eyebrow: outlined pill, uppercase, Inter. No leading dot, no mono —
 * the dot-and-mono kicker is one of the slop tells this overhaul removes.
 */
export function Kicker({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: KickerTone;
  className?: string;
}) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1 text-kicker uppercase",
        a ? cn(a.text, a.border) : "border-line-strong text-ink-faint",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Write `components/ui/card.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardMediaRatio = "16/9" | "4/3" | "3/2" | "1/1";

export type CardProps = {
  children: ReactNode;
  padding?: CardPadding;
  /** Hover affordance: border + background only. Never translate, shadow or scale. */
  interactive?: boolean;
  /** Renders the whole card as a link (implies `interactive`). */
  href?: string;
  as?: "div" | "article" | "li" | "section";
  /** Sitting on a `band` section: use the stronger hairline. */
  onBand?: boolean;
  className?: string;
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-6 lg:p-8",
};

export function Card({
  children,
  padding = "md",
  interactive = false,
  href,
  as: Tag = "div",
  onBand = false,
  className,
}: CardProps) {
  const cls = cn(
    "flex flex-col overflow-hidden rounded-md bg-paper",
    onBand ? "border border-line-strong" : "border border-line",
    PADDING[padding],
    (interactive || href) &&
      "transition-colors duration-150 ease-out hover:border-ink hover:bg-band",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <Tag className={cls}>{children}</Tag>;
}

const RATIO: Record<CardMediaRatio, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
};

/** Flush media at the top of a `padding="none"` card. */
export function CardMedia({
  children,
  ratio = "16/9",
  className,
}: {
  children: ReactNode;
  ratio?: CardMediaRatio;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-hidden bg-band", RATIO[ratio], className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-1 flex-col gap-2 p-6", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center gap-3 border-t border-line px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run components/ui/card.test.tsx`
Expected: PASS — 9 tests.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/card.tsx components/ui/badge.tsx components/ui/kicker.tsx components/ui/card.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Card, Badge and Kicker primitives (bordered, never shadowed)"
```

---

### Task 4: `Heading` and `Text`

**Parallel group:** B

**Files:**
- Create: `components/ui/heading.tsx`, `components/ui/text.tsx`
- Test: `components/ui/heading.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; the Phase 0 type utilities `text-hero text-display text-h2 text-h3 text-h4 text-h5 text-lead text-body text-small text-caption` (each already carries its line-height, weight and tracking).
- Produces:
  - `export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6`
  - `export type HeadingSize = "hero" | "display" | "h2" | "h3" | "h4" | "h5"`
  - `export type HeadingProps = { children: ReactNode; level?: HeadingLevel; size?: HeadingSize; accent?: string; balance?: boolean; tone?: "ink" | "inherit"; id?: string; className?: string }`
  - `export function Heading(props: HeadingProps)` — semantic level and visual size are independent; `accent` is a trailing copy segment coloured `text-primary` on `hero`/`display` only.
  - `export type TextSize = "lead" | "body" | "base" | "small" | "caption"`
  - `export type TextTone = "ink" | "soft" | "faint" | "inherit"`
  - `export type TextProps = { children: ReactNode; size?: TextSize; tone?: TextTone; as?: "p" | "span" | "div" | "li"; balance?: boolean; id?: string; className?: string }`
  - `export function Text(props: TextProps)`

- [ ] **Step 1: Write the failing test**

Create `components/ui/heading.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

describe("Heading", () => {
  it("keeps the semantic level independent of the visual size", () => {
    render(
      <Heading level={3} size="h5">
        Tools for this stage
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading.className).toContain("text-h5");
  });

  it("colours the trailing accent segment on a hero headline", () => {
    const { container } = render(
      <Heading level={1} size="hero" accent="online.">
        Build a career
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Build a career online.");
    const accent = container.querySelector(".text-primary");
    expect(accent).not.toBeNull();
    expect(accent).toHaveTextContent("online.");
  });

  it("still renders the accent copy at smaller sizes, uncoloured", () => {
    const { container } = render(
      <Heading level={2} size="h2" accent="that pays.">
        Work
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Work that pays.",
    );
    expect(container.querySelector(".text-primary")).toBeNull();
  });

  it("passes id through so Toc anchors resolve", () => {
    render(
      <Heading level={2} id="how">
        How it works
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "how");
  });
});

describe("Text", () => {
  it("defaults to base size and soft ink", () => {
    render(<Text>Every number has a source.</Text>);
    const text = screen.getByText("Every number has a source.");
    expect(text.tagName).toBe("P");
    expect(text.className).toContain("text-ink-soft");
  });

  it("maps size and tone onto the token utilities", () => {
    render(
      <Text size="caption" tone="faint">
        Illustrative image
      </Text>,
    );
    const text = screen.getByText("Illustrative image");
    expect(text.className).toContain("text-caption");
    expect(text.className).toContain("text-ink-faint");
  });

  it("can render as another element", () => {
    render(
      <Text as="span" tone="inherit">
        inline
      </Text>,
    );
    expect(screen.getByText("inline").tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/heading.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/heading"`.

- [ ] **Step 3: Write `components/ui/heading.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "hero" | "display" | "h2" | "h3" | "h4" | "h5";

export type HeadingProps = {
  children: ReactNode;
  /** Document outline. Independent of `size`. */
  level?: HeadingLevel;
  /** Visual step on the type scale. Defaults to the level's natural size. */
  size?: HeadingSize;
  /**
   * Trailing copy segment. On `hero`/`display` it is rendered in `primary`
   * (spec §4.1 allows headline accent colouring only at those two sizes).
   * At smaller sizes the copy is still shown, just not coloured — dropping
   * an author's words silently would be worse than ignoring the styling.
   */
  accent?: string;
  balance?: boolean;
  tone?: "ink" | "inherit";
  id?: string;
  className?: string;
};

const SIZE: Record<HeadingSize, string> = {
  hero: "text-hero",
  display: "text-display",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
};

const LEVEL_DEFAULT: Record<HeadingLevel, HeadingSize> = {
  1: "display",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h5",
};

export function Heading({
  children,
  level = 2,
  size,
  accent,
  balance = false,
  tone = "ink",
  id,
  className,
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const step = size ?? LEVEL_DEFAULT[level];
  const canColourAccent = step === "hero" || step === "display";

  return (
    <Tag
      id={id}
      className={cn(
        "font-display",
        SIZE[step],
        tone === "ink" && "text-ink",
        balance && "text-balance",
        className,
      )}
    >
      {children}
      {accent ? (
        <>
          {" "}
          <span className={canColourAccent ? "text-primary" : undefined}>{accent}</span>
        </>
      ) : null}
    </Tag>
  );
}
```

- [ ] **Step 4: Write `components/ui/text.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TextSize = "lead" | "body" | "base" | "small" | "caption";
export type TextTone = "ink" | "soft" | "faint" | "inherit";

export type TextProps = {
  children: ReactNode;
  size?: TextSize;
  tone?: TextTone;
  as?: "p" | "span" | "div" | "li";
  balance?: boolean;
  id?: string;
  className?: string;
};

const SIZE: Record<TextSize, string> = {
  lead: "text-lead",
  body: "text-body",
  base: "text-base",
  small: "text-small",
  caption: "text-caption",
};

const TONE: Record<TextTone, string> = {
  ink: "text-ink",
  soft: "text-ink-soft",
  faint: "text-ink-faint",
  inherit: "",
};

export function Text({
  children,
  size = "base",
  tone = "soft",
  as: Tag = "p",
  balance = false,
  id,
  className,
}: TextProps) {
  return (
    <Tag
      id={id}
      className={cn(SIZE[size], TONE[tone], balance && "text-balance", className)}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run components/ui/heading.test.tsx`
Expected: PASS — 7 tests.

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/heading.tsx components/ui/text.tsx components/ui/heading.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Heading and Text, the only entry points to the type scale"
```

---

### Task 5: The field family — `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `ChoiceCard`, `Range`, `Switch`

**Parallel group:** C

**Files:**
- Create: `components/ui/field.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/select.tsx`, `components/ui/checkbox.tsx`, `components/ui/radio.tsx`, `components/ui/choice-card.tsx`, `components/ui/range.tsx`, `components/ui/switch.tsx`
- Test: `components/ui/field.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `export type FieldProps = { label: ReactNode; children: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; hideLabel?: boolean; as?: "field" | "group"; className?: string }`
  - `export function Field(props: FieldProps)` — owns the ids and renders label → hint → control → error. `as="group"` renders `<fieldset>/<legend>` for radio and choice-card sets and publishes `id: undefined` so each child keeps its own id.
  - `export function useFieldControl(): { id: string | undefined; describedBy: string | undefined; invalid: boolean; required: boolean }` — safe outside a `Field` (returns all-undefined/false, never throws).
  - `export const controlClass: string` — the shared border/focus/disabled classes, built on `border-control`.
  - `export type InputProps = ComponentPropsWithoutRef<"input">`; `export function Input(props: InputProps)`
  - `export type TextareaProps = ComponentPropsWithoutRef<"textarea">`; `export function Textarea(props: TextareaProps)`
  - `export type SelectProps = ComponentPropsWithoutRef<"select">`; `export function Select(props: SelectProps)`
  - `export type CheckboxProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode }`; `export function Checkbox(props: CheckboxProps)`
  - `export type RadioProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode }`; `export function Radio(props: RadioProps)`
  - `export type ChoiceCardProps = { name: string; value: string; label: ReactNode; description?: ReactNode; icon?: ReactNode; checked?: boolean; defaultChecked?: boolean; onChange?: (value: string) => void; disabled?: boolean; className?: string }`; `export function ChoiceCard(props: ChoiceCardProps)`
  - `export type RangeProps = ComponentPropsWithoutRef<"input"> & { valueLabel?: ReactNode }`; `export function Range(props: RangeProps)`
  - `export type SwitchProps = { checked: boolean; onChange: (next: boolean) => void; label: ReactNode; hideLabel?: boolean; disabled?: boolean; id?: string; className?: string }`; `export function Switch(props: SwitchProps)`

**Note for the implementer:** `Checkbox` and `Radio` carry their own visible label, so wrap *sets* of them in `Field as="group"` (fieldset/legend) rather than `Field` (label/htmlFor). A single `Input`/`Textarea`/`Select`/`Range` goes inside a plain `Field`.

- [ ] **Step 1: Write the failing test**

Create `components/ui/field.test.tsx`:

```tsx
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function describedText(el: HTMLElement) {
  const ids = (el.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "");
}

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Client rate">
        <Input defaultValue="25" />
      </Field>,
    );
    expect(screen.getByLabelText(/Client rate/)).toHaveValue("25");
  });

  it("wires a hint through aria-describedby", () => {
    render(
      <Field label="Email" hint="We never send anything here.">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(describedText(input)).toEqual(["We never send anything here."]);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("wires hint and error together, hint first, and marks the control invalid", () => {
    render(
      <Field label="Email" hint="Use the one you check." error="Enter a valid email.">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(describedText(input)).toEqual([
      "Use the one you check.",
      "Enter a valid email.",
    ]);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email.");
  });

  it("propagates required to the control", () => {
    render(
      <Field label="Niche" required>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText(/Niche/)).toBeRequired();
  });

  it("renders a fieldset in group mode", () => {
    render(
      <Field as="group" label="Pick a stage" hint="You can change this later.">
        <Input aria-label="Stage one" />
      </Field>,
    );
    const group = screen.getByRole("group", { name: /Pick a stage/ });
    expect(group.tagName).toBe("FIELDSET");
    expect(describedText(group)).toEqual(["You can change this later."]);
  });
});

describe("Switch", () => {
  it("exposes switch semantics and toggles", async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onChange={setOn} label="Comfortable reading" />;
    }
    render(<Harness />);
    const control = screen.getByRole("switch", { name: "Comfortable reading" });
    expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("does not fire when disabled", async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange} label="Low-data mode" disabled />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Low-data mode" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/field.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/field"`.

- [ ] **Step 3: Write `components/ui/field.tsx`**

```tsx
"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldContextValue = {
  /** The control's id. `undefined` in group mode — children keep their own. */
  id: string | undefined;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const EMPTY: FieldContextValue = {
  id: undefined,
  describedBy: undefined,
  invalid: false,
  required: false,
};

const FieldContext = createContext<FieldContextValue | null>(null);

/** Controls read their wiring from here. Safe to call outside a `Field`. */
export function useFieldControl(): FieldContextValue {
  return useContext(FieldContext) ?? EMPTY;
}

/** Shared control chrome. `border-control` is the 3:1 UI-minimum grey. */
export const controlClass =
  "w-full rounded-sm border border-control bg-paper px-3 py-2 text-base text-ink transition-colors duration-150 ease-out placeholder:text-ink-faint hover:border-ink-faint focus:border-primary disabled:cursor-not-allowed disabled:bg-band disabled:text-ink-faint";

export type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  hideLabel?: boolean;
  /** "group" renders fieldset/legend — use it for Radio and ChoiceCard sets. */
  as?: "field" | "group";
  className?: string;
};

export function Field({
  label,
  children,
  hint,
  error,
  required = false,
  hideLabel = false,
  as = "field",
  className,
}: FieldProps) {
  const base = useId();
  const controlId = `${base}-control`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const value: FieldContextValue = {
    id: as === "group" ? undefined : controlId,
    describedBy,
    invalid: Boolean(error),
    required,
  };

  const labelText = (
    <>
      {label}
      {required && (
        <span aria-hidden className="ml-1 text-coral">
          *
        </span>
      )}
    </>
  );

  const hintNode = hint ? (
    <p id={hintId} className="text-caption text-ink-faint">
      {hint}
    </p>
  ) : null;

  const errorNode = error ? (
    <p id={errorId} role="alert" className="text-caption text-coral">
      {error}
    </p>
  ) : null;

  if (as === "group") {
    return (
      <FieldContext.Provider value={value}>
        <fieldset
          className={cn("flex min-w-0 flex-col gap-1.5 border-0 p-0", className)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        >
          <legend className={cn("text-small font-medium text-ink", hideLabel && "sr-only")}>
            {labelText}
          </legend>
          {hintNode}
          {children}
          {errorNode}
        </fieldset>
      </FieldContext.Provider>
    );
  }

  return (
    <FieldContext.Provider value={value}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <label
          htmlFor={controlId}
          className={cn("text-small font-medium text-ink", hideLabel && "sr-only")}
        >
          {labelText}
        </label>
        {hintNode}
        {children}
        {errorNode}
      </div>
    </FieldContext.Provider>
  );
}
```

- [ ] **Step 4: Write `components/ui/input.tsx`, `textarea.tsx`, `select.tsx`**

`components/ui/input.tsx`:

```tsx
"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type InputProps = ComponentPropsWithoutRef<"input">;

export function Input({
  className,
  id,
  required,
  "aria-describedby": describedBy,
  ...rest
}: InputProps) {
  const field = useFieldControl();
  return (
    <input
      {...rest}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(controlClass, field.invalid && "border-coral focus:border-coral", className)}
    />
  );
}
```

`components/ui/textarea.tsx`:

```tsx
"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function Textarea({
  className,
  id,
  required,
  rows = 4,
  "aria-describedby": describedBy,
  ...rest
}: TextareaProps) {
  const field = useFieldControl();
  return (
    <textarea
      {...rest}
      rows={rows}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(
        controlClass,
        "min-h-28 resize-y",
        field.invalid && "border-coral focus:border-coral",
        className,
      )}
    />
  );
}
```

`components/ui/select.tsx`:

```tsx
"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type SelectProps = ComponentPropsWithoutRef<"select">;

export function Select({
  className,
  id,
  required,
  children,
  "aria-describedby": describedBy,
  ...rest
}: SelectProps) {
  const field = useFieldControl();
  return (
    <select
      {...rest}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(controlClass, "h-11", field.invalid && "border-coral", className)}
    >
      {children}
    </select>
  );
}
```

- [ ] **Step 5: Write `components/ui/checkbox.tsx` and `components/ui/radio.tsx`**

`components/ui/checkbox.tsx`:

```tsx
"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type CheckboxProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode };

export function Checkbox({
  label,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: CheckboxProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        {...rest}
        type="checkbox"
        id={controlId}
        aria-describedby={describedBy ?? field.describedBy}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border border-control accent-primary disabled:cursor-not-allowed"
      />
      <label htmlFor={controlId} className="text-base text-ink">
        {label}
      </label>
    </div>
  );
}
```

`components/ui/radio.tsx`:

```tsx
"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type RadioProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode };

export function Radio({
  label,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: RadioProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        {...rest}
        type="radio"
        id={controlId}
        aria-describedby={describedBy ?? field.describedBy}
        className="mt-0.5 h-5 w-5 shrink-0 border border-control accent-primary disabled:cursor-not-allowed"
      />
      <label htmlFor={controlId} className="text-base text-ink">
        {label}
      </label>
    </div>
  );
}
```

- [ ] **Step 6: Write `components/ui/choice-card.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type ChoiceCardProps = {
  name: string;
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/** A radio rendered as a card. Wrap a set in `Field as="group"`. */
export function ChoiceCard({
  name,
  value,
  label,
  description,
  icon,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const field = useFieldControl();
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-md border border-line bg-paper p-4 transition-colors duration-150 ease-out",
        "hover:border-ink hover:bg-band",
        "has-[:checked]:border-primary has-[:checked]:bg-primary-tint",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        disabled && "cursor-not-allowed opacity-60 hover:border-line hover:bg-paper",
        className,
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-describedby={field.describedBy}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {icon && <span className="shrink-0 text-primary">{icon}</span>}
      <span className="flex flex-col gap-1">
        <span className="text-base font-medium text-ink">{label}</span>
        {description && <span className="text-small text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}
```

- [ ] **Step 7: Write `components/ui/range.tsx` and `components/ui/switch.tsx`**

`components/ui/range.tsx`:

```tsx
"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type RangeProps = ComponentPropsWithoutRef<"input"> & { valueLabel?: ReactNode };

export function Range({
  valueLabel,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: RangeProps) {
  const field = useFieldControl();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <input
        {...rest}
        type="range"
        id={id ?? field.id}
        aria-describedby={describedBy ?? field.describedBy}
        className="h-6 w-full accent-primary disabled:cursor-not-allowed"
      />
      {valueLabel !== undefined && (
        <span className="text-caption tabular-nums text-ink-faint">{valueLabel}</span>
      )}
    </div>
  );
}
```

`components/ui/switch.tsx`:

```tsx
"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  hideLabel = false,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  const labelId = `${controlId}-label`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        id={controlId}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={field.describedBy}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors duration-150 ease-out",
          checked ? "border-primary bg-primary" : "border-control bg-band",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "ml-0.5 h-5 w-5 rounded-pill bg-paper transition-transform duration-150 ease-out",
            checked && "translate-x-5",
          )}
        />
      </button>
      <span id={labelId} className={cn("text-base text-ink", hideLabel && "sr-only")}>
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 8: Run the test and watch it pass**

Run: `npx vitest run components/ui/field.test.tsx`
Expected: PASS — 7 tests.

- [ ] **Step 9: Type-check the whole family**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 10: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/field.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/select.tsx components/ui/checkbox.tsx components/ui/radio.tsx components/ui/choice-card.tsx components/ui/range.tsx components/ui/switch.tsx components/ui/field.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add the field family with shared label/hint/error wiring"
```

---

### Task 6: `Tabs`

**Parallel group:** C

**Files:**
- Create: `components/ui/tabs.tsx`
- Test: `components/ui/tabs.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `export type TabsProps = { children: ReactNode; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; className?: string }`
  - `export function Tabs(props: TabsProps)` — controlled when `value` is supplied, uncontrolled otherwise.
  - `export function TabList({ label, children, className? })` — `role="tablist"`, `aria-label={label}`, owns the arrow/Home/End key handling.
  - `export function Tab({ value, children, icon?, disabled?, className? })` — `role="tab"`, roving tabindex (`0` when selected, `-1` otherwise).
  - `export function TabPanel({ value, children, className? })` — `role="tabpanel"`, rendered only when selected.

- [ ] **Step 1: Write the failing test**

Create `components/ui/tabs.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";

function Example() {
  return (
    <Tabs defaultValue="agency">
      <TabList label="Client type">
        <Tab value="agency">Agency</Tab>
        <Tab value="direct">Direct</Tab>
        <Tab value="platform">Platform</Tab>
      </TabList>
      <TabPanel value="agency">The agency holds the relationship.</TabPanel>
      <TabPanel value="direct">You hold the relationship.</TabPanel>
      <TabPanel value="platform">The platform holds the relationship.</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows only the selected panel", () => {
    render(<Example />);
    expect(screen.getByText("The agency holds the relationship.")).toBeInTheDocument();
    expect(screen.queryByText("You hold the relationship.")).toBeNull();
  });

  it("labels the tablist and wires each panel to its tab", () => {
    render(<Example />);
    expect(screen.getByRole("tablist", { name: "Client type" })).toBeInTheDocument();
    const selected = screen.getByRole("tab", { name: "Agency" });
    const panel = screen.getByRole("tabpanel");
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(panel).toHaveAttribute("aria-labelledby", selected.id);
  });

  it("uses a roving tabindex", () => {
    render(<Example />);
    expect(screen.getByRole("tab", { name: "Agency" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Direct" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves selection with the arrow keys and wraps", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("tab", { name: "Agency" }));

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Direct" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("You hold the relationship.")).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Platform" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("tab", { name: "Agency" }));

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Platform" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Agency" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/tabs.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/tabs"`.

- [ ] **Step 3: Write the implementation**

Create `components/ui/tabs.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  current: string;
  setValue: (next: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab, TabList and TabPanel must be used inside <Tabs>.");
  return ctx;
}

export type TabsProps = {
  children: ReactNode;
  /** Controlled value. Omit to let Tabs own the state. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;

  function setValue(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ current, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function TabList({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!NAV_KEYS.includes(event.key)) return;
    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    if (tabs.length === 0) return;

    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const from = index === -1 ? 0 : index;
    const target =
      event.key === "Home"
        ? tabs[0]
        : event.key === "End"
          ? tabs[tabs.length - 1]
          : event.key === "ArrowRight"
            ? tabs[(from + 1) % tabs.length]
            : tabs[(from - 1 + tabs.length) % tabs.length];

    event.preventDefault();
    target.focus();
    // Automatic activation: selection follows focus (WAI-ARIA tabs pattern).
    target.click();
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex flex-wrap gap-1 border-b border-line", className)}
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  children,
  icon,
  disabled = false,
  className,
}: {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const { current, setValue, baseId } = useTabs();
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        "-mb-px inline-flex items-center gap-2 rounded-t-sm border-b-2 px-4 py-2.5 text-base font-medium transition-colors duration-150 ease-out",
        selected ? "border-primary text-primary" : "border-transparent text-ink-soft hover:text-ink",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { current, baseId } = useTabs();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("pt-5", className)}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run components/ui/tabs.test.tsx`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/tabs.tsx components/ui/tabs.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Tabs with roving tabindex and arrow/Home/End keys"
```

---

### Task 7: `Accordion`

**Parallel group:** C

**Files:**
- Create: `components/ui/accordion.tsx`
- Test: `components/ui/accordion.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `export type AccordionProps = { children: ReactNode; type?: "single" | "multiple"; defaultOpen?: string | string[]; className?: string }`
  - `export function Accordion(props: AccordionProps)`
  - `export function AccordionItem({ id, title, children, className? })` — one native `<details>/<summary>` per item, open state owned by `Accordion`.

**Implementation note:** the `<summary>` click is `preventDefault()`ed so React owns `open` in both directions. Without that, `type="single"` fights the browser's own toggle in Chrome and never closes the sibling.

- [ ] **Step 1: Write the failing test**

Create `components/ui/accordion.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

function detailsFor(title: string) {
  return screen.getByText(title).closest("details") as HTMLDetailsElement;
}

describe("Accordion", () => {
  it("starts closed and opens on click", async () => {
    render(
      <Accordion>
        <AccordionItem id="free" title="Is it really free?">
          Yes. Walang bayad, walang catch.
        </AccordionItem>
      </Accordion>,
    );
    expect(detailsFor("Is it really free?").open).toBe(false);
    await userEvent.click(screen.getByText("Is it really free?"));
    expect(detailsFor("Is it really free?").open).toBe(true);
  });

  it("closes the open item in single mode", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByText("Question one"));
    expect(detailsFor("Question one").open).toBe(true);

    await user.click(screen.getByText("Question two"));
    expect(detailsFor("Question two").open).toBe(true);
    expect(detailsFor("Question one").open).toBe(false);
  });

  it("keeps several items open in multiple mode", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByText("Question one"));
    await user.click(screen.getByText("Question two"));
    expect(detailsFor("Question one").open).toBe(true);
    expect(detailsFor("Question two").open).toBe(true);
  });

  it("honours defaultOpen", () => {
    render(
      <Accordion type="single" defaultOpen="b">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    expect(detailsFor("Question two").open).toBe(true);
    expect(detailsFor("Question one").open).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/accordion.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/accordion"`.

- [ ] **Step 3: Write the implementation**

Create `components/ui/accordion.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  isOpen: (id: string) => boolean;
  toggle: (id: string, next: boolean) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used inside <Accordion>.");
  return ctx;
}

export type AccordionProps = {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultOpen?: string | string[];
  className?: string;
};

export function Accordion({
  children,
  type = "single",
  defaultOpen,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(() => {
    if (defaultOpen === undefined) return [];
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  });

  const value: AccordionContextValue = {
    isOpen: (id) => open.includes(id),
    toggle: (id, next) =>
      setOpen((prev) => {
        if (!next) return prev.filter((x) => x !== id);
        if (type === "single") return [id];
        return prev.includes(id) ? prev : [...prev, id];
      }),
  };

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn("border-t border-line", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { isOpen, toggle } = useAccordion();
  const open = isOpen(id);

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    // React owns `open` in both directions; the native toggle would race it.
    event.preventDefault();
    toggle(id, !open);
  }

  return (
    <details open={open} className={cn("border-b border-line", className)}>
      <summary
        onClick={onSummaryClick}
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-h5 text-ink [&::-webkit-details-marker]:hidden"
      >
        <span>{title}</span>
        <span aria-hidden className="shrink-0 text-primary">
          {open ? "–" : "+"}
        </span>
      </summary>
      <div className="pb-5 text-body text-ink-soft">{children}</div>
    </details>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run components/ui/accordion.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/accordion.tsx components/ui/accordion.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Accordion on native details/summary with single-open mode"
```

---

### Task 8: `Dialog` (extracted from `SearchPalette`)

**Parallel group:** C

**Files:**
- Create: `components/ui/dialog.tsx`
- Test: `components/ui/dialog.test.tsx`
- Read for reference (do **not** modify in this phase): `components/search-palette.tsx:88-121` — the focus-trap / Esc / return-focus logic being generalised. Phase 2 rewrites `SearchPalette` on top of `Dialog`.

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces:
  - `export type DialogProps = { open: boolean; onClose: () => void; title: string; hideTitle?: boolean; description?: string; size?: "sm" | "md" | "lg"; placement?: "center" | "top"; flush?: boolean; hideClose?: boolean; children: ReactNode; className?: string }`
  - `export function Dialog(props: DialogProps)` — portals into `document.body`, traps Tab, closes on Esc and on overlay click, restores focus to whatever was focused before it opened, and locks body scroll while open. `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the title (rendered `sr-only` when `hideTitle` or `flush`), `aria-describedby` when `description` is given.

- [ ] **Step 1: Write the failing test**

Create `components/ui/dialog.test.tsx`:

```tsx
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "@/components/ui/dialog";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open search
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Search pages"
        description="Type to filter every route."
      >
        <button type="button">Go to Stage 1</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("is closed until asked to open", () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("announces itself as a modal with a name and a description", async () => {
    await userEvent.click(render(<Harness />).getByText("Open search"));
    const dialog = screen.getByRole("dialog", { name: "Search pages" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const describedBy = dialog.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)).toHaveTextContent(
      "Type to filter every route.",
    );
  });

  it("moves focus in, locks scroll, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open search" });

    await user.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("returns focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open search" });

    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open search" }));
    await user.click(screen.getByRole("button", { name: "Close Search pages" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/dialog.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/dialog"`.

- [ ] **Step 3: Write the implementation**

Create `components/ui/dialog.tsx`:

```tsx
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Always required: it names the dialog for assistive technology. */
  title: string;
  /** Renders the title sr-only when the visual design has no header. */
  hideTitle?: boolean;
  description?: string;
  size?: keyof typeof SIZES;
  placement?: "center" | "top";
  /** Drop the header chrome and body padding (search palettes, media). */
  flush?: boolean;
  hideClose?: boolean;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  size = "md",
  placement = "center",
  flush = false,
  hideClose = false,
  children,
  className,
}: DialogProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      returnTo.current?.focus({ preventScroll: true });
    };
  }, [open]);

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.getAttribute("aria-hidden") !== "true",
    );

    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const focused = document.activeElement;

    if (event.shiftKey && (focused === first || !panel.contains(focused))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (focused === last || !panel.contains(focused))) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-0 z-[110] flex justify-center p-4",
        placement === "top" ? "items-start pt-[12vh]" : "items-center",
      )}
    >
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-lg border border-line bg-paper shadow-[var(--shadow-md)]",
          SIZES[size],
          className,
        )}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-pill text-ink-soft transition-colors duration-150 ease-out hover:bg-band hover:text-ink"
          >
            <span aria-hidden>✕</span>
          </button>
        )}

        <div
          className={cn(
            hideTitle || flush ? "sr-only" : "border-b border-line px-6 py-4 pr-14",
          )}
        >
          <h2 id={titleId} className="font-display text-h5 text-ink">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-small text-ink-soft">
              {description}
            </p>
          )}
        </div>

        <div className={cn(flush ? "" : "px-6 py-5")}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run components/ui/dialog.test.tsx`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/dialog.tsx components/ui/dialog.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): extract Dialog (portal, focus trap, Esc, return focus, scroll lock)"
```

---

### Task 9: Content primitives — `Stat`/`StatStrip`, `Callout`, `Source`/`SourceList`, `StepList`/`Step`, `ProgressBar`, `EmptyState`

**Parallel group:** D

**Files:**
- Create: `components/ui/stat.tsx`, `components/ui/callout.tsx`, `components/ui/source.tsx`, `components/ui/step-list.tsx`, `components/ui/progress-bar.tsx`, `components/ui/empty-state.tsx`
- Test: `components/ui/source.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `BadgeTone` from `./badge` (T3); `Heading` from `./heading` and `Text` from `./text` (T4); `Icon` from `./icon` (T1); `accent`, `type Accent` from `@/lib/accent`; `cn` from `@/lib/utils`.
- Produces:
  - `export type StatProps = { value: ReactNode; label: ReactNode; sub?: ReactNode; source?: { label: string; url: string; date?: string; grade?: SourceGrade }; className?: string }`; `export function Stat(props: StatProps)`; `export function StatStrip({ children, className? })`
  - `export type CalloutTone = "neutral" | Accent`; `export type CalloutProps = { children: ReactNode; tone?: CalloutTone; title?: ReactNode; icon?: string; className?: string }`; `export function Callout(props: CalloutProps)` — `icon` is a kebab name from `ICON_NAMES`.
  - `export type SourceGrade = "primary" | "vendor"`; `export type SourceProps = { label: string; url: string; date?: string; grade?: SourceGrade; className?: string }`; `export function Source(props: SourceProps)`; `export function SourceList({ sources, className? }: { sources: SourceProps[]; className?: string })`
  - `export function StepList({ children, className? })`; `export function Step({ n, title, children?, className? }: { n: number; title: ReactNode; children?: ReactNode; className?: string })`
  - `export type ProgressBarProps = { value: number; max?: number; label: string; hideLabel?: boolean; showValue?: boolean; tone?: Accent; className?: string }`; `export function ProgressBar(props: ProgressBarProps)`
  - `export type EmptyStateProps = { title: string; body?: ReactNode; icon?: string; action?: ReactNode; media?: ReactNode; className?: string }`; `export function EmptyState(props: EmptyStateProps)`

- [ ] **Step 1: Write the failing test**

Create `components/ui/source.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Source, SourceList } from "@/components/ui/source";

describe("Source", () => {
  it("renders the label as a safe external link", () => {
    render(<Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" />);
    const link = screen.getByRole("link", { name: "PSA Labour Force Survey" });
    expect(link).toHaveAttribute("href", "https://psa.gov.ph/lfs");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the date when one is given", () => {
    render(
      <Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" date="2026-03-01" />,
    );
    expect(screen.getByText(/2026-03-01/)).toBeInTheDocument();
  });

  it("flags vendor-grade data and stays quiet for primary sources", () => {
    const { unmount } = render(
      <Source label="Agency rate guide" url="https://example.com/guide" grade="vendor" />,
    );
    expect(screen.getByText("Vendor-grade")).toBeInTheDocument();
    unmount();

    render(<Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" />);
    expect(screen.queryByText("Vendor-grade")).toBeNull();
  });

  it("SourceList renders one item per source", () => {
    render(
      <SourceList
        sources={[
          { label: "PSA", url: "https://psa.gov.ph" },
          { label: "BIR", url: "https://bir.gov.ph" },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run components/ui/source.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/source"`.

- [ ] **Step 3: Write `components/ui/source.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type SourceGrade = "primary" | "vendor";

export type SourceProps = {
  label: string;
  url: string;
  date?: string;
  /** "vendor" = staffing/training-vendor marketing with no disclosed method. */
  grade?: SourceGrade;
  className?: string;
};

export function Source({ label, url, date, grade = "primary", className }: SourceProps) {
  return (
    <p className={cn("text-caption text-ink-faint", className)}>
      <span className="font-medium text-ink-soft">Source:</span>{" "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2"
      >
        {label}
      </a>
      {date && <span> · {date}</span>}
      {grade === "vendor" && (
        <Badge tone="caution" variant="outline" className="ml-2 align-middle">
          Vendor-grade
        </Badge>
      )}
    </p>
  );
}

export function SourceList({
  sources,
  className,
}: {
  sources: SourceProps[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {sources.map((source) => (
        <li key={`${source.url}-${source.label}`}>
          <Source {...source} />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run components/ui/source.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 5: Write `components/ui/stat.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Source, type SourceProps } from "./source";

export type StatProps = {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  /** Honesty doctrine: a number with a claim behind it ships its source. */
  source?: SourceProps;
  className?: string;
};

export function Stat({ value, label, sub, source, className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dd className="font-display text-h3 tabular-nums text-ink">{value}</dd>
      <dt className="text-small font-medium text-ink-soft">{label}</dt>
      {sub && <p className="text-caption text-ink-faint">{sub}</p>}
      {source && <Source {...source} />}
    </div>
  );
}

/** A quiet inline row of structural facts. No cute labels, no invented counts. */
export function StatStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={cn("flex flex-wrap gap-x-10 gap-y-6", className)}>{children}</dl>;
}
```

- [ ] **Step 6: Write `components/ui/callout.tsx`**

```tsx
import type { ReactNode } from "react";
import { ACCENT, isAccent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export type CalloutTone = "neutral" | Accent;

export type CalloutProps = {
  children: ReactNode;
  tone?: CalloutTone;
  title?: ReactNode;
  /** Kebab name from ICON_NAMES. Decorative — the title carries the meaning. */
  icon?: string;
  className?: string;
};

export function Callout({
  children,
  tone = "neutral",
  title,
  icon,
  className,
}: CalloutProps) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-5",
        a ? a.soft : "border-line-strong bg-band text-ink-soft",
        className,
      )}
    >
      {icon && (
        <span className="mt-0.5 shrink-0">
          <Icon name={icon} size={20} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="font-display text-h5">{title}</p>}
        <div className="text-base">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write `components/ui/step-list.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StepList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ol className={cn("flex flex-col gap-5", className)}>{children}</ol>;
}

export function Step({
  n,
  title,
  children,
  className,
}: {
  n: number;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex gap-4", className)}>
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-primary-tint font-display text-small font-bold text-primary-deep"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-h5 text-ink">{title}</span>
        {children && <div className="text-body text-ink-soft">{children}</div>}
      </div>
    </li>
  );
}
```

- [ ] **Step 8: Write `components/ui/progress-bar.tsx`**

```tsx
import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  /** Always required: it names the bar for assistive technology. */
  label: string;
  hideLabel?: boolean;
  showValue?: boolean;
  tone?: Accent;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  hideLabel = false,
  showValue = false,
  tone = "signal",
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center justify-between text-small text-ink-soft",
          hideLabel && "sr-only",
        )}
      >
        <span>{label}</span>
        {showValue && (
          <span className="tabular-nums text-ink-faint">
            {clamped} / {safeMax}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className="h-2 w-full overflow-hidden rounded-pill bg-band"
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-150 ease-out", accent(tone).fill)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write `components/ui/empty-state.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Icon } from "./icon";
import { Text } from "./text";

export type EmptyStateProps = {
  title: string;
  body?: ReactNode;
  /** Kebab name from ICON_NAMES. */
  icon?: string;
  action?: ReactNode;
  /** A `Figure`, when the empty state earns an image. */
  media?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  body,
  icon,
  action,
  media,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border border-dashed border-line-strong bg-band px-6 py-12 text-center",
        className,
      )}
    >
      {media}
      {!media && icon && (
        <span className="grid h-12 w-12 place-items-center rounded-pill bg-primary-tint text-primary">
          <Icon name={icon} size={24} weight="duotone" />
        </span>
      )}
      <Heading level={3} size="h5">
        {title}
      </Heading>
      {body && (
        <Text size="small" className="max-w-md">
          {body}
        </Text>
      )}
      {action}
    </div>
  );
}
```

- [ ] **Step 10: Type-check and re-run the suite**

Run: `npx tsc --noEmit && npx vitest run components/ui`
Expected: `tsc` silent; vitest PASS for every `components/ui/*.test.tsx` written so far.

- [ ] **Step 11: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/stat.tsx components/ui/callout.tsx components/ui/source.tsx components/ui/step-list.tsx components/ui/progress-bar.tsx components/ui/empty-state.tsx components/ui/source.test.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add Stat, Callout, Source, StepList, ProgressBar and EmptyState"
```

---

### Task 10: The visual layer — `data/visuals.json`, `lib/visuals.ts`, `Figure`, `DiagramFrame`

**Parallel group:** D

**Files:**
- Create: `data/visuals.json`, `lib/visuals.ts`, `components/ui/figure.tsx`, `components/ui/diagram-frame.tsx`
- Test: `lib/visuals.test.ts`, `components/ui/figure.test.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `next/image`.
- Produces:
  - `export type VisualEntry = { id: string; src: { avif?: string; webp?: string; jpg: string }; width: number; height: number; alt: string; caption?: string; generated?: boolean }`
  - `export function normaliseManifest(raw: unknown): VisualEntry[]` — total function; never throws, drops malformed entries.
  - `export function getVisual(id: string): VisualEntry | undefined`
  - `export function listVisuals(): VisualEntry[]`
  - `export type FigureRatio = "4/5" | "3/2" | "16/9" | "1/1" | "21/9" | "3/1" | "hero"` (`hero` = `aspect-[3/2] lg:aspect-[4/5]`, spec §4.4)
  - `export type FigureProps = { id?: string; src?: string; alt?: string; width?: number; height?: number; generated?: boolean; caption?: string; priority?: boolean; sizes?: string; ratio?: FigureRatio; radius?: "none" | "sm" | "md" | "lg"; className?: string }`
  - `export const ILLUSTRATIVE_CAPTION = "Illustrative image"`; `export function Figure(props: FigureProps)`
  - `export type DiagramFrameProps = { title: string; caption?: string; id?: string; className?: string; children: ReactNode }`; `export function DiagramFrame(props: DiagramFrameProps)`

**Phase note:** `data/visuals.json` ships **empty** (`{ "images": [] }`). Phase 3's `scripts/optimize-images.mjs` overwrites it with the same shape. Until then every `Figure id="…"` renders the labelled placeholder — that is expected, not a bug, and it is what the `/dev/ui` gallery will show.

- [ ] **Step 1: Create the empty manifest**

`data/visuals.json`:

```json
{
  "images": []
}
```

- [ ] **Step 2: Write the failing manifest test**

Create `lib/visuals.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normaliseManifest } from "@/lib/visuals";

const valid = {
  id: "home-hero",
  src: { avif: "/images/home-hero.avif", webp: "/images/home-hero.webp", jpg: "/images/home-hero.jpg" },
  width: 1200,
  height: 1500,
  alt: "A woman reviews a spreadsheet at a home desk",
  caption: "A corner desk in Cebu",
  generated: true,
};

describe("normaliseManifest", () => {
  it("returns an empty list for the empty manifest", () => {
    expect(normaliseManifest({ images: [] })).toEqual([]);
  });

  it("never throws on junk", () => {
    expect(normaliseManifest(null)).toEqual([]);
    expect(normaliseManifest(undefined)).toEqual([]);
    expect(normaliseManifest({})).toEqual([]);
    expect(normaliseManifest({ images: "nope" })).toEqual([]);
    expect(normaliseManifest([1, 2, 3])).toEqual([]);
  });

  it("keeps a complete entry as-is", () => {
    expect(normaliseManifest({ images: [valid] })).toEqual([valid]);
  });

  it("keeps a minimal entry", () => {
    const minimal = {
      id: "stage-start",
      src: { jpg: "/images/stage-start.jpg" },
      width: 1200,
      height: 800,
      alt: "A man sets up a second-hand monitor",
    };
    expect(normaliseManifest({ images: [minimal] })).toEqual([minimal]);
  });

  it("drops entries missing a jpg, an id, an alt, or real dimensions", () => {
    const broken = [
      { ...valid, id: "" },
      { ...valid, src: { avif: "/x.avif" } },
      { ...valid, width: "1200" },
      { ...valid, height: 0 },
      { ...valid, alt: undefined },
      "not-an-object",
    ];
    expect(normaliseManifest({ images: broken })).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `npx vitest run lib/visuals.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/visuals"`.

- [ ] **Step 4: Write `lib/visuals.ts`**

```ts
import manifest from "@/data/visuals.json";

/**
 * One optimised image. Written by `scripts/optimize-images.mjs` in Phase 3;
 * hand-editing `data/visuals.json` is not a supported workflow.
 */
export type VisualEntry = {
  id: string;
  src: { avif?: string; webp?: string; jpg: string };
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** True for gpt-image-2 output. `Figure` always captions these. */
  generated?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function toEntry(raw: unknown): VisualEntry | null {
  if (!isRecord(raw)) return null;
  const { id, src, width, height, alt, caption, generated } = raw;
  if (!isNonEmptyString(id)) return null;
  if (!isRecord(src) || !isNonEmptyString(src.jpg)) return null;
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) return null;
  if (!isNonEmptyString(alt)) return null;

  const entry: VisualEntry = {
    id,
    src: {
      ...(isNonEmptyString(src.avif) ? { avif: src.avif } : {}),
      ...(isNonEmptyString(src.webp) ? { webp: src.webp } : {}),
      jpg: src.jpg,
    },
    width,
    height,
    alt,
  };
  if (isNonEmptyString(caption)) entry.caption = caption;
  if (typeof generated === "boolean") entry.generated = generated;
  return entry;
}

/** Total function: malformed entries are dropped, never thrown on. */
export function normaliseManifest(raw: unknown): VisualEntry[] {
  if (!isRecord(raw)) return [];
  const images = raw.images;
  if (!Array.isArray(images)) return [];
  return images
    .map(toEntry)
    .filter((entry): entry is VisualEntry => entry !== null);
}

const VISUALS: VisualEntry[] = normaliseManifest(manifest);
const BY_ID = new Map(VISUALS.map((entry) => [entry.id, entry]));

export function getVisual(id: string): VisualEntry | undefined {
  return BY_ID.get(id);
}

export function listVisuals(): VisualEntry[] {
  return VISUALS;
}
```

- [ ] **Step 5: Run the manifest test and watch it pass**

Run: `npx vitest run lib/visuals.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 6: Write the failing `Figure` test**

Create `components/ui/figure.test.tsx`:

```tsx
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/image needs the Next image loader; the stub keeps the assertions on the
// markup Figure owns (src, alt, caption, placeholder).
vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...rest} />
  ),
}));

vi.mock("@/lib/visuals", () => ({
  getVisual: (id: string) => {
    if (id === "home-hero") {
      return {
        id: "home-hero",
        src: { webp: "/images/home-hero.webp", jpg: "/images/home-hero.jpg" },
        width: 1200,
        height: 1500,
        alt: "A woman reviews a spreadsheet at a home desk",
        generated: true,
      };
    }
    if (id === "journey-map") {
      return {
        id: "journey-map",
        src: { jpg: "/images/journey-map.jpg" },
        width: 1200,
        height: 800,
        alt: "The five stages laid out left to right",
        caption: "The path, end to end",
      };
    }
    return undefined;
  },
  listVisuals: () => [],
  normaliseManifest: () => [],
}));

import { Figure } from "@/components/ui/figure";

describe("Figure", () => {
  it("always captions a generated image as illustrative", () => {
    render(<Figure id="home-hero" ratio="hero" />);
    expect(
      screen.getByAltText("A woman reviews a spreadsheet at a home desk"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Illustrative image/)).toBeInTheDocument();
  });

  it("keeps the author's caption alongside the illustrative note", () => {
    render(<Figure id="home-hero" caption="A corner desk in Cebu" />);
    const caption = screen.getByText(/Illustrative image/);
    expect(caption).toHaveTextContent("A corner desk in Cebu");
  });

  it("does not add the illustrative note to a non-generated image", () => {
    render(<Figure id="journey-map" />);
    expect(screen.getByText("The path, end to end")).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative image/)).toBeNull();
  });

  it("renders a visible labelled placeholder for an unknown id, never a crash", () => {
    const { container } = render(<Figure id="not-generated-yet" ratio="3/2" />);
    expect(container.querySelector("img")).toBeNull();
    const placeholder = screen.getByRole("img", { name: /not-generated-yet/ });
    expect(placeholder).toBeInTheDocument();
    expect(screen.getByText(/Image not available/)).toBeInTheDocument();
  });

  it("accepts a direct src without touching the manifest", () => {
    render(
      <Figure
        src="/images/one-off.jpg"
        alt="A printed checklist beside a laptop"
        width={1200}
        height={800}
      />,
    );
    const img = screen.getByAltText("A printed checklist beside a laptop");
    expect(img).toHaveAttribute("src", "/images/one-off.jpg");
  });
});
```

- [ ] **Step 7: Run the test and watch it fail**

Run: `npx vitest run components/ui/figure.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/ui/figure"`.

- [ ] **Step 8: Write `components/ui/figure.tsx`**

```tsx
import Image from "next/image";
import { getVisual, type VisualEntry } from "@/lib/visuals";
import { cn } from "@/lib/utils";

export type FigureRatio = "4/5" | "3/2" | "16/9" | "1/1" | "21/9" | "3/1" | "hero";

/** Honesty doctrine (spec §7.1): every generated asset says so, visibly. */
export const ILLUSTRATIVE_CAPTION = "Illustrative image";

export type FigureProps = {
  /** Manifest id. Takes precedence over src/alt/width/height. */
  id?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  generated?: boolean;
  caption?: string;
  priority?: boolean;
  sizes?: string;
  ratio?: FigureRatio;
  radius?: "none" | "sm" | "md" | "lg";
  className?: string;
};

const RATIO: Record<FigureRatio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
  "3/1": "aspect-[3/1]",
  hero: "aspect-[3/2] lg:aspect-[4/5]",
};

const RADIUS = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
} as const;

export function Figure({
  id,
  src,
  alt,
  width,
  height,
  generated,
  caption,
  priority = false,
  sizes,
  ratio = "3/2",
  radius = "lg",
  className,
}: FigureProps) {
  const fromManifest: VisualEntry | undefined = id ? getVisual(id) : undefined;
  const inline: VisualEntry | undefined =
    !fromManifest && src && alt && width && height
      ? { id: src, src: { jpg: src }, width, height, alt, generated }
      : undefined;
  const entry = fromManifest ?? inline;

  const isGenerated = entry?.generated ?? generated ?? false;
  const descriptive = caption ?? entry?.caption;
  const captionParts = [descriptive, isGenerated ? ILLUSTRATIVE_CAPTION : null].filter(
    Boolean,
  );

  const captionNode =
    captionParts.length > 0 ? (
      <figcaption className="mt-2 text-caption text-ink-faint">
        {captionParts.join(" · ")}
      </figcaption>
    ) : null;

  // `relative` so callers can absolutely position the caption over the media
  // (CtaBand does this for the navy band).
  const root = cn("relative flex flex-col", className);

  if (!entry) {
    const label = alt ?? `Image not available: ${id ?? "unknown"}`;
    return (
      <figure className={root}>
        <div
          role="img"
          aria-label={label}
          className={cn(
            "grid w-full place-items-center border border-dashed border-line-strong bg-band p-6 text-center",
            RATIO[ratio],
            RADIUS[radius],
          )}
        >
          <span className="text-caption text-ink-faint">
            Image not available{id ? ` (${id})` : ""}
          </span>
        </div>
        {captionNode}
      </figure>
    );
  }

  return (
    <figure className={root}>
      <div className={cn("w-full overflow-hidden bg-band", RATIO[ratio], RADIUS[radius])}>
        <Image
          src={entry.src.avif ?? entry.src.webp ?? entry.src.jpg}
          alt={alt ?? entry.alt}
          width={entry.width}
          height={entry.height}
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 40vw, 100vw"}
          className="h-full w-full object-cover"
        />
      </div>
      {captionNode}
    </figure>
  );
}
```

- [ ] **Step 9: Run the test and watch it pass**

Run: `npx vitest run components/ui/figure.test.tsx`
Expected: PASS — 5 tests.

- [ ] **Step 10: Write `components/ui/diagram-frame.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DiagramFrameProps = {
  title: string;
  /** One sentence saying what to look at. */
  caption?: string;
  /** Anchor id; derived from the title when omitted. Server component — no useId. */
  id?: string;
  className?: string;
  children: ReactNode;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DiagramFrame({
  title,
  caption,
  id,
  className,
  children,
}: DiagramFrameProps) {
  const base = id ?? `diagram-${slugify(title)}`;
  const titleId = `${base}-title`;
  const descId = `${base}-desc`;

  return (
    <figure id={base} className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <p id={titleId} className="font-display text-h5 text-ink">
          {title}
        </p>
        {caption && (
          <p id={descId} className="text-small text-ink-soft">
            {caption}
          </p>
        )}
      </div>
      <div
        role="img"
        aria-labelledby={titleId}
        aria-describedby={caption ? descId : undefined}
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-line bg-paper p-4"
      >
        <div className="min-w-[32rem]">{children}</div>
      </div>
    </figure>
  );
}
```

- [ ] **Step 11: Type-check**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 12: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add data/visuals.json lib/visuals.ts lib/visuals.test.ts components/ui/figure.tsx components/ui/figure.test.tsx components/ui/diagram-frame.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(ui): add the visuals manifest, Figure (always captions generated assets) and DiagramFrame"
```

> If this commit fails with `Unable to create '.git/index.lock': File exists`, another agent is committing `data/*.json` at the same moment. Wait a few seconds and re-run the same two commands. Do not delete the lock file.

---

### Task 11: The barrels and `components/layout`

**Parallel group:** E

**Files:**
- Create: `components/ui/index.ts`
- Create: `components/layout/container.tsx`, `components/layout/section.tsx`, `components/layout/section-heading.tsx`, `components/layout/breadcrumb.tsx`, `components/layout/card-grid.tsx`, `components/layout/feature-row.tsx`, `components/layout/page-hero.tsx`, `components/layout/page-footer-nav.tsx`, `components/layout/cta-band.tsx`, `components/layout/toc.tsx`, `components/layout/index.ts`
- Test: `components/layout/layout.test.tsx`

**Interfaces:**
- Consumes: every primitive from Tasks 1–10 (`Badge`, `Button`, `Card`, `Figure`, `Heading`, `Icon`, `Kicker`, `Text`, `type KickerTone`, `type HeadingLevel`, `type HeadingSize`).
- Produces (these two export lists are the **contract** — Phases 2–7 import exactly these names):

`components/ui/index.ts`:

```ts
export { Accordion, AccordionItem, type AccordionProps } from "./accordion";
export { Badge, type BadgeProps, type BadgeTone, type BadgeVariant } from "./badge";
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./button";
export { Callout, type CalloutProps, type CalloutTone } from "./callout";
export { Card, CardBody, CardFooter, CardMedia, type CardMediaRatio, type CardPadding, type CardProps } from "./card";
export { Checkbox, type CheckboxProps } from "./checkbox";
export { ChoiceCard, type ChoiceCardProps } from "./choice-card";
export { DiagramFrame, type DiagramFrameProps } from "./diagram-frame";
export { Dialog, type DialogProps } from "./dialog";
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { Field, controlClass, useFieldControl, type FieldProps } from "./field";
export { Figure, type FigureProps, type FigureRatio } from "./figure";
export { Heading, type HeadingLevel, type HeadingProps, type HeadingSize } from "./heading";
export { Icon, ICON_NAMES, type IconProps } from "./icon";
export { Input, type InputProps } from "./input";
export { Kicker, type KickerTone } from "./kicker";
export { ProgressBar, type ProgressBarProps } from "./progress-bar";
export { Radio, type RadioProps } from "./radio";
export { Range, type RangeProps } from "./range";
export { Select, type SelectProps } from "./select";
export { Source, SourceList, type SourceGrade, type SourceProps } from "./source";
export { Stat, StatStrip, type StatProps } from "./stat";
export { Step, StepList } from "./step-list";
export { Switch, type SwitchProps } from "./switch";
export { Tab, TabList, TabPanel, Tabs, type TabsProps } from "./tabs";
export { Text, type TextProps, type TextSize, type TextTone } from "./text";
export { Textarea, type TextareaProps } from "./textarea";
```

`components/layout/index.ts`:

```ts
export { Breadcrumb, type Crumb } from "./breadcrumb";
export { CardGrid } from "./card-grid";
export { Container, type ContainerSize } from "./container";
export { CtaBand, type CtaBandProps } from "./cta-band";
export { FeatureRow, type Feature } from "./feature-row";
export { PageFooterNav, type FooterLink } from "./page-footer-nav";
export { PageHero, type PageHeroMedia, type PageHeroProps } from "./page-hero";
export { Section, type SectionBand, type SectionSpacing } from "./section";
export { SectionHeading, type SectionHeadingProps } from "./section-heading";
export { Toc, type TocItem } from "./toc";
```

- [ ] **Step 1: Write `components/ui/index.ts` exactly as printed above**

Create the file with the 27 lines from the Interfaces block. Nothing else goes in this file — no components, no re-ordering, no `export *`.

- [ ] **Step 2: Check the barrel resolves**

Run: `npx tsc --noEmit`
Expected: no output (exit 0). Any "has no exported member" here means a Task 1–10 file drifted from its Interfaces block — fix the primitive, not the barrel.

- [ ] **Step 3: Write the failing layout test**

Create `components/layout/layout.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/link needs the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

describe("Breadcrumb", () => {
  it("is a labelled nav whose last crumb is the current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "The Path", href: "/start" },
          { label: "Stage 2" },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");

    const current = screen.getByText("Stage 2");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).not.toBe("A");
  });

  it("never links the final crumb even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Reality Check", href: "/reality" },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Reality Check" })).toBeNull();
  });
});

describe("Container", () => {
  it("uses the content max-width and the gutter token by default", () => {
    render(<Container>content</Container>);
    const el = screen.getByText("content");
    expect(el.className).toContain("max-w-(--maxw)");
    expect(el.className).toContain("px-(--gutter)");
  });

  it("switches width tokens by size", () => {
    const { rerender } = render(<Container size="narrow">prose</Container>);
    expect(screen.getByText("prose").className).toContain("max-w-(--maxw-narrow)");

    rerender(<Container size="wide">bleed</Container>);
    expect(screen.getByText("bleed").className).toContain("max-w-(--maxw-wide)");
  });
});

describe("Section", () => {
  it("alternates bands and carries on-navy text on the ink band", () => {
    const { container, rerender } = render(<Section band="tint">band</Section>);
    expect(container.querySelector("section")?.className).toContain("bg-band");

    rerender(<Section band="navy">navy</Section>);
    const navy = container.querySelector("section");
    expect(navy?.className).toContain("bg-ink");
    expect(navy?.className).toContain("text-on-navy");
  });

  it("applies the rhythm tokens and can opt out", () => {
    const { container, rerender } = render(<Section>default</Section>);
    expect(container.querySelector("section")?.className).toContain("py-16");

    rerender(<Section spacing="hero">hero</Section>);
    expect(container.querySelector("section")?.className).toContain("py-20");

    rerender(<Section spacing="none">flush</Section>);
    const flush = container.querySelector("section");
    expect(flush?.className).not.toContain("py-16");
    expect(flush?.className).not.toContain("py-20");
  });
});
```

- [ ] **Step 4: Run the test and watch it fail**

Run: `npx vitest run components/layout/layout.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/layout/breadcrumb"`.

- [ ] **Step 5: Write `components/layout/container.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "default" | "narrow" | "wide";

const MAX: Record<ContainerSize, string> = {
  default: "max-w-(--maxw)",
  narrow: "max-w-(--maxw-narrow)",
  wide: "max-w-(--maxw-wide)",
};

export function Container({
  children,
  size = "default",
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  size?: ContainerSize;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
  className?: string;
}) {
  return (
    <Tag className={cn("mx-auto w-full px-(--gutter)", MAX[size], className)}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 6: Write `components/layout/section.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerSize } from "./container";

export type SectionBand = "none" | "tint" | "navy";
export type SectionSpacing = "default" | "hero" | "none";

const BAND: Record<SectionBand, string> = {
  none: "bg-paper",
  tint: "bg-band",
  navy: "bg-ink text-on-navy",
};

/** 64px mobile → 96px desktop; 128px for the homepage hero and CTA (spec §4.4). */
const SPACING: Record<SectionSpacing, string> = {
  default: "py-16 lg:py-24",
  hero: "py-20 lg:py-32",
  none: "",
};

export function Section({
  children,
  band = "none",
  spacing = "default",
  size = "default",
  id,
  className,
}: {
  children: ReactNode;
  band?: SectionBand;
  spacing?: SectionSpacing;
  size?: ContainerSize;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn(BAND[band], SPACING[spacing], className)}>
      <Container size={size}>{children}</Container>
    </section>
  );
}
```

- [ ] **Step 7: Write `components/layout/breadcrumb.tsx`**

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-ink-faint">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-150 ease-out hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && "text-ink-soft")}
                >
                  {item.label}
                </span>
              )}
              {!last && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 8: Write `components/layout/card-grid.tsx` and `components/layout/feature-row.tsx`**

`components/layout/card-grid.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const COLS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function CardGrid({
  children,
  cols = 3,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  as?: "div" | "ul";
  className?: string;
}) {
  return (
    <Tag className={cn("grid grid-cols-1 gap-6", COLS[cols], className)}>{children}</Tag>
  );
}
```

`components/layout/feature-row.tsx`:

```tsx
import { Heading, Icon, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

export type Feature = {
  /** Kebab name from ICON_NAMES. */
  icon: string;
  title: string;
  body: string;
};

/** Icon + title + one sentence, three up. No cards, no borders (spec §8.1.2). */
export function FeatureRow({
  items,
  className,
}: {
  items: Feature[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-8 sm:grid-cols-3", className)}>
      {items.map((feature) => (
        <div key={feature.title} className="flex flex-col items-start gap-3">
          <Icon name={feature.icon} size={28} weight="duotone" className="text-primary" />
          <Heading level={3} size="h5">
            {feature.title}
          </Heading>
          <Text>{feature.body}</Text>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Write `components/layout/section-heading.tsx`**

```tsx
import type { ReactNode } from "react";
import { Heading, Kicker, Text, type HeadingLevel, type HeadingSize, type KickerTone } from "@/components/ui";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  kicker?: string;
  kickerTone?: KickerTone;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-hand slot for the Learnora heading-left / button-right pattern. */
  action?: ReactNode;
  align?: "left" | "center";
  level?: HeadingLevel;
  size?: HeadingSize;
  id?: string;
  className?: string;
};

export function SectionHeading({
  kicker,
  kickerTone = "neutral",
  title,
  lead,
  action,
  align = "left",
  level = 2,
  size = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        className,
      )}
    >
      <div
        className={cn(
          "flex max-w-2xl flex-col gap-4",
          align === "center" && "items-center",
        )}
      >
        {kicker && <Kicker tone={kickerTone}>{kicker}</Kicker>}
        <Heading level={level} size={size} id={id} balance>
          {title}
        </Heading>
        {lead && <Text size="lead">{lead}</Text>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 10: Write `components/layout/toc.tsx` and `components/layout/page-footer-nav.tsx`**

`components/layout/toc.tsx`:

```tsx
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/** On-page nav for long guides. Visible from `xl` only (spec §5.3). */
export function Toc({
  items,
  title = "On this page",
  className,
}: {
  items: TocItem[];
  title?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label={title}
      className={cn("hidden xl:sticky xl:top-28 xl:block xl:self-start", className)}
    >
      <p className="text-kicker uppercase text-ink-faint">{title}</p>
      <ul className="mt-3 flex flex-col gap-2 border-l border-line pl-4">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-small text-ink-soft transition-colors duration-150 ease-out hover:text-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

`components/layout/page-footer-nav.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export type FooterLink = { label: string; href: string };

export function PageFooterNav({
  prev,
  next,
  up,
  className,
}: {
  prev?: FooterLink;
  next?: FooterLink;
  up?: FooterLink;
  className?: string;
}) {
  if (!prev && !next && !up) return null;

  return (
    <nav
      aria-label="Page navigation"
      className={cn(
        "flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {prev && (
          <Link
            href={prev.href}
            className="group flex flex-col gap-0.5 transition-colors duration-150 ease-out hover:text-primary"
          >
            <span className="text-caption text-ink-faint">Previous</span>
            <span className="text-base font-medium text-ink group-hover:text-primary">
              <span aria-hidden>← </span>
              {prev.label}
            </span>
          </Link>
        )}
      </div>

      {up && (
        <Link
          href={up.href}
          className="text-small font-medium text-primary underline underline-offset-4"
        >
          {up.label}
        </Link>
      )}

      <div className="min-w-0 sm:text-right">
        {next && (
          <Link
            href={next.href}
            className="group flex flex-col gap-0.5 transition-colors duration-150 ease-out hover:text-primary"
          >
            <span className="text-caption text-ink-faint">Next</span>
            <span className="text-base font-medium text-ink group-hover:text-primary">
              {next.label}
              <span aria-hidden> →</span>
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 11: Write `components/layout/page-hero.tsx`**

```tsx
import type { ReactNode } from "react";
import { Figure, Heading, Kicker, Text, type KickerTone } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Breadcrumb, type Crumb } from "./breadcrumb";
import { Section } from "./section";

/** Either a manifest image id, or an already-built node (a diagram component). */
export type PageHeroMedia = { figureId: string } | { node: ReactNode };

export type PageHeroProps = {
  breadcrumb?: Crumb[];
  kicker?: string;
  kickerTone?: KickerTone;
  title: ReactNode;
  /** Trailing headline segment coloured in primary (spec §4.1). */
  accent?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  media?: PageHeroMedia;
  /**
   * Guides and workshops pass `compact`: `display` headline, standard section
   * rhythm. The homepage and stage pages use the default: `hero` headline,
   * 128px rhythm.
   */
  compact?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PageHero({
  breadcrumb,
  kicker,
  kickerTone = "neutral",
  title,
  accent,
  lead,
  actions,
  media,
  compact = false,
  className,
  children,
}: PageHeroProps) {
  return (
    <Section spacing={compact ? "default" : "hero"} className={className}>
      <div
        className={cn(
          "grid gap-10",
          media && "lg:grid-cols-[1.1fr_0.9fr] lg:items-center",
        )}
      >
        <div className="flex flex-col items-start gap-5">
          {breadcrumb && <Breadcrumb items={breadcrumb} />}
          {kicker && <Kicker tone={kickerTone}>{kicker}</Kicker>}
          <Heading level={1} size={compact ? "display" : "hero"} accent={accent} balance>
            {title}
          </Heading>
          {lead && (
            <Text size="lead" className="max-w-2xl">
              {lead}
            </Text>
          )}
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          {children}
        </div>

        {media &&
          ("figureId" in media ? (
            <Figure id={media.figureId} ratio="hero" radius="lg" priority sizes="(min-width: 1024px) 40vw, 100vw" />
          ) : (
            <div className="min-w-0">{media.node}</div>
          ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 12: Write `components/layout/cta-band.tsx`**

```tsx
import type { ReactNode } from "react";
import { Figure, Heading, Kicker, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Container } from "./container";

export type CtaBandProps = {
  kicker?: string;
  title: ReactNode;
  body?: ReactNode;
  actions: ReactNode;
  /** The one navy band per page. The image sits at 20% behind it (spec §8.1.8). */
  media?: { figureId: string };
  className?: string;
};

export function CtaBand({
  kicker,
  title,
  body,
  actions,
  media,
  className,
}: CtaBandProps) {
  return (
    <section className={cn("relative overflow-hidden bg-ink text-on-navy", className)}>
      {media && (
        <div className="pointer-events-none absolute inset-0">
          <Figure
            id={media.figureId}
            ratio="21/9"
            radius="none"
            sizes="100vw"
            className="h-full [&>div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:opacity-20 [&_figcaption]:absolute [&_figcaption]:right-4 [&_figcaption]:bottom-3 [&_figcaption]:text-on-navy/70"
          />
        </div>
      )}
      <Container>
        <div className="relative flex flex-col items-start gap-6 py-20 lg:py-32">
          {kicker && <Kicker>{kicker}</Kicker>}
          <Heading level={2} size="display" tone="inherit" balance className="max-w-3xl">
            {title}
          </Heading>
          {body && (
            <Text size="lead" tone="inherit" className="max-w-xl">
              {body}
            </Text>
          )}
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 13: Write `components/layout/index.ts` exactly as printed in the Interfaces block**

Ten lines, alphabetical, no extras.

- [ ] **Step 14: Run the layout test and watch it pass**

Run: `npx vitest run components/layout/layout.test.tsx`
Expected: PASS — 6 tests.

- [ ] **Step 15: Run the whole suite and type-check**

Run: `npm run test:unit && npx tsc --noEmit`
Expected: vitest PASS across `lib/` and `components/`; `tsc` silent.

- [ ] **Step 16: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui/index.ts components/layout
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(layout): add Container, Section, SectionHeading, PageHero, CtaBand and friends behind two barrels"
```

---

### Task 12: Turn `components/ui.tsx` into a compatibility shim

**Parallel group:** F

**Files:**
- Modify (full rewrite): `components/ui.tsx`

**Interfaces:**
- Consumes: everything from `./ui/index` (T11) plus `PageHero`/`SectionHeading` from `@/components/layout`.
- Produces (in addition to re-exporting the whole `components/ui` barrel):
  - `export function Pill({ children, tone?, className? })` — `tone: BadgeTone`, renders `Badge variant="soft"`.
  - `export function ButtonLink({ href, children, variant?, external?, className? })` — `variant: "primary" | "ghost" | "outline"`, renders `Button` with a trailing arrow icon.
  - `export function ArrowLink({ href, children, className? })`
  - `export function SectionHeading(props)` — old signature `{ kicker?, title, lead?, align?, className? }`, forwards to the layout component.
  - `export function PageHero(props)` — old signature `{ kicker, title, lead?, titleWidth?, backdrop?, className?, children? }`; **`titleWidth` and `backdrop` are accepted and ignored** (the backdrops are the blur blobs §9 removes).
  - `export function Marquee({ items })` — carried over unchanged; unused today, deleted in Phase 5.

**Why:** 42 files import `@/components/ui`. Rewriting them is Phase 5's job. This shim keeps every one of them compiling on day one of Phase 1 while the new primitives become the real implementation underneath.

- [ ] **Step 1: Note the pre-existing call sites you must not break**

Run:
```bash
grep -rn 'from "@/components/ui"' --include=*.tsx app components | wc -l
grep -rn 'titleWidth\|backdrop=' --include=*.tsx app | wc -l
```
Expected: `42` importers, `18` legacy-prop call sites. Both numbers must still build at the end of this task.

- [ ] **Step 2: Replace the whole of `components/ui.tsx`**

```tsx
/**
 * Compatibility shim for the 33 pre-overhaul pages.
 *
 * The real implementations live in `components/ui/` and `components/layout/`.
 * Everything below is a thin wrapper around them that keeps the old prop
 * shapes compiling. Phase 5 migrates the call sites and deletes this file —
 * do not add anything new here.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge, Button, Icon, type BadgeTone } from "@/components/ui/index";
import {
  PageHero as LayoutPageHero,
  SectionHeading as LayoutSectionHeading,
  type SectionHeadingProps,
} from "@/components/layout";

export * from "./ui/index";

/** @deprecated Use `Badge`. */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <Badge tone={tone} variant="soft" className={className}>
      {children}
    </Badge>
  );
}

/** @deprecated Use `Button`. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  external?: boolean;
  className?: string;
}) {
  return (
    <Button
      href={href}
      external={external}
      variant={variant}
      size="md"
      className={className}
      iconEnd={<Icon name="arrow-right" size={16} />}
    >
      {children}
    </Button>
  );
}

/** @deprecated Use `Button variant="link"`. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary",
        className,
      )}
    >
      <span className="link-sweep">{children}</span>
      <Icon name="arrow-up-right" size={16} />
    </Link>
  );
}

/** @deprecated Import `SectionHeading` from `@/components/layout`. */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "left",
  className,
}: Pick<SectionHeadingProps, "kicker" | "title" | "lead" | "align" | "className">) {
  return (
    <LayoutSectionHeading
      kicker={kicker}
      title={title}
      lead={lead}
      align={align}
      className={className}
    />
  );
}

/**
 * @deprecated Import `PageHero` from `@/components/layout`.
 *
 * `titleWidth` and `backdrop` are accepted and ignored: headline width is now
 * the type scale's job, and the backdrops were the blur blobs §9 deletes.
 * The shim also renders its own `<section>` rhythm through the layout
 * component, so pages keep their spacing without passing anything new.
 */
export function PageHero({
  kicker,
  title,
  lead,
  titleWidth: _titleWidth,
  backdrop: _backdrop,
  className,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  titleWidth?: string;
  backdrop?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <LayoutPageHero kicker={kicker} title={title} lead={lead} compact className={className}>
      {children}
    </LayoutPageHero>
  );
}

/** @deprecated Slop pattern (§9). Unused; deleted in Phase 5. */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink py-4 text-on-navy">
      <div className="marquee-track gap-10">
        {doubled.map((it, idx) => (
          <span
            key={idx}
            className="flex shrink-0 items-center gap-10 font-display text-lg tracking-tight"
          >
            {it}
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no output (exit 0). If a page complains about an unused `_titleWidth`, that is `eslint`, not `tsc` — handled in the next step.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0. If `@typescript-eslint/no-unused-vars` flags `_titleWidth` / `_backdrop`, the `_` prefix is the configured ignore pattern in `eslint-config-next/typescript`; if it still complains, replace the destructure with a rest-and-drop:

```tsx
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  titleWidth?: string;
  backdrop?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
```
becomes a single `props` parameter and the body reads `props.kicker`, `props.title`, `props.lead`, `props.className`, `props.children` — never touching the two legacy keys.

- [ ] **Step 5: Build the whole site**

Run: `npm run build`
Expected: `✓ Compiled successfully`, then the route table listing all existing routes. No page may fail to compile.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `node --test` math suites PASS, then vitest PASS.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add components/ui.tsx
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "refactor(ui): make components/ui.tsx a shim over the new primitives"
```

---

### Task 13: `scripts/verify-primitives.mjs` (warn-only)

**Parallel group:** F

**Files:**
- Create: `scripts/verify-primitives.mjs`
- Modify: `package.json` (`scripts.verify:primitives`, appended to `scripts.verify:all`)

**Interfaces:**
- Consumes: nothing from the app. Pure Node, no dependencies.
- Produces: a CLI. `node scripts/verify-primitives.mjs` prints `file:line:col [rule] message` for every violation and **exits 0**; `--strict` exits 1 when there is at least one violation. Phase 5 flips the default by adding `--strict` to the npm script.

**Rules (spec §5.7), applied outside `components/ui` and `components/layout`:**

| id | pattern | scope |
|---|---|---|
| `accent-map` | `const accent(Text\|Bar\|Soft\|Border)` | `app/`, `components/`, `lib/` |
| `radius` | `rounded-(xl\|2xl\|3xl)` | same |
| `blur` | `blur-(2xl\|3xl)` | same |
| `lucide` | `from "lucide-react"` | same |
| `lift` | `hover:-translate-y` | same |
| `raw-card` | `border border-line bg-paper` | `app/` only |
| `raw-control` | `<input` / `<select` / `<textarea` in a file with no `@/components/ui` import | same |

- [ ] **Step 1: Write the script**

Create `scripts/verify-primitives.mjs`:

```js
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
```

- [ ] **Step 2: Run it and read the baseline**

Run: `node scripts/verify-primitives.mjs; echo "exit=$?"`
Expected: a long list of `app/**` findings (the pre-overhaul pages: `rounded-2xl`, `hover:-translate-y-1`, `lucide-react`, raw cards, raw inputs), then a summary line beginning `verify:primitives (warn-only): N violation(s)` and `exit=0`. Record `N` — Phase 5's job is to drive it to zero.

- [ ] **Step 3: Confirm `--strict` fails**

Run: `node scripts/verify-primitives.mjs --strict; echo "exit=$?"`
Expected: the same list, then `exit=1`.

- [ ] **Step 4: Confirm the primitives themselves are exempt**

Run: `node scripts/verify-primitives.mjs | grep -c "^components/ui/" || true`
Expected: `0`.

- [ ] **Step 5: Wire it into `package.json`**

Add one script and extend `verify:all` so the `scripts` block reads:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "node --test lib/*.test.mjs && vitest run",
  "test:unit": "vitest run",
  "test:watch": "vitest",
  "verify:claims": "node scripts/verify-claims.mjs",
  "verify:contrast": "node scripts/verify-contrast.mjs",
  "verify:links": "node scripts/verify-links.mjs",
  "verify:primitives": "node scripts/verify-primitives.mjs",
  "verify:all": "npm run verify:contrast && npm run verify:claims && npm run lint && npx tsc --noEmit && npm run verify:primitives"
}
```

- [ ] **Step 6: Run the full gate**

Run: `npm run verify:all`
Expected: contrast PASS, claims PASS, lint clean, `tsc` silent, then the primitives warning list and exit 0.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add scripts/verify-primitives.mjs package.json
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(verify): add warn-only verify:primitives and wire it into verify:all"
```

---

### Task 14: The `/dev/ui` gallery

**Parallel group:** G

**Files:**
- Create: `app/(dev)/dev/ui/page.tsx`, `app/(dev)/dev/ui/demos.tsx`
- Modify (full replacement): `app/sitemap.ts`, `app/robots.ts`

**Interfaces:**
- Consumes: every export of `@/components/ui` and `@/components/layout`.
- Produces: the route `/dev/ui` — the `(dev)` route group does not appear in the URL. It calls `notFound()` when `process.env.NODE_ENV === "production"`, so the production build renders the 404 page instead. It is the screenshot target for Task 16.

**Note:** `data/visuals.json` is empty in Phase 1, so the `Figure` section renders the labelled placeholder. That is the correct Phase 1 state; Phase 3 fills the manifest and the same page starts showing images.

- [ ] **Step 1: Write the client demo file**

Create `app/(dev)/dev/ui/demos.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button, ChoiceCard, Dialog, Field, Range, Switch, Text } from "@/components/ui";

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Vet this opportunity"
        description="Five gates. If two fail, walk away."
      >
        <Text>
          Every dialog traps Tab, closes on Escape, locks the page behind it, and
          returns focus to whatever opened it.
        </Text>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => setOpen(false)}>Got it</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export function SwitchDemo() {
  const [comfortable, setComfortable] = useState(false);
  const [lowData, setLowData] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <Switch
        checked={comfortable}
        onChange={setComfortable}
        label="Comfortable reading"
      />
      <Switch checked={lowData} onChange={setLowData} label="Low-data mode" />
      <Switch checked={false} onChange={() => {}} label="Disabled" disabled />
    </div>
  );
}

export function RangeDemo() {
  const [hours, setHours] = useState(20);
  return (
    <Field label="Hours a week" hint="Used by the rate worksheet.">
      <Range
        min={5}
        max={40}
        step={1}
        value={hours}
        onChange={(event) => setHours(Number(event.target.value))}
        valueLabel={`${hours} hours`}
      />
    </Field>
  );
}

export function ChoiceCardDemo() {
  const [choice, setChoice] = useState("direct");
  return (
    <Field as="group" label="Who holds the relationship?" hint="Pick one.">
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          name="relationship"
          value="agency"
          label="Agency"
          description="They own the client. You own your craft."
          checked={choice === "agency"}
          onChange={setChoice}
        />
        <ChoiceCard
          name="relationship"
          value="direct"
          label="Direct"
          description="You own the client and the invoice."
          checked={choice === "direct"}
          onChange={setChoice}
        />
      </div>
    </Field>
  );
}
```

- [ ] **Step 2: Write the gallery page**

Create `app/(dev)/dev/ui/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardMedia,
  Checkbox,
  DiagramFrame,
  EmptyState,
  Field,
  Figure,
  Heading,
  ICON_NAMES,
  Icon,
  Input,
  Kicker,
  ProgressBar,
  Radio,
  Select,
  Source,
  SourceList,
  Stat,
  StatStrip,
  Step,
  StepList,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
} from "@/components/ui";
import {
  Breadcrumb,
  CardGrid,
  Container,
  CtaBand,
  FeatureRow,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import { ACCENTS } from "@/lib/accent";
import { ChoiceCardDemo, DialogDemo, RangeDemo, SwitchDemo } from "./demos";

export const metadata = {
  title: "UI gallery",
  robots: { index: false, follow: false },
};

const TONES = ["neutral", ...ACCENTS] as const;

function Bay({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-line py-10">
      <Heading level={2} size="h3" id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
        {title}
      </Heading>
      {children}
    </section>
  );
}

export default function DevUiGallery() {
  // Development-only surface: never shipped, never indexed.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "UI gallery" }]}
        kicker="Development only"
        kickerTone="signal"
        title="Every primitive, every"
        accent="variant."
        lead="The screenshot target for component review. This route 404s in production and is excluded from the sitemap and robots."
        actions={
          <>
            <Button href="/">Back to the site</Button>
            <Button href="#buttons" variant="outline">
              Jump to buttons
            </Button>
          </>
        }
        compact
      />

      <Container>
        <Bay title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/start" icon={<Icon name="compass" size={18} />}>
              Internal link
            </Button>
            <Button href="https://psa.gov.ph" external variant="outline" iconEnd={<Icon name="arrow-up-right" size={16} />}>
              External link
            </Button>
          </div>
        </Bay>

        <Bay title="Badges and kickers">
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Badge key={`soft-${tone}`} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Badge key={`outline-${tone}`} tone={tone} variant="outline">
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Kicker key={`kicker-${tone}`} tone={tone}>
                {tone}
              </Kicker>
            ))}
          </div>
        </Bay>

        <Bay title="Type scale">
          <Heading level={2} size="hero" accent="online.">
            Build a career
          </Heading>
          <Heading level={2} size="display">
            Display
          </Heading>
          <Heading level={2} size="h2">
            Heading 2
          </Heading>
          <Heading level={3} size="h3">
            Heading 3
          </Heading>
          <Heading level={4} size="h4">
            Heading 4
          </Heading>
          <Heading level={5} size="h5">
            Heading 5
          </Heading>
          <Text size="lead">Lead — the sentence under a headline.</Text>
          <Text size="body">Body — long-form prose at 18px.</Text>
          <Text size="base">Base — UI and card copy at 16px.</Text>
          <Text size="small">Small — labels and metadata at 15px.</Text>
          <Text size="caption" tone="faint">
            Caption — captions and source lines at 13px.
          </Text>
        </Bay>

        <Bay title="Cards">
          <CardGrid cols={3}>
            <Card>
              <Heading level={3} size="h5">
                Plain card
              </Heading>
              <Text size="small">Bordered, never shadowed.</Text>
            </Card>
            <Card interactive>
              <Heading level={3} size="h5">
                Interactive
              </Heading>
              <Text size="small">Hover changes border and background only.</Text>
            </Card>
            <Card href="/start" padding="none">
              <CardMedia ratio="3/2">
                <Figure id="stage-start" ratio="3/2" radius="none" />
              </CardMedia>
              <CardBody>
                <Heading level={3} size="h5">
                  Media card
                </Heading>
                <Text size="small">The whole card is the link.</Text>
              </CardBody>
              <CardFooter>
                <Badge tone="signal">Stage 1</Badge>
              </CardFooter>
            </Card>
          </CardGrid>
        </Bay>

        <Bay title="Form controls">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Your name" hint="However you introduce yourself at work.">
              <Input placeholder="Maria Santos" />
            </Field>
            <Field label="Email" error="Enter a valid email." required>
              <Input type="email" defaultValue="not-an-email" />
            </Field>
            <Field label="What do you do?" hint="Two sentences is plenty.">
              <Textarea placeholder="I keep books for two Australian clients…" />
            </Field>
            <Field label="Stage">
              <Select defaultValue="2">
                <option value="1">Stage 1 — Start</option>
                <option value="2">Stage 2 — Get hired</option>
                <option value="3">Stage 3 — Deliver</option>
              </Select>
            </Field>
          </div>

          <Field as="group" label="Which apply?" hint="Pick as many as you like.">
            <Checkbox name="tools" value="sheets" label="Spreadsheets" defaultChecked />
            <Checkbox name="tools" value="crm" label="A CRM" />
            <Checkbox name="tools" value="none" label="Nothing yet" disabled />
          </Field>

          <Field as="group" label="How do you work?">
            <Radio name="mode" value="hourly" label="Hourly" defaultChecked />
            <Radio name="mode" value="retainer" label="Retainer" />
            <Radio name="mode" value="project" label="Per project" />
          </Field>

          <ChoiceCardDemo />
          <RangeDemo />
          <SwitchDemo />
        </Bay>

        <Bay title="Tabs">
          <Tabs defaultValue="agency">
            <TabList label="Client type">
              <Tab value="agency" icon={<Icon name="building-2" size={18} />}>
                Agency
              </Tab>
              <Tab value="direct" icon={<Icon name="handshake" size={18} />}>
                Direct
              </Tab>
              <Tab value="platform" disabled>
                Platform (disabled)
              </Tab>
            </TabList>
            <TabPanel value="agency">
              <Text>The agency holds the relationship. You hold the craft.</Text>
            </TabPanel>
            <TabPanel value="direct">
              <Text>You hold the relationship, the scope and the invoice.</Text>
            </TabPanel>
            <TabPanel value="platform">
              <Text>The platform holds the relationship.</Text>
            </TabPanel>
          </Tabs>
        </Bay>

        <Bay title="Accordion">
          <Accordion type="single" defaultOpen="free">
            <AccordionItem id="free" title="Is it really free?">
              Yes. Walang bayad, walang catch. Nothing here is gated.
            </AccordionItem>
            <AccordionItem id="degree" title="Do I need a degree?">
              No. You need evidence you can do the work.
            </AccordionItem>
            <AccordionItem id="ai" title="Is AI taking these jobs?">
              It is changing them. Read the sourced version on Reality Check.
            </AccordionItem>
          </Accordion>
        </Bay>

        <Bay title="Dialog">
          <DialogDemo />
        </Bay>

        <Bay title="Stats, callouts and sources">
          <StatStrip>
            <Stat value="5" label="Stages" sub="Start to Own" />
            <Stat value="11" label="Steps" />
            <Stat value="22" label="Niches" />
            <Stat value="40" label="Micro-tasks" />
          </StatStrip>

          <div className="grid gap-4 sm:grid-cols-2">
            {TONES.map((tone) => (
              <Callout key={`callout-${tone}`} tone={tone} title={`${tone} callout`} icon="lightbulb">
                One idea, stated once, with the source underneath it.
              </Callout>
            ))}
          </div>

          <SourceList
            sources={[
              { label: "PSA Labour Force Survey", url: "https://psa.gov.ph", date: "2026-03-01" },
              { label: "Agency rate guide", url: "https://example.com/guide", grade: "vendor" },
            ]}
          />
          <Source label="BIR Revenue Regulations" url="https://bir.gov.ph" />
        </Bay>

        <Bay title="Steps, progress and empty states">
          <StepList>
            <Step n={1} title="Pick a path">
              Twenty-two niches, filtered by what you already know.
            </Step>
            <Step n={2} title="Follow five stages">
              Eleven steps, in order, with a tool at each one.
            </Step>
            <Step n={3} title="Build every deliverable yourself">
              You write it. You own it.
            </Step>
          </StepList>

          <div className="flex max-w-md flex-col gap-4">
            <ProgressBar label="Stage 2 progress" value={2} max={3} showValue />
            <ProgressBar label="Plan days done" value={12} max={30} tone="verified" showValue />
          </div>

          <EmptyState
            title="No applications logged yet"
            body="The tracker fills up as you apply. Nothing here is sent anywhere — it lives in this browser."
            icon="clipboard-list"
            action={<Button href="/apply">Find your first opportunity</Button>}
          />
        </Bay>

        <Bay title="Figure and DiagramFrame">
          <div className="grid gap-6 sm:grid-cols-2">
            <Figure id="home-hero" ratio="hero" caption="Manifest entry (empty until Phase 3)" />
            <Figure id="does-not-exist" ratio="3/2" />
          </div>

          <DiagramFrame
            title="The path, end to end"
            caption="Five stages, eleven steps. Look at where the steps cluster."
          >
            <div className="flex items-center gap-3">
              {["Start", "Get hired", "Deliver", "Level up", "Own"].map((stage, index) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className="rounded-sm border border-line px-4 py-3 text-small text-ink">
                    {index + 1}. {stage}
                  </div>
                  {index < 4 && <span aria-hidden className="text-ink-faint">→</span>}
                </div>
              ))}
            </div>
          </DiagramFrame>
        </Bay>

        <Bay title="Layout">
          <SectionHeading
            kicker="Section heading"
            title="Heading left, action right"
            lead="The Learnora pattern: the section says what it is, the action says where to go."
            action={<Button variant="outline">Browse everything</Button>}
          />
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "The Path", href: "/start" },
              { label: "Stage 2" },
            ]}
          />
          <FeatureRow
            items={[
              { icon: "compass", title: "Pick a path", body: "Choose from twenty-two niches." },
              { icon: "list-checks", title: "Follow five stages", body: "Eleven steps, in order." },
              { icon: "hammer", title: "Build it yourself", body: "Every deliverable is yours." },
            ]}
          />
          <Toc
            items={[
              { id: "buttons", label: "Buttons" },
              { id: "cards", label: "Cards" },
              { id: "layout", label: "Layout" },
            ]}
          />
          <PageFooterNav
            prev={{ label: "Foundations", href: "/" }}
            next={{ label: "Navigation", href: "/" }}
            up={{ label: "Back to your path", href: "/path" }}
          />
        </Bay>

        <Bay title="Icons">
          <Text size="small">{ICON_NAMES.length} names in the registry.</Text>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-3">
            {ICON_NAMES.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-1.5 rounded-sm border border-line p-3 text-center"
              >
                <Icon name={name} size={22} />
                <span className="text-caption break-all text-ink-faint">{name}</span>
              </div>
            ))}
          </div>
        </Bay>
      </Container>

      <Section band="tint">
        <SectionHeading
          kicker="Bands"
          title="A tint band"
          lead="Bands alternate paper and tint; never two in a row."
        />
      </Section>

      <CtaBand
        kicker="The one navy band"
        title="Start with Stage 1."
        body="One idea, one button. The navy band appears once per page, above the footer."
        actions={<Button href="/start">Find your path</Button>}
      />
    </>
  );
}
```

- [ ] **Step 3: Replace `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import site from "@/data/site.json";

export const BASE_URL = "https://hirefrom.ph";

/**
 * Routes that exist but must never be advertised. `/dev/ui` is the
 * development-only component gallery — it 404s in production builds.
 */
const EXCLUDED = new Set(["/dev/ui"]);

/**
 * Every content route, derived from the nav so a new page can't be forgotten.
 * `/path` is intentionally excluded — it's a personalized, client-rendered app
 * hub that SSRs only an empty skeleton, so it's noindex (see path/layout.tsx).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...site.navGroups.flatMap((g) => g.links.map((l) => l.href)),
  ];

  return Array.from(new Set(routes))
    .filter((href) => !EXCLUDED.has(href))
    .map((href) => ({
      url: `${BASE_URL}${href === "/" ? "" : href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: href === "/" ? 1 : 0.7,
    }));
}
```

- [ ] **Step 4: Replace `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    // `/path` is crawlable so bots can see its page-level `noindex` metadata.
    // Blocking it here can leave the personalized dashboard indexed without a
    // useful snippet because crawlers never get to read that directive.
    // `/dev/` is the component gallery: it 404s in production and is never
    // linked, but the disallow makes the intent explicit.
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Verify the gallery renders in development**

Run:
```bash
npm run dev
```
Then open `http://localhost:3000/dev/ui`.
Expected: the page renders top to bottom — hero, buttons, badges, type scale, cards (with two placeholder figures), form controls, tabs, accordion, dialog trigger, stats/callouts/sources, steps/progress/empty state, figure + diagram, layout, the icon grid, a tint band and the navy CTA band. No console errors. Stop the server with Ctrl-C when done.

- [ ] **Step 6: Verify it 404s in production and stays out of the index**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully` and `/dev/ui` present in the route table (the `notFound()` is a runtime guard, not a build-time exclusion).

Run:
```bash
npx tsc --noEmit && npm run lint
```
Expected: both silent.

- [ ] **Step 7: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add "app/(dev)" app/sitemap.ts app/robots.ts
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "feat(dev): add the /dev/ui component gallery, excluded from sitemap and robots"
```

---

### Task 15: `BUILD_GUIDE.md` — rewrite "Shared components", fix the card and accent bullets

**Parallel group:** G

**Files:**
- Modify: `BUILD_GUIDE.md` (three edits, all inside the "Shared components" and "Page conventions" sections)

**Interfaces:**
- Consumes: the two barrels from T11 and the shim from T12. Nothing produces code here — this is the doc every future agent reads before touching a page.

- [ ] **Step 1: Replace the whole "Shared components" section**

Find the block that starts with the line `## Shared components (import and REUSE — do not re-invent)` and ends with the line `- `@/lib/utils` → `cn(...)`.` (the last bullet before `## Page conventions`). Replace all of it with:

````markdown
## Shared components (import and REUSE — do not re-invent)

Everything visual is built from two barrels. Pages compose them; pages do not
re-style borders, radii, inputs, type or accents by hand.
`npm run verify:primitives` warns when a page bypasses them, and from Phase 5 it
fails the build.

- `@/components/ui` — primitives, one per file:
  `Accordion` / `AccordionItem`, `Badge`, `Button`, `Callout`,
  `Card` / `CardBody` / `CardFooter` / `CardMedia`, `Checkbox`, `ChoiceCard`,
  `DiagramFrame`, `Dialog`, `EmptyState`, `Field` (+ `controlClass`,
  `useFieldControl`), `Figure`, `Heading`, `Icon` (+ `ICON_NAMES`), `Input`,
  `Kicker`, `ProgressBar`, `Radio`, `Range`, `Select`, `Source` / `SourceList`,
  `Stat` / `StatStrip`, `Step` / `StepList`, `Switch`,
  `Tabs` / `TabList` / `Tab` / `TabPanel`, `Text`, `Textarea`.
- `@/components/layout` — page structure: `Breadcrumb`, `CardGrid`, `Container`,
  `CtaBand`, `FeatureRow`, `PageFooterNav`, `PageHero`, `Section`,
  `SectionHeading`, `Toc`.

Rules that matter more than the list:

- **`Button` is the only button.** `href` renders a `next/link`; `href` +
  `external` renders `<a target="_blank" rel="noopener noreferrer">`; no `href`
  renders a real `<button>`. Never hand-roll a pill.
- **`Heading` and `Text` are the only way to reach the type scale.** Headline
  accent colouring is the `Heading accent` prop, never an inline
  `<span className="text-primary">`.
- **`Field` owns label, hint and error wiring.** Put a single control inside
  `Field`; put a set of `Radio`s or `ChoiceCard`s inside `Field as="group"`.
  `aria-describedby` and `aria-invalid` come for free — do not set them by hand.
- **`Figure` is the only image path.** Pass a manifest `id` from
  `data/visuals.json`, or `src` + `alt` + `width` + `height`. Any entry marked
  `generated` is captioned "Illustrative image" automatically; that caption is
  honesty doctrine, not decoration.
- **`Source` is the only way to cite.** `grade="vendor"` tags staffing- and
  training-vendor data as vendor-grade.
- **`Dialog` owns modality**: portal, focus trap, Escape, return focus, scroll
  lock. Do not write another one.

Still current, unchanged by the overhaul:

- `@/components/copy-button` → `CopyButton` ({value, label}).
- `@/components/path-chooser` → `PathChooser` ({compact?, redirectTo?, onChosen?}).
- `@/components/path-gate` → `PathGate` ({children, teaser?, unlocks?}) — wrap DEEP content; before the user picks a path it shows a locked invitation + inline chooser, after it reveals children.
- `@/lib/path-context` → `usePath()` → `{state, hydrated, hasPath, choosePath, clearPath, setStage, toggleStep, togglePlanDay, toggleEquipment, setPlanAnswers}`. Client only.
- `@/lib/accent` → `ACCENT`, `accent(id)`, `isAccent`, `ACCENTS` — the single accent map.
- `@/lib/utils` → `cn(...)`.

Deprecated, kept only so pre-overhaul pages compile (Phase 5 deletes them):
`Pill` (use `Badge`), `ButtonLink` (use `Button`), `ArrowLink` (use
`Button variant="link"`), `Marquee`, and the old `PageHero` / `SectionHeading`
signatures re-exported from `@/components/ui`. `@/components/reveal` → `Reveal`
is a no-op wrapper and is being unwrapped as pages migrate — do not add new uses.
`@/components/icon` re-exports `Icon` from `@/components/ui/icon`; import from
`@/components/ui` in new code.
````

- [ ] **Step 2: Replace the Cards bullet under "Page conventions"**

Find:

```markdown
- Cards: `rounded-[var(--radius)] border border-line bg-paper-2 p-6`, hover `hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-300`.
```

Replace with:

```markdown
- Cards: use `<Card>`. Bordered, **never shadowed** — `rounded-md border border-line bg-paper` on paper, `border-line-strong` on a band (`<Card onBand>`). Padding is `padding="sm" | "md" | "lg"`. `interactive` (or `href`) hovers to `border-ink` + `bg-band` only: no translate, no shadow, no scale. Compose media cards as `<Card padding="none"><CardMedia/><CardBody/><CardFooter/></Card>`.
```

- [ ] **Step 3: Replace the accent-map bullet under "Page conventions"**

Find:

```markdown
- accent maps (reuse):
  - text: signal→`text-signal`, verified→`text-verified`, caution→`text-caution-text`, info→`text-info`
  - bar/bg: signal→`bg-signal`, verified→`bg-verified`, caution→`bg-caution`, info→`bg-info`
```

Replace with:

```markdown
- Accents: `import { ACCENT, accent, type Accent } from "@/lib/accent"`. Stage ids in JSON stay `signal | caution | verified | info`; `coral` is added for red-flag content. Read classes off the map — `accent(stage.accent).text | .fill | .tint | .border | .ring | .soft` — and **never re-declare an accent map in a page**. `verify:primitives` flags `const accentText`, `accentBar`, `accentSoft`, `accentBorder`.
```

- [ ] **Step 4: Replace the page-shell code block under "Page conventions"**

The existing snippet teaches the exact pattern this phase replaces (raw `Reveal` + raw `h1` + `container-x`). Find:

````markdown
- Page shell pattern:
  ```tsx
  <section className="container-x pt-14 pb-10 lg:pt-20">
    <Reveal><Kicker>…</Kicker></Reveal>
    <Reveal i={1}><h1 className="mt-5 font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">…</h1></Reveal>
    <Reveal i={2}><p className="mt-5 max-w-2xl text-[length:var(--text-lead)] text-ink-soft">{intro}</p></Reveal>
  </section>
  ```
````

Replace with:

````markdown
- Page shell pattern:
  ```tsx
  <PageHero
    breadcrumb={[{ label: "Home", href: "/" }, { label: "Reality Check" }]}
    kicker="Reality Check"
    title="What this career actually pays"
    lead={intro}
    actions={<Button href="/start">Find your path</Button>}
    compact
  />
  <Section band="tint">
    <SectionHeading kicker="…" title="…" lead="…" />
    {/* content */}
  </Section>
  <PageFooterNav prev={…} next={…} up={{ label: "Back to your path", href: "/path" }} />
  ```
````

- [ ] **Step 5: Sanity-check the doc**

Run:
```bash
grep -n "hover:-translate-y\|accentText\|Lucide" BUILD_GUIDE.md
```
Expected: no matches inside the sections you edited. (The header line at the top of the file still says `lucide-react`; Phase 5 removes the dependency and that line with it.)

- [ ] **Step 6: Commit**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add BUILD_GUIDE.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "docs(build-guide): document the primitive and layout barrels; fix card and accent rules"
```

---

### Task 16: Phase exit verification

**Parallel group:** G (runs last, after T14 and T15 have landed)

**Files:**
- Create: `screenshots/dev-ui-1280.png`, `screenshots/dev-ui-375.png`
- Modify: this plan file (append the Status block)

**Interfaces:**
- Consumes: everything. Produces the evidence Phase 2 starts from.

- [ ] **Step 1: Run the full static gate**

Run: `npm run verify:all`
Expected, in order: `verify:contrast` PASS, `verify:claims` PASS, `eslint` clean, `tsc --noEmit` silent, `verify:primitives` warning list + exit 0. The whole command must exit 0.

- [ ] **Step 2: Run every test**

Run: `npm test`
Expected: the `node --test` math suites PASS, then vitest PASS. Test files that must be green:

```
lib/accent.test.ts
lib/visuals.test.ts
components/ui/icon.test.tsx
components/ui/button.test.tsx
components/ui/card.test.tsx
components/ui/heading.test.tsx
components/ui/field.test.tsx
components/ui/tabs.test.tsx
components/ui/accordion.test.tsx
components/ui/dialog.test.tsx
components/ui/source.test.tsx
components/ui/figure.test.tsx
components/layout/layout.test.tsx
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`; every pre-existing route still present in the route table plus `/dev/ui`.

- [ ] **Step 4: Start the dev server for screenshots**

Run (background):
```bash
npm run dev
```
Wait for `Ready in …` and confirm `http://localhost:3000/dev/ui` responds:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dev/ui
```
Expected: `200`.

- [ ] **Step 5: Capture the desktop screenshot**

Using the chrome-devtools MCP tools:
1. `new_page` → `http://localhost:3000/dev/ui`
2. `resize_page` → width `1280`, height `900`
3. `take_screenshot` → `fullPage: true`, `filePath: screenshots/dev-ui-1280.png`

Expected: a file at `screenshots/dev-ui-1280.png` showing the whole gallery. Check by eye: buttons are pills, cards have hairline borders and no shadows, headings are Cabinet Grotesk, the two `Figure` placeholders read "Image not available", the navy CTA band is the only dark surface.

- [ ] **Step 6: Capture the mobile screenshot**

1. `resize_page` → width `375`, height `812`
2. `take_screenshot` → `fullPage: true`, `filePath: screenshots/dev-ui-375.png`

Expected: a file at `screenshots/dev-ui-375.png`. Check by eye: nothing overflows horizontally, the card grid is one column, the tablist wraps, form controls are full width, the diagram scrolls inside its frame rather than widening the page.

- [ ] **Step 7: Stop the dev server**

Ctrl-C the `npm run dev` process.

- [ ] **Step 8: Keyboard pass (manual, 3 minutes)**

With the dev server running one more time, on `/dev/ui`, using only the keyboard:
- Tab reaches every button in order; the focus ring is a 2px primary outline with 2px offset.
- On the tablist: `→` `←` move and select, `Home`/`End` jump, the disabled tab is skipped.
- On the accordion: `Enter` or `Space` on a summary opens it and closes the sibling.
- On the dialog: `Enter` opens it, focus lands inside, `Tab` cycles without escaping, `Esc` closes it and focus returns to "Open dialog".
- On the switches: `Space` toggles; the disabled one does not.

Fix anything that fails before continuing.

- [ ] **Step 9: Append the Status block to this plan**

Append to the end of `docs/superpowers/plans/2026-08-21-ui-overhaul-p1-primitives.md`:

```markdown
---

## Status

**Phase 1 complete — <YYYY-MM-DD>**

| Gate | Result |
|---|---|
| `npm run verify:all` | pass |
| `npm test` | pass (<N> vitest tests across 13 files) |
| `npm run build` | pass |
| `verify:primitives` baseline | <N> warnings, all in `app/` — Phase 5 drives this to 0 |
| Screenshots | `screenshots/dev-ui-1280.png`, `screenshots/dev-ui-375.png` |
| Keyboard pass | tabs, accordion, dialog, switches — pass |

**Delivered:** 27 primitives in `components/ui`, 10 layout components in
`components/layout`, both barrels, `components/ui.tsx` as a shim (all 33 pages
still compile), `scripts/verify-primitives.mjs` (warn-only), `/dev/ui`,
`data/visuals.json` + `lib/visuals.ts`, BUILD_GUIDE rewritten.

**Deferred to later phases as designed:** `SearchPalette` moves onto `Dialog`
(Phase 2); `data/visuals.json` is filled by the optimiser (Phase 3); page
migration off the shim and `verify:primitives --strict` (Phase 5);
`components/practice/*` (Phase 6).

**Notes for Phase 2:** <anything the implementer hit that the next phase needs>
```

- [ ] **Step 10: Commit the evidence**

```bash
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite add screenshots/dev-ui-1280.png screenshots/dev-ui-375.png docs/superpowers/plans/2026-08-21-ui-overhaul-p1-primitives.md
git -c safe.directory=D:/startups/my-projects/DevUpProject/hirefromwebsite commit -m "chore(phase-1): gallery screenshots and phase exit status"
```

---

## Self-review

Run against the spec with fresh eyes, per the writing-plans skill.

### 1. Spec coverage

| Spec section | Requirement | Task |
|---|---|---|
| §4.1 Typography | Only `Heading`/`Text` reach the scale; `accent` prop on hero/display | T4 |
| §4.2 Colour | Every accent class from `lib/accent.ts`; no new maps | T3, T9, T13 |
| §4.3 Shape/depth | Radius tokens; cards bordered not shadowed; shadows on `Dialog` only | T3, T8, T15 |
| §4.4 Layout/rhythm | `Container` (default/narrow/wide), `Section` spacing 64→96, hero 128; 24px grid gap and card padding | T11 |
| §4.5 Motion | 150ms colour/border transitions only; no lifts | T2, T3, T13 |
| §4.6 Iconography | Phosphor only; `Icon` moves to `components/ui/icon.tsx` | T1 |
| §5.1 Directory layout | `components/ui/`, `components/layout/`, `lib/visuals.ts` | T1–T11 |
| §5.2 Primitives table | All 19 rows: Button, Card, Badge, Kicker, Heading/Text, the field family, Tabs, Accordion, Stat/StatStrip, Callout, Source/SourceList, StepList/Step, ProgressBar, Figure, DiagramFrame, Dialog, EmptyState, Icon | T1–T10 |
| §5.3 Layout components | Container, Section, SectionHeading (+`action`, `align`), PageHero (breadcrumb/kicker/title/lead/actions/media/compact), PageFooterNav, CtaBand, FeatureRow, CardGrid, Toc, Breadcrumb | T11 |
| §5.7 Enforcement | All seven rules, file:line, wired into `verify:all`, warn-only | T13 |
| §5.8 Dev gallery | Every primitive and variant; 404 in production; out of sitemap and robots | T14 |
| §7.1 Honesty rules | `Figure` always captions generated assets; manifest shape committed empty | T10 |
| §7.2/§7.3 Diagrams & manifest | `DiagramFrame` with `role="img"` + labelled/described, horizontal scroll; `data/visuals.json` | T10 |
| §10 Accessibility | Focus ring inherited from Phase 0; 44px+ targets (`h-11`/`h-12` buttons, 48px rows are Phase 2's header); `Accordion` on native `<details>`; keyboard-complete tabs and dialog; icons decorative by default | T1, T2, T6, T7, T8, T16 |
| §13 Testing | Vitest + Testing Library for Button-as-link, Tabs keyboard, Accordion single-open, Dialog focus trap + Esc, Field `aria-describedby` | T2, T5, T6, T7, T8 (+ T1, T3, T4, T9, T10, T11 beyond the spec's minimum) |
| §14 Phase 1 exit criteria | "Gallery screenshot reviewed; tests pass" | T16 |
| §15 Documentation | `BUILD_GUIDE.md` primitives section | T15 |

**Deliberately out of scope for Phase 1, with the phase that owns them:** `SiteHeader`/`SiteFooter`/`SearchPalette` on `Dialog` and `/library` (Phase 2, §6); the image and diagram pipelines that *fill* the manifest (Phase 3, §7.1–7.2); homepage and `StagePage` rebuilds (Phase 4, §8); page migration and `Reveal`/`lucide-react` removal (Phase 5, §9); `components/practice/*` (Phase 6, §5.2b); educator kit (Phase 7, §7.5). No spec requirement assigned to Phase 1 in §14 is unimplemented.

**Deviations recorded:**

1. **`Field as="group"`** is not in the spec's props list. A single `<label htmlFor>` cannot address a radio set, so group mode renders `<fieldset>/<legend>`. `FieldProps` is exported, so the addition is visible to later phases.
2. **`Card onBand`** is not in the spec's props list. §4.3 requires `line-strong` borders for cards sitting on a band; the prop is how a page says so.
3. **`Heading accent` at non-hero sizes** renders the copy uncoloured instead of dropping it. Silently discarding an author's words is worse than ignoring the styling.
4. **`Figure` caption composition.** The spec says generated assets "always render the illustrative caption". When the entry also has a descriptive caption, `Figure` renders `"<caption> · Illustrative image"` rather than replacing it — the honesty note is always present, the description is never lost.
5. **`PageHero` size rule.** With only `compact` in the agreed prop list, the mapping is fixed: `compact` → `display` + default rhythm (guides, workshops, and the T12 shim); default → `hero` + 128px rhythm (home, stage pages). Phase 4 gets what §8.1 and §8.2 describe without a new prop.
6. **BUILD_GUIDE page-shell snippet** (T15 Step 4) is replaced as well as the two bullets the brief named. Leaving a code block that teaches `Reveal` + raw `h1` + `container-x` would actively work against the phase.
7. **`next/link` and `next/image` are stubbed in tests** (`button.test.tsx`, `card.test.tsx`, `layout.test.tsx`, `figure.test.tsx`). jsdom cannot supply the App Router context or the image loader; the stubs keep every assertion on markup these components own. The real integration is covered by `npm run build` and the T16 screenshots.
8. **`Icon` is now `aria-hidden` by default.** The pre-move component was not. This is an §10 improvement and is covered by a test; call sites that need an announced icon pass `aria-label`.

### 2. Placeholder scan

Searched the plan for `TBD`, `TODO`, `implement later`, `fill in details`, `add appropriate error handling`, `add validation`, `handle edge cases`, `write tests for the above`, `similar to Task`. **No matches.** Every code step carries the actual file contents; the two tasks that repeat a pattern (the `next/link` stub in three test files, the git commit block in every task) repeat the code in full rather than cross-referencing. The only intentionally variable text is the `<YYYY-MM-DD>`, `<N>` and `<anything the implementer hit…>` placeholders inside the T16 Status **template**, which is a form to fill at completion time, not an unfinished instruction.

### 3. Type consistency

Checked every name that crosses a task boundary:

- `BadgeTone` is defined once (T3, `badge.tsx`) and reused by `KickerTone` (T3), `CalloutTone` (T9, as `"neutral" | Accent` — the identical union, declared locally so `callout.tsx` does not depend on `badge.tsx`), the shim's `Pill` (T12) and `PageHero.kickerTone` / `SectionHeading.kickerTone` (T11).
- `SourceProps` is defined in T9 and consumed by `StatProps.source` in the same task; `SourceGrade` is exported from the same file the barrel names.
- `useFieldControl()` returns `{ id: string | undefined; describedBy: string | undefined; invalid: boolean; required: boolean }` in T5 and is destructured the same way in all eight controls plus `ChoiceCard`.
- `controlClass` is a `string` exported from `field.tsx` (T5); `Input`, `Textarea` and `Select` all compose it through `cn`.
- `HeadingLevel` / `HeadingSize` (T4) are imported by `SectionHeading` (T11) with those exact names; `KickerTone` (T3) by `SectionHeading` and `PageHero` (T11).
- `VisualEntry` (T10) is the return type of `getVisual` and the shape `Figure` builds for the inline `src` case; `FigureRatio` includes `"hero"` and `RATIO.hero` is `aspect-[3/2] lg:aspect-[4/5]`, matching the brief.
- `Crumb` (T11 `breadcrumb.tsx`) is the element type of `PageHeroProps.breadcrumb`; `FooterLink` (T11 `page-footer-nav.tsx`) is used only there; `PageHeroMedia` is the union `{ figureId } | { node }` and `PageHero` discriminates with `"figureId" in media`.
- `ContainerSize` (T11) is reused as `Section`'s `size` prop.
- `ACCENT`, `accent`, `isAccent`, `Accent`, `ACCENTS` are used exactly as Phase 0 exports them (`Badge`, `Kicker`, `Callout` use `ACCENT`/`isAccent`; `ProgressBar` uses `accent(tone).fill`; the gallery uses `ACCENTS`).
- Barrel spelling verified line by line against the contract in T11: 27 lines in `components/ui/index.ts`, 10 in `components/layout/index.ts`, every named file exists in a task above, and every exported symbol is declared in that file's task.
- Shim (T12) re-exports `./ui/index` and adds only `Pill`, `ButtonLink`, `ArrowLink`, `SectionHeading`, `PageHero`, `Marquee` — none of which collide with a barrel name (`Kicker` comes from the barrel and is prop-compatible with the old one).
