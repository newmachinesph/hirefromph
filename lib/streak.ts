/**
 * Streaks over plan-day completion dates (spec §7.4.5).
 *
 * A streak here is a fact, not a game: the number of consecutive days on which
 * the visitor ticked at least one plan day. No badges, no points, no warning
 * that a streak is "about to break" — the site says the number and stops.
 *
 * The current streak is allowed to end *yesterday* as well as today, so a
 * visitor who has not opened the site yet this morning does not see their
 * count collapse to zero before the day is over.
 */

import { addDays, daysBetween, isIsoDate, type IsoDate } from "./dates";

export function uniqueDates(completedDates: readonly string[]): IsoDate[] {
  return [...new Set(completedDates.filter(isIsoDate))].sort();
}

export function currentStreak(completedDates: readonly string[], today: IsoDate): number {
  const days = new Set(uniqueDates(completedDates));
  if (days.size === 0) return 0;

  const yesterday = addDays(today, -1);
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  if (cursor === null) return 0;

  let run = 0;
  while (days.has(cursor)) {
    run += 1;
    cursor = addDays(cursor, -1);
  }
  return run;
}

export function longestStreak(completedDates: readonly string[]): number {
  const days = uniqueDates(completedDates);
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}
