"use client";

import { usePracticeSlot } from "@/components/practice";
import { Icon, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * "Pick two, grow one" as a thing the visitor does. Same namespace and
 * total-parser contract as `lib/practice-store.ts`; kept here because nothing
 * else reads it.
 */
export const INTELLIGENCES_KEY = "hfph.practice.intelligences.v1";

export type Mark = "mine" | "growing";
/** Mark per intelligence, keyed by `slugName(name)`. Unmarked items are absent. */
export type IntelligenceMarks = Record<string, Mark>;

const EMPTY_MARKS: IntelligenceMarks = {};
const LEAD_WITH = 2;
const GROW = 1;

export function slugName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseIntelligenceMarks(raw: unknown): IntelligenceMarks {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return EMPTY_MARKS;
  const out: IntelligenceMarks = {};
  for (const [slug, value] of Object.entries(raw)) {
    if (value === "mine" || value === "growing") out[slug] = value;
  }
  return out;
}

function statusLine(mine: number, growing: number): string {
  if (mine === 0 && growing === 0) return "Nothing marked yet.";
  const parts: string[] = [];
  parts.push(
    mine === LEAD_WITH
      ? "Two to lead with."
      : mine < LEAD_WITH
        ? `${mine} to lead with, pick ${LEAD_WITH - mine} more.`
        : `${mine} marked yours. Lead with two; the rest are a bonus.`,
  );
  parts.push(
    growing === GROW
      ? "One to grow this quarter."
      : growing === 0
        ? "Now pick one to grow."
        : `${growing} to grow. One at a time lands; pick the one you'd use first.`,
  );
  return parts.join(" ");
}

type Props = {
  items: readonly { name: string }[];
  title: string;
  hint: string;
};

export function IntelligencePicker({ items, title, hint }: Props) {
  const { value: marks, set, hydrated } = usePracticeSlot(
    INTELLIGENCES_KEY,
    EMPTY_MARKS,
    parseIntelligenceMarks,
  );

  const mine = items.filter((it) => marks[slugName(it.name)] === "mine").length;
  const growing = items.filter((it) => marks[slugName(it.name)] === "growing").length;

  function toggle(slug: string, mark: Mark) {
    set((prev) => {
      const next = { ...prev };
      if (next[slug] === mark) delete next[slug];
      else next[slug] = mark;
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text size="base" tone="ink" className="font-medium">
          {title}
        </Text>
        <Text size="caption" tone="faint" className="mt-1">
          {hint}
        </Text>
      </div>

      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {items.map((it) => {
          const slug = slugName(it.name);
          const mark = marks[slug];
          return (
            <li
              key={slug}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2"
            >
              <Text size="small" tone="ink" className="font-medium">
                {it.name}
              </Text>
              <div className="flex gap-2">
                <MarkButton
                  pressed={mark === "mine"}
                  disabled={!hydrated}
                  onClick={() => toggle(slug, "mine")}
                  label={`Mine: ${it.name}`}
                  icon="check"
                >
                  Mine
                </MarkButton>
                <MarkButton
                  pressed={mark === "growing"}
                  disabled={!hydrated}
                  onClick={() => toggle(slug, "growing")}
                  label={`Growing: ${it.name}`}
                  icon="trending-up"
                >
                  Growing
                </MarkButton>
              </div>
            </li>
          );
        })}
      </ul>

      <p role="status" className="text-small text-ink-soft" suppressHydrationWarning>
        {hydrated ? statusLine(mine, growing) : " "}
      </p>
    </div>
  );
}

function MarkButton({
  pressed,
  disabled,
  onClick,
  label,
  icon,
  children,
}: {
  pressed: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-3 font-display text-small font-bold transition-colors duration-150 ease-out",
        pressed
          ? "border-primary bg-primary text-white"
          : "border-line-strong bg-paper text-ink hover:border-ink hover:bg-band",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Icon name={icon} size={14} />
      {children}
    </button>
  );
}
