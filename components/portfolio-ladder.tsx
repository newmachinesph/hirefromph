"use client";

import { useEffect, useState } from "react";
import tracks from "@/data/tracks.json";
import portfolio from "@/data/portfolio.json";
import { usePracticeSlot } from "@/components/practice/hooks";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { CardGrid } from "@/components/layout";
import { accent } from "@/lib/accent";
import { usePath } from "@/lib/path-context";
import {
  EMPTY_PORTFOLIO,
  PRACTICE_KEYS,
  parsePortfolioState,
  type PortfolioState,
} from "@/lib/practice-store";
import { cn } from "@/lib/utils";

/** Tier -> badge tone. One rung per column: Start (get in), Level up, Pro (differentiate). */
const TIER_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Start: "verified",
  "Level up": "caution",
  Pro: "signal",
};

type Entry = (typeof portfolio.tracks)[number];
type Rung = Entry["ladder"][number];
type TrackMeta = (typeof tracks.tracks)[number];

/** Join by id so track name/icon/accent stay single-sourced in tracks.json. */
const trackById = Object.fromEntries(tracks.tracks.map((t) => [t.id, t]));

/** Every ladder whose track still exists, in authored order. */
const ENTRIES = portfolio.tracks
  .map((entry) => ({ entry, meta: trackById[entry.id] as TrackMeta | undefined }))
  .filter((x): x is { entry: Entry; meta: TrackMeta } => x.meta !== undefined);

export const rungKey = (trackId: string, tier: string) => `${trackId}:${tier}`;

function RungCard({
  trackId,
  rung,
  soft,
  done,
  onToggle,
}: {
  trackId: string;
  rung: Rung;
  soft: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <Card onBand>
      <Badge tone={TIER_TONE[rung.tier] ?? "neutral"}>{rung.tier}</Badge>
      <Text size="small" className="mt-3">
        {rung.goal}
      </Text>

      <ul className="mt-5 flex flex-1 flex-col gap-3 border-t border-line pt-4">
        {rung.tools.map((tool) => (
          <li key={tool.name}>
            <div className="flex items-center justify-between gap-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary"
              >
                {tool.name}
                <Icon name="arrow-up-right" size={13} className="text-ink-faint" />
              </a>
              <Badge>{tool.free}</Badge>
            </div>
            <Text size="caption" tone="faint" className="mt-0.5">
              {tool.what}
            </Text>
          </li>
        ))}
      </ul>

      <div className={cn("mt-5 flex items-start gap-2 rounded-sm border p-3", soft)}>
        <Icon name="target" size={14} className="mt-0.5 shrink-0" />
        <Text size="caption" tone="inherit" as="span">
          <span className="font-semibold">Portfolio piece: </span>
          {rung.piece}
        </Text>
      </div>
      <Checkbox
        className="mt-2"
        checked={done}
        onChange={onToggle}
        aria-label={`Done: ${rung.tier} rung, ${trackId}`}
        label={<span className="text-small">{done ? "Built it" : "Mark this piece built"}</span>}
      />
    </Card>
  );
}

function Ladder({
  entry,
  meta,
  done,
  onToggle,
  lead = false,
}: {
  entry: Entry;
  meta: TrackMeta;
  done: PortfolioState;
  onToggle: (key: string) => void;
  lead?: boolean;
}) {
  const a = accent(meta.accent);
  return (
    <div id={entry.id} className="scroll-mt-24">
      <div className="flex items-center gap-4">
        <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-md border", a.soft)}>
          <Icon name={meta.icon} size={22} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={3} size="h4">
              {meta.name}
            </Heading>
            {lead && <Badge tone="verified">Your niche</Badge>}
          </div>
          <Text size="small">{meta.tagline}</Text>
        </div>
      </div>

      <CardGrid cols={3} className="mt-6">
        {entry.ladder.map((rung) => {
          const key = rungKey(entry.id, rung.tier);
          return (
            <RungCard
              key={rung.tier}
              trackId={meta.name}
              rung={rung}
              soft={a.soft}
              done={done[key] === true}
              onToggle={() => onToggle(key)}
            />
          );
        })}
      </CardGrid>
    </div>
  );
}

/**
 * The 22 ladders with the visitor's chosen niche first. The chips pick which
 * ladder leads; the rest sit behind "Show all niches", still in the DOM.
 */
export function PortfolioLadder() {
  const { state, hydrated } = usePath();
  const [picked, setPicked] = useState<string | null>(null);
  const { value: done, set } = usePracticeSlot(
    PRACTICE_KEYS.portfolio,
    EMPTY_PORTFOLIO,
    parsePortfolioState,
  );

  const chosen = hydrated && state.track && trackById[state.track] ? state.track : null;
  const leadId = picked ?? chosen;
  const lead = ENTRIES.find((x) => x.entry.id === leadId) ?? null;
  const rest = ENTRIES.filter((x) => x.entry.id !== leadId);

  useEffect(() => {
    if (picked) document.getElementById(picked)?.scrollIntoView({ block: "start" });
  }, [picked]);

  function toggle(key: string) {
    set((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }

  return (
    <div className="mt-12 flex flex-col gap-10">
      {lead ? (
        <Ladder
          entry={lead.entry}
          meta={lead.meta}
          done={done}
          onToggle={toggle}
          lead={lead.entry.id === chosen}
        />
      ) : (
        <Callout tone="signal" className="max-w-2xl">
          <Text size="small" tone="inherit">
            Choose a niche and its ladder will sit here, first, every time you come back.
          </Text>
          <div className="mt-4">
            <Button href="/niches" variant="outline" size="sm">
              Pick your niche
            </Button>
          </div>
        </Callout>
      )}

      <nav aria-label="Jump to a niche">
        <Text size="caption" tone="faint">
          All {ENTRIES.length} niches
        </Text>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ENTRIES.map(({ entry, meta }) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={entry.id === leadId ? "true" : undefined}
                onClick={() => setPicked(entry.id)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-pill border px-3 text-small transition-colors duration-150 ease-out",
                  entry.id === leadId
                    ? "border-ink bg-ink text-on-navy"
                    : "border-line-strong bg-paper text-ink hover:border-ink",
                )}
              >
                {meta.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Accordion>
        <AccordionItem id="all-niches" title={`Show all niches (${rest.length})`}>
          <div className="flex flex-col gap-16 pt-4">
            {rest.map(({ entry, meta }) => (
              <Ladder key={entry.id} entry={entry} meta={meta} done={done} onToggle={toggle} />
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
