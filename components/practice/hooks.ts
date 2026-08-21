"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import reflectionData from "@/data/reflection.json";
import { isoWeekKey, todayISO, type IsoDate } from "@/lib/dates";
import { usePath } from "@/lib/path-context";
import {
  DEFAULT_READER,
  EMPTY_JOURNAL,
  EMPTY_PLAN_DAYS,
  PRACTICE_KEYS,
  parseJournalState,
  parsePlanDayDates,
  parseReaderPrefs,
  readSlot,
  writeSlot,
  type JournalEntry,
  type PlanDayDates,
  type ReaderPrefs,
} from "@/lib/practice-store";

/**
 * One localStorage slot as React state.
 *
 * The server and the first client pass both render `empty`, so the markup
 * matches and hydration is clean; the mount effect then swaps in whatever is
 * stored. `parse` must be a module-level function — an inline arrow would
 * change identity on every render and re-run the effect forever.
 */
export function usePracticeSlot<T>(
  key: string,
  empty: T,
  parse: (raw: unknown) => T,
): { value: T; set: (updater: T | ((prev: T) => T)) => void; hydrated: boolean } {
  const [value, setValue] = useState<T>(empty);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef<T>(empty);

  useEffect(() => {
    const stored = readSlot(key, parse);
    if (stored !== null) {
      latest.current = stored;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(stored);
    }
    setHydrated(true);
  }, [key, parse]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const next =
        typeof updater === "function" ? (updater as (prev: T) => T)(latest.current) : updater;
      latest.current = next;
      setValue(next);
      writeSlot(key, next);
    },
    [key],
  );

  return { value, set, hydrated };
}

/** Today's date, read once after mount. `""` on the server so markup matches. */
export function useToday(): IsoDate {
  const [today, setToday] = useState<IsoDate>("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(todayISO());
  }, []);
  return today;
}

/**
 * Plan-day completion with dates.
 *
 * `lib/path-context.tsx` owns whether a day is done; this hook owns *when* it
 * was done, in its own storage slot. `markPlanDay` calls the context's
 * `togglePlanDay` unchanged and records or clears the date alongside it, so
 * nothing about the existing plan state or its storage key moves.
 */
export function usePlanDays(): {
  planDays: Record<number, boolean>;
  dates: PlanDayDates;
  completedDates: IsoDate[];
  undatedCount: number;
  markPlanDay: (n: number) => void;
  hydrated: boolean;
} {
  const { state, hydrated: pathHydrated, togglePlanDay } = usePath();
  const today = useToday();
  const { value: dates, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.planDays,
    EMPTY_PLAN_DAYS,
    parsePlanDayDates,
  );

  const markPlanDay = useCallback(
    (n: number) => {
      const wasDone = state.planDays[n] === true;
      togglePlanDay(n);
      set((prev) => {
        const next = { ...prev };
        if (wasDone) delete next[n];
        else next[n] = todayISO();
        return next;
      });
    },
    [state.planDays, togglePlanDay, set],
  );

  const done = useMemo(
    () =>
      Object.entries(state.planDays)
        .filter(([, isDone]) => isDone)
        .map(([day]) => Number(day)),
    [state.planDays],
  );

  const completedDates = useMemo(
    () => done.map((day) => dates[day]).filter((date): date is IsoDate => Boolean(date)),
    [done, dates],
  );

  return {
    planDays: state.planDays,
    dates,
    completedDates,
    // Days ticked before this map existed. The UI says so rather than
    // inventing a date for them.
    undatedCount: done.length - completedDates.length,
    markPlanDay,
    hydrated: hydrated && pathHydrated && today !== "",
  };
}

const READER_CLASSES = ["text-size-sm", "text-size-md", "text-size-lg"] as const;

function applyReaderClasses(prefs: ReaderPrefs): void {
  const html = document.documentElement;
  for (const className of READER_CLASSES) html.classList.remove(className);
  html.classList.add(`text-size-${prefs.size}`);
  html.classList.toggle("reading-comfort", prefs.comfort);
  html.classList.toggle("low-data", prefs.lowData);
}

/**
 * Reader preferences plus the three `<html>` classes they drive. The pre-paint
 * script in `app/layout.tsx` sets the same classes before React runs; this
 * hook is what keeps them in step afterwards.
 */
export function useReaderPrefs(): {
  prefs: ReaderPrefs;
  setPrefs: (next: ReaderPrefs) => void;
  hydrated: boolean;
} {
  const { value, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.reader,
    DEFAULT_READER,
    parseReaderPrefs,
  );

  const setPrefs = useCallback(
    (next: ReaderPrefs) => {
      set(next);
      applyReaderClasses(next);
    },
    [set],
  );

  return { prefs: value, setPrefs, hydrated };
}

const PROMPTS = reflectionData.prompts;

/** One prompt per ISO week, rotating through the twelve (spec §7.4.5). */
export function useJournalWeek(): {
  week: string;
  prompt: string;
  entry: JournalEntry | undefined;
  save: (text: string) => void;
  hydrated: boolean;
} {
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(
    PRACTICE_KEYS.journal,
    EMPTY_JOURNAL,
    parseJournalState,
  );

  const week = today === "" ? "" : isoWeekKey(today);
  const index = today === "" ? 0 : (Number(week.slice(-2)) - 1) % PROMPTS.length;

  const save = useCallback(
    (text: string) => {
      if (today === "") return;
      set((prev) => ({ ...prev, [isoWeekKey(today)]: { text, updated: today } }));
    },
    [set, today],
  );

  return {
    week,
    prompt: PROMPTS[index].prompt,
    entry: week === "" ? undefined : value[week],
    save,
    hydrated: hydrated && today !== "",
  };
}
