"use client";

import { useId, useState } from "react";
import annotatedData from "@/data/annotated.json";
import { Badge, Button, Callout, Dialog, Heading, Icon, Text } from "@/components/ui";

export type AnnotatedBlock = { id: string; label?: string; text: string };

export type AnnotatedHotspot = {
  block: string;
  n: number;
  title: string;
  why: string;
  rule: string;
};

export type AnnotatedExample = {
  id: string;
  kind: string;
  title: string;
  route: string;
  blocks: AnnotatedBlock[];
  hotspots: AnnotatedHotspot[];
};

/** Renders above every example (spec §7.4.3). */
export const DOCTRINE_NOTE = annotatedData.doctrineNote;

const EXAMPLES = annotatedData.examples as AnnotatedExample[];

export function getExample(id: string): AnnotatedExample | undefined {
  return EXAMPLES.find((example) => example.id === id);
}

/**
 * A worked example with numbered hotspots (spec §7.4.3).
 *
 * A block's notes render with that block, in `n` order, so tab order and
 * reading order are the same thing. Each note is a real button with a spoken
 * name ("Note 3: …") rather than a bare numeral.
 */
export function Annotated({ exampleId }: { exampleId: string }) {
  const baseId = useId();
  const example = getExample(exampleId);
  const [openNote, setOpenNote] = useState<number | null>(null);

  if (!example) return null;

  const active = example.hotspots.find((hotspot) => hotspot.n === openNote);

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-6">
      <Callout tone="info" icon="scan-eye" title="How to use this">
        {DOCTRINE_NOTE}
      </Callout>

      <div className="flex flex-col gap-2">
        <Badge tone="neutral" variant="outline">
          {example.kind}
        </Badge>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          {example.title}
        </Heading>
        <Text size="small">
          The numbered notes say why each part exists and the rule it follows. Open one, then close
          it and write your own.
        </Text>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6">
        {example.blocks.map((block) => {
          const notes = example.hotspots
            .filter((hotspot) => hotspot.block === block.id)
            .sort((a, b) => a.n - b.n);
          return (
            <div
              key={block.id}
              className="flex flex-col gap-2 border-b border-line pb-5 last:border-0 last:pb-0"
            >
              {block.label && <p className="text-kicker uppercase text-ink-faint">{block.label}</p>}
              <p className="whitespace-pre-line text-base leading-relaxed text-ink">{block.text}</p>
              {notes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {notes.map((hotspot) => (
                    <button
                      key={hotspot.n}
                      type="button"
                      data-testid="hotspot"
                      aria-label={`Note ${hotspot.n}: ${hotspot.title}`}
                      onClick={() => setOpenNote(hotspot.n)}
                      className="grid h-8 w-8 place-items-center rounded-pill border border-primary bg-primary-tint text-small font-semibold text-primary-deep transition-colors duration-150 ease-out hover:bg-primary hover:text-white"
                    >
                      {hotspot.n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <Button
          href={example.route}
          variant="link"
          iconEnd={<Icon name="arrow-up-right" size={14} />}
        >
          Open the guide that teaches this
        </Button>
      </div>

      <Dialog
        open={active !== undefined}
        onClose={() => setOpenNote(null)}
        title={active ? `Note ${active.n}: ${active.title}` : "Note"}
        size="sm"
      >
        {active && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-kicker uppercase text-ink-faint">Why it exists</p>
              <Text tone="ink">{active.why}</Text>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-kicker uppercase text-ink-faint">The rule</p>
              <Text tone="ink">{active.rule}</Text>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
