/**
 * The five-box Leitner schedule (spec §7.4.1).
 *
 * A card sits in one of five boxes. Answering it from memory moves it up one
 * box; missing it sends it back to box 1. The box decides when it comes back:
 * 1, 2, 4, 8 or 16 days from the day you answered — never from the day it was
 * previously due, so a card you review late is not punished twice.
 *
 * Pure and deterministic: `today` is always passed in.
 */

import { addDays, isIsoDate, type IsoDate } from "./dates";

export type Box = 1 | 2 | 3 | 4 | 5;

export const BOXES: readonly Box[] = [1, 2, 3, 4, 5];

/** Days until the next review, by box. */
export const INTERVALS: Record<Box, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export type Schedule = { box: Box; due: IsoDate };

function clampBox(value: number): Box {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value))) as Box;
}

/**
 * The next schedule for a card. `current` is `undefined` for a card the
 * visitor has never answered; it is treated as box 1, so a first correct
 * answer promotes it to box 2 and brings it back in two days.
 */
export function schedule(
  current: Schedule | undefined,
  correct: boolean,
  today: IsoDate,
): Schedule {
  const box = current ? clampBox(current.box) : 1;
  const next: Box = correct ? clampBox(box + 1) : 1;
  return { box: next, due: addDays(today, INTERVALS[next]) };
}

/** A card with no schedule has never been seen, so it is due. */
export function isDue(entry: Schedule | undefined, today: IsoDate): boolean {
  if (!entry) return true;
  // ISO dates sort lexicographically in calendar order, so no parsing needed.
  return entry.due <= today;
}

export function dueCount(
  entries: Readonly<Record<string, Schedule>>,
  ids: readonly string[],
  today: IsoDate,
): number {
  return ids.filter((id) => isDue(entries[id], today)).length;
}

export function nextDue(entries: readonly Schedule[]): IsoDate | undefined {
  if (entries.length === 0) return undefined;
  return entries.reduce<IsoDate>(
    (earliest, entry) => (entry.due < earliest ? entry.due : earliest),
    entries[0].due,
  );
}

/** Total: anything that is not a valid stored schedule becomes `null`. */
export function parseSchedule(raw: unknown): Schedule | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as { box?: unknown; due?: unknown };
  if (typeof value.box !== "number" || !BOXES.includes(value.box as Box)) return null;
  if (!isIsoDate(value.due)) return null;
  return { box: value.box as Box, due: value.due };
}
