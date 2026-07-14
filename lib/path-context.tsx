"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PathState = {
  /** chosen career track id (a niche) — the "path" the user commits to */
  track: string | null;
  /** current stage 1..4 */
  stage: number;
  /** ISO string when the path was started */
  startedAt: string | null;
  /** 9-step roadmap completion */
  steps: Record<number, boolean>;
  /** 30-day plan day completion */
  planDays: Record<number, boolean>;
  /** equipment ids the user already owns */
  equipment: Record<string, boolean>;
  /** saved wizard answers for the plan */
  planAnswers: Record<string, string>;
};

const EMPTY: PathState = {
  track: null,
  stage: 1,
  startedAt: null,
  steps: {},
  planDays: {},
  equipment: {},
  planAnswers: {},
};

const KEY = "devup.path.v1";

type Ctx = {
  state: PathState;
  hydrated: boolean;
  hasPath: boolean;
  choosePath: (track: string) => void;
  clearPath: () => void;
  setStage: (stage: number) => void;
  toggleStep: (n: number) => void;
  togglePlanDay: (n: number) => void;
  toggleEquipment: (id: string) => void;
  setPlanAnswers: (a: Record<string, string>) => void;
};

const PathContext = createContext<Ctx | null>(null);

export function PathProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PathState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. localStorage cannot be read during the SSR render, so
  // seeding state from it in a mount effect is the only correct option here —
  // it runs exactly once and is what keeps the server and client markup identical.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as PathState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration so we never clobber with EMPTY).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled */
    }
  }, [state, hydrated]);

  const choosePath = useCallback((track: string) => {
    setState((s) => ({
      ...s,
      track,
      startedAt: s.startedAt ?? new Date().toISOString(),
    }));
  }, []);

  const clearPath = useCallback(() => setState(EMPTY), []);
  const setStage = useCallback(
    (stage: number) => setState((s) => ({ ...s, stage })),
    [],
  );
  const toggleStep = useCallback(
    (n: number) =>
      setState((s) => ({ ...s, steps: { ...s.steps, [n]: !s.steps[n] } })),
    [],
  );
  const togglePlanDay = useCallback(
    (n: number) =>
      setState((s) => ({
        ...s,
        planDays: { ...s.planDays, [n]: !s.planDays[n] },
      })),
    [],
  );
  const toggleEquipment = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        equipment: { ...s.equipment, [id]: !s.equipment[id] },
      })),
    [],
  );
  const setPlanAnswers = useCallback(
    (a: Record<string, string>) =>
      setState((s) => ({ ...s, planAnswers: a })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      hasPath: state.track !== null,
      choosePath,
      clearPath,
      setStage,
      toggleStep,
      togglePlanDay,
      toggleEquipment,
      setPlanAnswers,
    }),
    [
      state,
      hydrated,
      choosePath,
      clearPath,
      setStage,
      toggleStep,
      togglePlanDay,
      toggleEquipment,
      setPlanAnswers,
    ],
  );

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function usePath() {
  const ctx = useContext(PathContext);
  if (!ctx) throw new Error("usePath must be used within PathProvider");
  return ctx;
}
