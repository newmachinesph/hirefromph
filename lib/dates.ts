/**
 * Calendar-date helpers for the practice layer.
 *
 * Every date the practice layer stores is an ISO `YYYY-MM-DD` string in the
 * visitor's own calendar (spec §12). Every function here is pure: the date is
 * always an argument, never read from the clock, so schedules, streaks and
 * exports are deterministic and testable. `todayISO()` is the single place the
 * clock is read; callers read it once and pass the result down.
 *
 * Arithmetic runs at UTC midnight so a DST transition can never shift a
 * calendar date by a day. `todayISO()` deliberately uses the *local* getters,
 * because "today" for a visitor in Manila is the date on their wall calendar.
 */

export type IsoDate = string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** UTC-midnight timestamp for a YYYY-MM-DD string. */
export function toUTCms(iso: IsoDate): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
}

export function fromUTCms(ms: number): IsoDate {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Shape check plus a round-trip, so an impossible date such as "2026-02-30"
 * (which `Date.UTC` would silently roll into March) is rejected.
 */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  return fromUTCms(toUTCms(value)) === value;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUTCms(toUTCms(iso) + days * DAY_MS);
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUTCms(to) - toUTCms(from)) / DAY_MS);
}

/** The visitor's local calendar date — what a date input control shows. */
export function todayISO(now: Date = new Date()): IsoDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export type IsoWeek = { year: number; week: number };

/**
 * ISO-8601 week number. The Thursday of a week decides which year the week
 * belongs to, which is why 1 Jan 2027 (a Friday) is 2026-W53.
 */
export function isoWeek(iso: IsoDate): IsoWeek {
  const d = new Date(toUTCms(iso));
  const dayIndex = (d.getUTCDay() + 6) % 7; // Monday 0 … Sunday 6
  d.setUTCDate(d.getUTCDate() - dayIndex + 3); // this week's Thursday
  const year = d.getUTCFullYear();

  const jan4 = new Date(Date.UTC(year, 0, 4)); // always in week 1
  const jan4Index = (jan4.getUTCDay() + 6) % 7;
  jan4.setUTCDate(jan4.getUTCDate() - jan4Index + 3); // week 1's Thursday

  const week = 1 + Math.round((d.getTime() - jan4.getTime()) / (7 * DAY_MS));
  return { year, week };
}

export function isoWeekKey(iso: IsoDate): string {
  const { year, week } = isoWeek(iso);
  return `${year}-W${pad(week)}`;
}

/**
 * "23 Aug 2026". Built by hand rather than through `toLocaleDateString` so the
 * server and the client always produce the same string — a locale mismatch
 * here would be a hydration error on every page that shows a due date.
 */
export function formatIsoDate(iso: IsoDate): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m || 1) - 1]} ${y}`;
}
