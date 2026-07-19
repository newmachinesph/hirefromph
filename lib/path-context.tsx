"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import tracksData from "@/data/tracks.json";

export type AppStatus =
  | "applied"
  | "replied"
  | "interview"
  | "offer"
  | "rejected";

export const APP_STATUSES: AppStatus[] = [
  "applied",
  "replied",
  "interview",
  "offer",
  "rejected",
];

export type Application = {
  id: string;
  company: string;
  role: string;
  source: string;
  link: string;
  status: AppStatus;
  appliedAt: string;
  followUpAt: string;
  notes: string;
};

export type PathState = {
  /** chosen career track id (a niche) — the "path" the user commits to */
  track: string | null;
  /** current stage 1..4 */
  stage: number;
  /** ISO string when the path was started */
  startedAt: string | null;
  /** 11-step roadmap completion */
  steps: Record<number, boolean>;
  /** 30-day plan day completion */
  planDays: Record<number, boolean>;
  /** equipment ids the user already owns */
  equipment: Record<string, boolean>;
  /** saved wizard answers for the plan */
  planAnswers: Record<string, string>;
  /** micro-task ids the user has completed (each one is a portfolio piece) */
  tasks: Record<string, boolean>;
  /** the user's live job-application pipeline */
  applications: Application[];
  /** the integrity oath: clauses accepted, own-words commitment, signature */
  oath: Oath;
};

export type Oath = {
  clauses: Record<string, boolean>;
  commitment: string;
  name: string;
  signedAt: string | null;
};

const EMPTY_OATH: Oath = {
  clauses: {},
  commitment: "",
  name: "",
  signedAt: null,
};

const EMPTY: PathState = {
  track: null,
  stage: 1,
  startedAt: null,
  steps: {},
  planDays: {},
  equipment: {},
  planAnswers: {},
  tasks: {},
  applications: [],
  oath: EMPTY_OATH,
};

const KEY = "devup.path.v1";

type Ctx = {
  state: PathState;
  hydrated: boolean;
  hasPath: boolean;
  choosePath: (track: string) => void;
  setStage: (stage: number) => void;
  toggleStep: (n: number) => void;
  togglePlanDay: (n: number) => void;
  toggleEquipment: (id: string) => void;
  setPlanAnswers: (a: Record<string, string>) => void;
  toggleTask: (id: string) => void;
  addApplication: (a: Omit<Application, "id">) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateOath: (patch: Partial<Oath>) => void;
  toggleOathClause: (id: string) => void;
};

const PathContext = createContext<Ctx | null>(null);

export function PathProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PathState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. localStorage cannot be read during the SSR render, so
  // seeding state from it in a mount effect is the only correct option here —
  // it runs exactly once and is what keeps the server and client markup identical.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...EMPTY, ...(JSON.parse(raw) as PathState) };
        // A saved track id may no longer exist (tracks get renamed/retired) —
        // drop it so lookups don't silently fail, but keep all other progress.
        if (
          parsed.track &&
          !tracksData.tracks.some((t) => t.id === parsed.track)
        ) {
          parsed.track = null;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      }
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
  const toggleTask = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, tasks: { ...s.tasks, [id]: !s.tasks[id] } })),
    [],
  );

  const addApplication = useCallback(
    (a: Omit<Application, "id">) =>
      setState((s) => ({
        ...s,
        applications: [
          { ...a, id: `${Date.now()}-${s.applications.length}` },
          ...s.applications,
        ],
      })),
    [],
  );
  const updateApplication = useCallback(
    (id: string, patch: Partial<Application>) =>
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      })),
    [],
  );
  const deleteApplication = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        applications: s.applications.filter((a) => a.id !== id),
      })),
    [],
  );

  const updateOath = useCallback(
    (patch: Partial<Oath>) =>
      setState((s) => ({ ...s, oath: { ...s.oath, ...patch } })),
    [],
  );
  const toggleOathClause = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        oath: {
          ...s.oath,
          clauses: { ...s.oath.clauses, [id]: !s.oath.clauses[id] },
        },
      })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      hasPath: state.track !== null,
      choosePath,
      setStage,
      toggleStep,
      togglePlanDay,
      toggleEquipment,
      setPlanAnswers,
      toggleTask,
      addApplication,
      updateApplication,
      deleteApplication,
      updateOath,
      toggleOathClause,
    }),
    [
      state,
      hydrated,
      choosePath,
      setStage,
      toggleStep,
      togglePlanDay,
      toggleEquipment,
      setPlanAnswers,
      toggleTask,
      addApplication,
      updateApplication,
      deleteApplication,
      updateOath,
      toggleOathClause,
    ],
  );

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function usePath() {
  const ctx = useContext(PathContext);
  if (!ctx) throw new Error("usePath must be used within PathProvider");
  return ctx;
}
