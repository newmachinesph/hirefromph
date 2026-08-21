"use client";

import { useState, type ReactNode } from "react";
import { Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { usePath } from "@/lib/path-context";
import { PathChooser } from "./path-chooser";

export type PathGateProps = {
  children: ReactNode;
  title?: string;
  teaser?: string;
  /** What the visitor unlocks, e.g. "the vetted list matched to your niche". */
  unlocks?: string;
};

/**
 * Gates deep content behind a one-click path choice. Before a choice: an
 * invitation with an inline chooser. After: the content renders untouched.
 *
 * During SSR and the first client render `hydrated` is false, so the locked
 * state is what both sides produce and nothing flashes.
 */
export function PathGate({ children, title, teaser, unlocks }: PathGateProps) {
  const { hasPath, hydrated } = usePath();
  const [expanded, setExpanded] = useState(false);

  if (hydrated && hasPath) return <>{children}</>;

  return (
    <Card padding="lg">
      <div className="flex flex-col items-start gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-tint text-primary-deep">
          <Icon name="key-round" size={22} weight="duotone" />
        </span>

        <Heading level={3} size="h4" balance>
          {title ?? "Choose your path to open this section"}
        </Heading>

        <Text>
          {teaser ?? "Pick the lane you are heading toward and this section fills in for it."}
        </Text>

        {unlocks && (
          <Callout tone="neutral" title="What opens">
            {unlocks}
          </Callout>
        )}

        {expanded ? (
          <div className="w-full">
            <Text size="small" tone="faint">
              Pick one. You can change it later on your dashboard.
            </Text>
            <PathChooser compact limit={6} moreHref="/niches" moreLabel="See all 22 niches" />
          </div>
        ) : (
          <Button
            onClick={() => setExpanded(true)}
            variant="primary"
            iconEnd={<Icon name="arrow-right" size={16} />}
          >
            Choose my path
          </Button>
        )}
      </div>
    </Card>
  );
}
