"use client";

import { useId, useState } from "react";
import {
  REGIONS,
  TZ_SOURCE,
  formatHour,
  offsetFor,
  overlap,
  type HourWindow,
} from "@/lib/overlap";
import { Badge, Field, Heading, ProgressBar, Range, Select, Source, Text } from "@/components/ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Overlap hours between the visitor's working window and each client region
 * (spec §7.4.6).
 *
 * The month matters because half of these regions move their clocks. The city
 * is named on every row because a region is not a time zone: New York and Los
 * Angeles are three hours apart, and a number that hides that is a worse
 * answer than a number that admits it.
 */
export function TimezoneOverlap() {
  const baseId = useId();
  const [start, setStart] = useState(9);
  const [length, setLength] = useState(8);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const mine: HourWindow = { start, end: Math.min(start + length, 24) };

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-2">
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          Your hours against theirs
        </Heading>
        <Text>
          Set the window you are willing to work in Manila time. The number on each row is how many
          of those hours land inside a 9-to-5 day in that region.
        </Text>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Your day starts" hint={formatHour(start)}>
          <Range
            min={0}
            max={23}
            step={1}
            value={start}
            onChange={(event) => setStart(Number(event.target.value))}
          />
        </Field>
        <Field label="Hours you work" hint={`${length} hours`}>
          <Range
            min={1}
            max={14}
            step={1}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
          />
        </Field>
        <Field label="Month">
          <Select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Text size="small" tone="ink">
        Your window: {formatHour(mine.start)} to {formatHour(mine.end)}, Manila time.
      </Text>

      <ul className="flex flex-col gap-4">
        {REGIONS.map((region) => {
          const result = overlap(region, month, mine);
          const offset = offsetFor(region, month);
          const sign = offset >= 0 ? "+" : "−";
          return (
            <li
              key={region.id}
              data-testid="overlap-row"
              className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-base font-medium text-ink">
                  {region.name} — measured at {region.city}
                </span>
                <Badge tone={result.hours >= 4 ? "verified" : result.hours > 0 ? "caution" : "neutral"}>
                  <span data-testid="overlap-hours">{result.hours}</span>
                  &nbsp;overlap {result.hours === 1 ? "hour" : "hours"}
                </Badge>
              </div>
              <ProgressBar
                value={result.hours}
                max={Math.max(1, mine.end - mine.start)}
                label="Hours that overlap your working window"
                hideLabel
                tone={result.hours >= 4 ? "verified" : "caution"}
              />
              <Text size="caption" tone="faint">
                UTC{sign}
                {Math.abs(offset)} this month. Their 9-to-5 is{" "}
                {result.windows
                  .map((window) => `${formatHour(window.start)}–${formatHour(window.end)}`)
                  .join(" and ")}{" "}
                for you.
              </Text>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <Text size="caption">
          One city stands in for each region, so a client on the US west coast sits three hours
          further from you than this row shows. Treat the number as a planning estimate and confirm
          the hours before you accept a role.
        </Text>
        <Source label={TZ_SOURCE.label} url={TZ_SOURCE.url} />
      </div>
    </section>
  );
}
