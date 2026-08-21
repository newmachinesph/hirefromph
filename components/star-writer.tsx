"use client";

import { useState } from "react";
import { ExportButton, usePracticeSlot } from "@/components/practice";
import { labToMarkdown } from "@/lib/markdown-export";
import { Button, Field, Icon, Select, Text, Textarea } from "@/components/ui";

/**
 * The STAR writer's localStorage slot. Same namespace and same total-parser
 * contract as `lib/practice-store.ts`; kept here because nothing else reads it.
 */
export const STAR_KEY = "hfph.practice.star.v1";

export type StarStory = { s: string; t: string; a: string; r: string };
/** One story per theme, keyed by `slugTheme(theme)`. */
export type StarState = Record<string, StarStory>;

const EMPTY_STAR: StarState = {};
const EMPTY_STORY: StarStory = { s: "", t: "", a: "", r: "" };

const PARTS = [
  { key: "s", letter: "S", name: "Situation", hint: "One or two sentences: where, when, what was at stake." },
  { key: "t", letter: "T", name: "Task", hint: "What you, not the team, had to solve." },
  { key: "a", letter: "A", name: "Action", hint: "What you did, step by step. Spend most of the story here." },
  { key: "r", letter: "R", name: "Result", hint: "How it ended. A real number if you have one; the concrete change if you don't." },
] as const;

export function slugTheme(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

/** Total: keeps well-formed stories, drops the rest, never throws. */
export function parseStarState(raw: unknown): StarState {
  if (!isRecord(raw)) return EMPTY_STAR;
  const out: StarState = {};
  for (const [slug, value] of Object.entries(raw)) {
    if (!isRecord(value)) continue;
    const { s, t, a, r } = value;
    if ([s, t, a, r].some((part) => typeof part !== "string")) continue;
    out[slug] = { s: s as string, t: t as string, a: a as string, r: r as string };
  }
  return out;
}

function isStarted(story: StarStory | undefined): boolean {
  return !!story && PARTS.some((p) => story[p.key].trim().length > 0);
}

type Theme = { theme: string; prompt: string };
type Step = { n: number; title: string; desc: string };

type Props = {
  themes: readonly Theme[];
  steps: readonly Step[];
};

/**
 * Four boxes, one story per theme, saved in this browser only. The writer
 * owns nothing the visitor did not type: themes and steps come from
 * data/interview.json and the export carries only their words.
 */
export function StarWriter({ themes, steps }: Props) {
  const { value, set, hydrated } = usePracticeSlot(STAR_KEY, EMPTY_STAR, parseStarState);
  const [activeSlug, setActiveSlug] = useState(() => slugTheme(themes[0]?.theme ?? ""));

  const active = themes.find((t) => slugTheme(t.theme) === activeSlug) ?? themes[0];
  const story = value[activeSlug] ?? EMPTY_STORY;
  const started = themes.filter((t) => isStarted(value[slugTheme(t.theme)])).length;

  function write(key: keyof StarStory, text: string) {
    set((prev) => ({
      ...prev,
      [activeSlug]: { ...(prev[activeSlug] ?? EMPTY_STORY), [key]: text },
    }));
  }

  function clearStory() {
    set((prev) => {
      const next = { ...prev };
      delete next[activeSlug];
      return next;
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
      <div className="flex flex-col gap-6">
        <Field label="Which story?" hint={active?.prompt}>
          <Select value={activeSlug} onChange={(e) => setActiveSlug(e.target.value)}>
            {themes.map((t) => {
              const slug = slugTheme(t.theme);
              return (
                <option key={slug} value={slug}>
                  {t.theme}
                  {isStarted(value[slug]) ? " · started" : ""}
                </option>
              );
            })}
          </Select>
        </Field>

        <div className="flex flex-col gap-4">
          {PARTS.map((p) => (
            <Field
              key={p.key}
              label={
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-ink font-display text-base text-on-navy">
                    {p.letter}
                  </span>
                  {p.name}
                </span>
              }
              hint={p.hint}
            >
              <Textarea
                rows={2}
                value={story[p.key]}
                disabled={!hydrated}
                onChange={(e) => write(p.key, e.target.value)}
                className="min-h-20"
              />
            </Field>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton
            title="my STAR stories"
            kind="markdown"
            filename="my-star-stories.md"
            label="Save my stories"
            disabled={started === 0}
            build={() =>
              labToMarkdown(
                "My STAR stories",
                themes.flatMap((t) => {
                  const s = value[slugTheme(t.theme)];
                  if (!s) return [];
                  return PARTS.map((p) => ({ label: `${t.theme} · ${p.name}`, body: s[p.key] }));
                }),
              )
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearStory}
            disabled={!isStarted(value[activeSlug])}
            icon={<Icon name="rotate-ccw" size={14} />}
          >
            Clear this story
          </Button>
          <p role="status" className="text-small text-ink-faint" suppressHydrationWarning>
            {hydrated ? `${started} of ${themes.length} stories started.` : " "} Saved in this
            browser only.
          </p>
        </div>
      </div>

      <aside className="rounded-lg border border-line bg-band p-5">
        <Text size="caption" tone="faint" className="uppercase tracking-wider">
          How to use this
        </Text>
        <ol className="mt-4 flex flex-col gap-4">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="font-display text-xl leading-none text-line-strong">0{s.n}</span>
              <div>
                <Text size="small" tone="ink" className="font-medium">
                  {s.title}
                </Text>
                <Text size="small" className="mt-1">
                  {s.desc}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
