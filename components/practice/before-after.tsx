"use client";

import { Fragment, useId, useState, type KeyboardEvent } from "react";
import annotatedData from "@/data/annotated.json";
import { Badge, Heading, Range, Tab, TabList, TabPanel, Tabs, Text } from "@/components/ui";

const SPLIT_MIN = 20;
const SPLIT_MAX = 80;
const SPLIT_STEP = 1;

export type BeforeAfterPair = {
  id: string;
  route: string;
  title: string;
  before: string;
  after: string;
  changes: { from: string; to: string; why: string }[];
};

const PAIRS = annotatedData.pairs as BeforeAfterPair[];

export function getPair(id: string): BeforeAfterPair | undefined {
  return PAIRS.find((pair) => pair.id === id);
}

/**
 * Split `text` on the first occurrence of each fragment, ordered by where the
 * fragments appear in the text. Pure so it can be tested on its own; the
 * component only turns the result into `<mark>` elements.
 */
export function splitHighlights(
  text: string,
  fragments: readonly string[],
): { text: string; hit: boolean }[] {
  const hits = fragments
    .map((fragment) => ({ fragment, at: text.indexOf(fragment) }))
    .filter((hit) => hit.at >= 0 && hit.fragment.length > 0)
    .sort((a, b) => a.at - b.at);

  const parts: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const { fragment, at } of hits) {
    if (at < cursor) continue; // overlaps a fragment already marked
    if (at > cursor) parts.push({ text: text.slice(cursor, at), hit: false });
    parts.push({ text: fragment, hit: true });
    cursor = at + fragment.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts.length > 0 ? parts : [{ text, hit: false }];
}

function Marked({ text, fragments }: { text: string; fragments: readonly string[] }) {
  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-ink">
      {splitHighlights(text, fragments).map((part, index) => (
        <Fragment key={index}>
          {part.hit ? (
            <mark data-testid="marked" className="rounded-sm bg-caution-tint px-0.5 text-ink">
              {part.text}
            </mark>
          ) : (
            part.text
          )}
        </Fragment>
      ))}
    </p>
  );
}

/**
 * Two versions of the same message (spec §5.2b).
 *
 * Desktop gets a split view whose divider the visitor drags: both texts stay
 * fully readable and only get narrower, which is what makes the comparison
 * work for prose. Small screens get the same two texts as tabs. Both are in
 * the DOM at every width; the breakpoint decides which one is visible.
 */
export function BeforeAfter({ pairId }: { pairId: string }) {
  const baseId = useId();
  const pair = getPair(pairId);
  const [split, setSplit] = useState(50);

  if (!pair) return null;

  const fromFragments = pair.changes.map((change) => change.from);
  const toFragments = pair.changes.map((change) => change.to);

  // jsdom (and by extension @testing-library/user-event) does not implement
  // the browser's native arrow-key stepping for `<input type="range">`, so
  // the keyboard interaction is driven here instead of relying on the UA
  // default. `preventDefault` keeps a real browser's native step from also
  // firing and double-applying the change.
  function onSplitKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setSplit((prev) => Math.min(SPLIT_MAX, prev + SPLIT_STEP));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setSplit((prev) => Math.max(SPLIT_MIN, prev - SPLIT_STEP));
    }
  }

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge tone="neutral" variant="outline">
          Rewrite
        </Badge>
        <Heading level={3} size="h4" id={`${baseId}-title`}>
          {pair.title}
        </Heading>
      </div>

      <div data-testid="split-view" className="hidden flex-col gap-3 lg:flex">
        <div className="grid gap-4" style={{ gridTemplateColumns: `${split}fr ${100 - split}fr` }}>
          <div className="min-w-0 rounded-md border border-line bg-band p-5">
            <p className="text-kicker mb-2 uppercase text-ink-faint">Before</p>
            <Marked text={pair.before} fragments={fromFragments} />
          </div>
          <div className="min-w-0 rounded-md border border-line-strong bg-paper p-5">
            <p className="text-kicker mb-2 uppercase text-ink-faint">After</p>
            <Marked text={pair.after} fragments={toFragments} />
          </div>
        </div>
        <Range
          aria-label="Split between the two versions"
          min={SPLIT_MIN}
          max={SPLIT_MAX}
          step={SPLIT_STEP}
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          onKeyDown={onSplitKeyDown}
          valueLabel={`${split}% before, ${100 - split}% after`}
        />
      </div>

      <div className="lg:hidden">
        <Tabs defaultValue="before">
          <TabList label="The two versions">
            <Tab value="before">Before</Tab>
            <Tab value="after">After</Tab>
          </TabList>
          <TabPanel value="before">
            <div className="mt-4 rounded-md border border-line bg-band p-5">
              <Marked text={pair.before} fragments={fromFragments} />
            </div>
          </TabPanel>
          <TabPanel value="after">
            <div className="mt-4 rounded-md border border-line-strong bg-paper p-5">
              <Marked text={pair.after} fragments={toFragments} />
            </div>
          </TabPanel>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <Heading level={4} size="h5">
          What changed, and why
        </Heading>
        <ul data-testid="change-list" className="flex flex-col gap-4">
          {pair.changes.map((change) => (
            <li key={change.from} className="flex flex-col gap-1 border-l-2 border-line-strong pl-4">
              <Text size="small" tone="faint">
                {change.from}
              </Text>
              <Text size="small" tone="ink">
                {change.to}
              </Text>
              <Text size="small">{change.why}</Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
