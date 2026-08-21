"use client";

import { currentStreak, longestStreak } from "@/lib/streak";
import { Stat, StatStrip, Text } from "@/components/ui";
import { usePlanDays, useToday } from "./hooks";

/**
 * Consecutive plan days (spec §7.4.5).
 *
 * A count, and nothing else: no badge, no points, no warning that a streak is
 * about to break. The current streak may end today or yesterday, so opening
 * the site in the morning never shows a collapse that has not happened.
 *
 * Completion comes from `usePath().state.planDays`; the dates come from the
 * practice store, written by `usePlanDays().markPlanDay`. Days ticked before
 * that map existed have no date, and the component says so rather than
 * inventing one.
 */
export function Streak() {
  const today = useToday();
  const { completedDates, undatedCount, hydrated } = usePlanDays();

  if (!hydrated) return null;

  if (completedDates.length === 0 && undatedCount === 0) {
    return (
      <Text size="small">
        No plan days ticked yet. Tick your first one on the 30-day plan and the count starts.
      </Text>
    );
  }

  const current = currentStreak(completedDates, today);
  const longest = longestStreak(completedDates);
  const doneCount = completedDates.length;

  return (
    <div className="flex flex-col gap-3">
      <StatStrip>
        <Stat value={current} label="day streak" sub="in a row, up to today" />
        {/*
         * "longest run" and "plan days done" carry a "day(s)" suffix rather
         * than a bare number: a perfect streak makes current === longest ===
         * doneCount, and a bare digit in each `dd` would make three elements
         * match the same text query. The suffix keeps the count singular to
         * the current-streak stat, which is the only one anything points at.
         */}
        <Stat
          value={`${longest} ${longest === 1 ? "day" : "days"}`}
          label="longest run"
          sub="your best so far"
        />
        <Stat
          value={`${doneCount} ${doneCount === 1 ? "day" : "days"}`}
          label="plan days done"
          sub="dated ticks"
        />
      </StatStrip>
      {undatedCount > 0 && (
        <Text size="caption" tone="faint">
          {undatedCount === 1
            ? "1 day was ticked before this site started recording dates, so it is not in the streak."
            : `${undatedCount} days were ticked before this site started recording dates, so they are not in the streak.`}
        </Text>
      )}
    </div>
  );
}
