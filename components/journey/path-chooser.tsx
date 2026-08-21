"use client";

import { useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ChoiceCard,
  Field,
  Icon,
  Text,
  type BadgeTone,
} from "@/components/ui";
import { isAccent } from "@/lib/accent";
import { track as report } from "@/lib/analytics";
import { usePath } from "@/lib/path-context";
import { featuredTracks } from "@/lib/tracks";
import { cn } from "@/lib/utils";

export type PathChooserProps = {
  /** Drops the tagline so the cards fit a narrow column (the gate, the drawer). */
  compact?: boolean;
  /** Show only the N strongest-demand lanes (spec §8.1.4). Omit for all 22. */
  limit?: number;
  /** Where "see the rest" points. Omit and no link renders. */
  moreHref?: string;
  moreLabel?: string;
  /** Navigate here after a choice is saved. */
  redirectTo?: string;
  onChosen?: (id: string) => void;
  className?: string;
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

export function PathChooser({
  compact = false,
  limit,
  moreHref,
  moreLabel = "See every lane",
  redirectTo,
  onChosen,
  className,
}: PathChooserProps) {
  const { state, choosePath, hydrated } = usePath();
  const router = useRouter();
  // One radio group per instance, so two choosers on a page never fight.
  const groupName = `track-${useId()}`;
  const shown = featuredTracks(limit);

  function pick(id: string) {
    report("path_chosen", { track: id });
    choosePath(id);
    onChosen?.(id);
    if (redirectTo) router.push(redirectTo);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Field as="group" label="Pick your lane" hideLabel>
        <div
          className={cn(
            "grid gap-3",
            compact
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {shown.map((item) => (
            <ChoiceCard
              key={item.id}
              name={groupName}
              value={item.id}
              checked={hydrated && state.track === item.id}
              onChange={pick}
              icon={<Icon name={item.icon} size={22} weight="duotone" />}
              label={item.name}
              description={
                <>
                  {!compact && <span className="block">{item.tagline}</span>}
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{item.pay}</span>
                    <Badge tone={tone(item.accent)}>{item.demandLabel}</Badge>
                  </span>
                </>
              }
            />
          ))}
        </div>
      </Field>

      {shown.length === 0 ? (
        <Text size="small" tone="faint">
          No lanes to show.
        </Text>
      ) : (
        <Text size="caption" tone="faint">
          Pay bands are vendor estimates. See the{" "}
          <Link href="/salary" className="text-primary underline underline-offset-2">
            Salary Guide
          </Link>{" "}
          for sources.
        </Text>
      )}

      {moreHref && (
        <div>
          <Button
            href={moreHref}
            variant="link"
            iconEnd={<Icon name="arrow-right" size={16} />}
          >
            {moreLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
