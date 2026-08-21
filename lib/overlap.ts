/**
 * Overlap hours between a Philippine working window and a client region
 * (spec §7.4.6).
 *
 * The model is deliberately coarse and says so in the UI: one representative
 * city per region, DST resolved at month granularity. A region spans several
 * zones — "United States" here is New York, and the Pacific coast is three
 * hours further from Manila — so the number is a planning estimate, not a
 * booking system. Everything is whole hours; nowhere in this tool is a
 * half-hour offset (India, parts of Australia) in scope.
 *
 * Pure: the month is always passed in.
 */

/** Philippine Standard Time. No DST, and none since 1978. */
export const PH_OFFSET = 8;

export type Region = {
  id: string;
  /** Matches data/markets.json → regions.items[].name exactly. */
  name: string;
  /** The city the offset belongs to, named in the UI so the estimate is honest. */
  city: string;
  /** Standard-time UTC offset of `city`, in whole hours. */
  baseOffset: number;
  /** 1-based months on which `city` is on summer time. */
  dstMonths: readonly number[];
  /** Hours the clock moves forward during those months. */
  dstShift: number;
};

export const REGIONS: readonly Region[] = [
  {
    id: "us",
    name: "United States",
    city: "New York",
    baseOffset: -5,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    dstShift: 1,
  },
  {
    id: "uk-eu",
    name: "United Kingdom & Europe",
    city: "London",
    baseOffset: 0,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    dstShift: 1,
  },
  {
    id: "anz",
    name: "Australia & New Zealand",
    city: "Sydney",
    baseOffset: 10,
    dstMonths: [10, 11, 12, 1, 2, 3, 4],
    dstShift: 1,
  },
  {
    id: "middle-east",
    name: "Middle East",
    city: "Dubai",
    baseOffset: 4,
    dstMonths: [],
    dstShift: 0,
  },
  {
    id: "canada",
    name: "Canada",
    city: "Toronto",
    baseOffset: -5,
    dstMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    dstShift: 1,
  },
  {
    id: "asia",
    name: "Singapore, Hong Kong & regional Asia",
    city: "Singapore",
    baseOffset: 8,
    dstMonths: [],
    dstShift: 0,
  },
];

/** Offsets and DST rules come from the IANA time-zone database. */
export const TZ_SOURCE = {
  label: "IANA Time Zone Database",
  url: "https://www.iana.org/time-zones",
};

export type HourWindow = { start: number; end: number };

export function offsetFor(region: Region, month: number): number {
  return region.dstMonths.includes(month)
    ? region.baseOffset + region.dstShift
    : region.baseOffset;
}

/**
 * The same wall-clock window seen from Manila. A window that crosses PH
 * midnight comes back as two intervals so `intersectHours` stays trivial.
 */
export function toPhWindows(window: HourWindow, offset: number): HourWindow[] {
  const shift = PH_OFFSET - offset;
  const start = window.start + shift;
  const end = window.end + shift;

  const wrapped = ((start % 24) + 24) % 24;
  const length = end - start;
  const first = { start: wrapped, end: Math.min(wrapped + length, 24) };
  const spill = wrapped + length - 24;

  if (spill <= 0) return [first];
  return [first, { start: 0, end: Math.min(spill, 24) }];
}

export function intersectHours(mine: HourWindow, theirs: readonly HourWindow[]): number {
  return theirs.reduce((total, window) => {
    const start = Math.max(mine.start, window.start);
    const end = Math.min(mine.end, window.end);
    return total + Math.max(0, end - start);
  }, 0);
}

export function overlap(
  region: Region,
  month: number,
  mine: HourWindow,
  theirs: HourWindow = { start: 9, end: 17 },
): { hours: number; windows: HourWindow[]; offset: number } {
  const offset = offsetFor(region, month);
  const windows = toPhWindows(theirs, offset);
  return { hours: intersectHours(mine, windows), windows, offset };
}

export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return "12mn";
  if (h === 12) return "12nn";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}
