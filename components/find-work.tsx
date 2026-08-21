"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import apply from "@/data/apply.json";
import findwork from "@/data/findwork.json";
import { PathGate } from "@/components/journey";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Icon,
  Input,
} from "@/components/ui";
import { Container } from "@/components/layout";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/** How many directory entries show ungated, as a taste, before the path is chosen. */
const TASTE_COUNT = 6;

/** Checked weight at/above this total is a hard stop, even without a single weight-3 flag. */
const STOP_SCORE_THRESHOLD = 4;
/** Any single checked flag at this weight is an instant hard stop, regardless of total. */
const INSTANT_STOP_WEIGHT = 3;

type Entry = (typeof apply.entries)[number];
type RedFlag = (typeof findwork.vetting.redFlags)[number];
type Verdict = "clear" | "caution" | "stop";

const verdictCopy: Record<
  Verdict,
  {
    title: string;
    body: string;
    tone: "verified" | "caution" | "signal";
    icon: string;
  }
> = {
  clear: {
    title: "No red flags checked, still verify independently.",
    body: "A clean checklist isn't proof by itself. Run the research steps below before you commit to anything.",
    tone: "verified",
    icon: "shield-check",
  },
  caution: {
    title: "Proceed with caution.",
    body: "One or two flags aren't always fatal on their own, but they're a reason to slow down and ask more questions before you commit.",
    tone: "caution",
    icon: "shield-alert",
  },
  stop: {
    title: "STOP. Walk away.",
    body: "This one has crossed the line. No fee, no rate, and no urgency is worth what happens next.",
    tone: "signal",
    icon: "octagon-alert",
  },
};

/**
 * "Is this opportunity legit?" scorer. Checking a red flag adds its weight
 * to a live score; any weight-3 flag is an immediate hard stop regardless
 * of the total. Local state only, deliberately not tied to path-context,
 * since this is a one-off check, not a saved profile.
 */
export function VettingTool() {
  const redFlags: RedFlag[] = findwork.vetting.redFlags;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const checkedFlags = redFlags.filter((f) => checked[f.id]);
  const score = checkedFlags.reduce((sum, f) => sum + f.weight, 0);
  const hasInstantStop = checkedFlags.some(
    (f) => f.weight >= INSTANT_STOP_WEIGHT,
  );
  const verdict: Verdict = hasInstantStop || score >= STOP_SCORE_THRESHOLD
    ? "stop"
    : score === 0
      ? "clear"
      : "caution";

  const { title, body, tone, icon: verdictIcon } = verdictCopy[verdict];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <Field as="group" label="Check every box that describes this opportunity" hideLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          {redFlags.map((flag) => {
            const isChecked = !!checked[flag.id];
            const whyId = `flag-why-${flag.id}`;
            return (
              <Card
                key={flag.id}
                padding="sm"
                className={cn(isChecked && "border-coral bg-coral-tint")}
              >
                <Checkbox
                  id={`flag-${flag.id}`}
                  checked={isChecked}
                  onChange={() => toggle(flag.id)}
                  aria-describedby={whyId}
                  label={
                    <span className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2 text-small font-semibold text-ink">
                        {flag.flag}
                        {flag.weight >= INSTANT_STOP_WEIGHT && (
                          <Badge tone="coral">Instant stop</Badge>
                        )}
                      </span>
                      <span id={whyId} className="text-caption leading-relaxed text-ink-soft">
                        {flag.why}
                      </span>
                    </span>
                  }
                />
              </Card>
            );
          })}
        </div>
      </Field>

      <aside className="rounded-md border border-line bg-paper p-6 lg:sticky lg:top-24">
        <p className="kicker">Live verdict</p>
        <div role="status" aria-live="polite" className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={verdict}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col gap-3 rounded-sm border p-5",
                accent(tone).soft,
              )}
            >
              <Icon name={verdictIcon} size={26} />
              <p className="font-display text-lg leading-tight">{title}</p>
              <p className="text-xs leading-relaxed opacity-90">{body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          {checkedFlags.length} flag{checkedFlags.length === 1 ? "" : "s"}{" "}
          checked
        </p>
      </aside>
    </div>
  );
}

/**
 * The apply.json directory, reframed as study material: filter + search the
 * same 150+ real entries, gated behind a chosen path like before. This is a
 * seed list to study and extract patterns from, not the point of the page.
 */
export function FindWorkDirectory() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apply.entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!q) return true;
      const haystack = [entry.name, entry.blurb, ...entry.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [category, query]);

  const taste = filtered.slice(0, TASTE_COUNT);
  const rest = filtered.slice(TASTE_COUNT);

  return (
    <Container>
      <div className="pb-20 lg:pb-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by category"
          >
            <Button
              size="sm"
              variant={category === "all" ? "primary" : "outline"}
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              All
            </Button>
            {apply.categories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={category === c.id ? "primary" : "outline"}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <Field label="Search the directory" hideLabel className="w-full sm:w-72">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag, niche…"
            />
          </Field>
        </div>

        <p className="mt-5 text-sm text-ink-faint" aria-live="polite">
          Studying <span className="font-semibold text-ink">{taste.length}</span>{" "}
          of {apply.entries.length}, extract the pattern, don&rsquo;t just click
        </p>

        <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {taste.map((entry) => (
              <EntryCard key={entry.name} entry={entry} />
            ))}
          </AnimatePresence>
        </motion.div>

        {rest.length > 0 && (
          <div className="mt-5">
            <PathGate unlocks="the full study set of vetted places matched to your niche">
              <motion.div
                layout
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {rest.map((entry) => (
                    <EntryCard key={entry.name} entry={entry} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </PathGate>
          </div>
        )}

        {filtered.length === 0 && (
          <EmptyState
            className="mt-10"
            icon="search"
            title="No matches"
            body="Try a different category or search term."
          />
        )}
      </div>
    </Container>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col rounded-md border border-line bg-paper p-6 transition-colors duration-150 ease-out hover:border-ink hover:bg-band"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg leading-tight">{entry.name}</h3>
        <Badge tone="neutral" className="shrink-0">
          {entry.type}
        </Badge>
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-ink-faint">
        <Icon name="map-pin" size={12} /> {entry.region}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {entry.blurb}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-pill bg-band px-2.5 py-1 text-[11px] font-medium text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal"
      >
        Visit
        <Icon
          name="arrow-up-right"
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </a>
    </motion.div>
  );
}
