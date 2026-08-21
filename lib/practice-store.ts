/**
 * The practice layer's localStorage namespace (spec §5.2b, §12).
 *
 * Six independent slots under `hfph.practice.*`. Independent because a quota
 * error or a corrupt write in one feature must never cost the visitor their
 * journal, and because the pre-paint reader script (app/layout.tsx) has to
 * parse the reader slot before anything else on the page runs.
 *
 * Every parser is total: it keeps the entries it recognises, drops the ones it
 * does not, and returns the empty value rather than throwing. Nothing here
 * reads or writes outside these six keys, and nothing here touches the
 * `hfph.path.v1` key that `lib/path-context.tsx` owns.
 */

import { isIsoDate, type IsoDate } from "./dates";
import { parseSchedule, type Schedule } from "./leitner";

export const PRACTICE_KEYS = {
  quiz: "hfph.practice.quiz.v1",
  deck: "hfph.practice.deck.v1",
  journal: "hfph.practice.journal.v1",
  reader: "hfph.practice.reader.v1",
  planDays: "hfph.practice.plan-days.v1",
  timer: "hfph.practice.timer.v1",
} as const;

/** `null` means absent, unreadable, or not JSON — all the same to a caller. */
export function readSlot<T>(key: string, parse: (raw: unknown) => T): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return parse(JSON.parse(raw) as unknown);
  } catch {
    // Invalid JSON, private mode, or a blocked-storage SecurityError. A failed
    // read must never break a render.
    return null;
  }
}

export function writeSlot(key: string, value: unknown): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled. Losing the write is acceptable;
    // throwing during an event handler is not.
  }
}

export function clearSlot(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* storage disabled */
  }
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

function scheduleMap(raw: unknown): Record<string, Schedule> {
  if (!isRecord(raw)) return {};
  const out: Record<string, Schedule> = {};
  for (const [id, value] of Object.entries(raw)) {
    const entry = parseSchedule(value);
    if (entry) out[id] = entry;
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Quiz                                                             */
/* ---------------------------------------------------------------- */

export type QuizRun = { score: number; total: number; taken: IsoDate };
export type QuizState = {
  /** Leitner schedule per question id from data/practice.json. */
  questions: Record<string, Schedule>;
  /** The last run of each route's three questions. */
  routes: Record<string, QuizRun>;
};

export const EMPTY_QUIZ: QuizState = { questions: {}, routes: {} };

export function parseQuizState(raw: unknown): QuizState {
  if (!isRecord(raw)) return EMPTY_QUIZ;
  const routes: Record<string, QuizRun> = {};
  if (isRecord(raw.routes)) {
    for (const [route, value] of Object.entries(raw.routes)) {
      if (!isRecord(value)) continue;
      if (typeof value.score !== "number" || typeof value.total !== "number") continue;
      if (!isIsoDate(value.taken)) continue;
      routes[route] = { score: value.score, total: value.total, taken: value.taken };
    }
  }
  return { questions: scheduleMap(raw.questions), routes };
}

/* ---------------------------------------------------------------- */
/*  Decks                                                            */
/* ---------------------------------------------------------------- */

export type DeckState = { cards: Record<string, Schedule> };

export const EMPTY_DECK: DeckState = { cards: {} };

export function parseDeckState(raw: unknown): DeckState {
  if (!isRecord(raw)) return EMPTY_DECK;
  return { cards: scheduleMap(raw.cards) };
}

/* ---------------------------------------------------------------- */
/*  Journal                                                          */
/* ---------------------------------------------------------------- */

export type JournalEntry = { text: string; updated: IsoDate };
export type JournalState = Record<string, JournalEntry>;

export const EMPTY_JOURNAL: JournalState = {};

const ISO_WEEK_KEY = /^\d{4}-W\d{2}$/;

export function parseJournalState(raw: unknown): JournalState {
  if (!isRecord(raw)) return EMPTY_JOURNAL;
  const out: JournalState = {};
  for (const [week, value] of Object.entries(raw)) {
    if (!ISO_WEEK_KEY.test(week) || !isRecord(value)) continue;
    if (typeof value.text !== "string" || !isIsoDate(value.updated)) continue;
    out[week] = { text: value.text, updated: value.updated };
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Reader preferences                                               */
/* ---------------------------------------------------------------- */

export type FontSize = "sm" | "md" | "lg";
export type ReaderPrefs = { size: FontSize; comfort: boolean; lowData: boolean };

export const DEFAULT_READER: ReaderPrefs = { size: "md", comfort: false, lowData: false };

const FONT_SIZES: readonly FontSize[] = ["sm", "md", "lg"];

export function parseReaderPrefs(raw: unknown): ReaderPrefs {
  if (!isRecord(raw)) return DEFAULT_READER;
  return {
    size: FONT_SIZES.includes(raw.size as FontSize) ? (raw.size as FontSize) : DEFAULT_READER.size,
    comfort: raw.comfort === true,
    lowData: raw.lowData === true,
  };
}

/* ---------------------------------------------------------------- */
/*  Plan-day completion dates                                        */
/* ---------------------------------------------------------------- */

/**
 * `lib/path-context.tsx` stores plan-day completion as `Record<number, boolean>`
 * with no dates, and this phase does not change it. The dates live here,
 * written by `usePlanDays()`, so `Streak` has something to count. A day ticked
 * before this map existed simply has no date; the UI says so rather than
 * inventing one.
 */
export type PlanDayDates = Record<number, IsoDate>;

export const EMPTY_PLAN_DAYS: PlanDayDates = {};

export function parsePlanDayDates(raw: unknown): PlanDayDates {
  if (!isRecord(raw)) return EMPTY_PLAN_DAYS;
  const out: PlanDayDates = {};
  for (const [day, value] of Object.entries(raw)) {
    const n = Number(day);
    if (!Number.isInteger(n) || n < 1) continue;
    if (!isIsoDate(value)) continue;
    out[n] = value;
  }
  return out;
}

/* ---------------------------------------------------------------- */
/*  Study timer                                                      */
/* ---------------------------------------------------------------- */

export type TimerPhase = "focus" | "break";

export type TimerState = {
  shape: string;
  phase: TimerPhase;
  /** Epoch ms when the running block ends. Ignored while `paused`. */
  endsAt: number;
  paused: boolean;
  /** Milliseconds left when the block was paused. */
  remainingMs: number;
} | null;

export const EMPTY_TIMER: TimerState = null;

export function parseTimerState(raw: unknown): TimerState {
  if (!isRecord(raw)) return EMPTY_TIMER;
  if (typeof raw.shape !== "string") return EMPTY_TIMER;
  if (raw.phase !== "focus" && raw.phase !== "break") return EMPTY_TIMER;
  if (typeof raw.endsAt !== "number" || !Number.isFinite(raw.endsAt)) return EMPTY_TIMER;
  if (typeof raw.paused !== "boolean") return EMPTY_TIMER;
  if (typeof raw.remainingMs !== "number" || !Number.isFinite(raw.remainingMs)) return EMPTY_TIMER;
  return {
    shape: raw.shape,
    phase: raw.phase,
    endsAt: raw.endsAt,
    paused: raw.paused,
    remainingMs: raw.remainingMs,
  };
}
