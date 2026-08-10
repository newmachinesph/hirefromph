"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import tasksData from "@/data/tasks.json";
import tracksData from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { ButtonLink, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type Task = (typeof tasksData.tasks)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Starter: "verified",
  Intermediate: "caution",
  Advanced: "signal",
};

const iconTone: Record<string, string> = {
  signal: "bg-signal-tint text-signal-deep",
  verified: "bg-verified-tint text-verified",
  caution: "bg-caution-tint text-caution-text",
  info: "bg-info-tint text-info",
};
const accentText: Record<string, string> = {
  signal: "text-signal",
  caution: "text-caution-text",
  verified: "text-verified",
  info: "text-info",
};

const trackNameById: Record<string, string> = {
  any: "Every track",
  ...Object.fromEntries(
    tracksData.tracks.map((t): [string, string] => [t.id, t.name]),
  ),
};

// A task tagged "any" is universal — it belongs to every track, so it surfaces
// under every chosen path and counts toward every track's chip.
const matchesTrack = (task: Task, trackId: string) =>
  task.track === trackId || task.track === "any";

// Internal routes worth auto-linking when they show up inside "ifYouDont" copy.
const KNOWN_ROUTES = [
  "/build",
  "/tools",
  "/apply",
  "/prompts",
  "/method",
  "/plan",
  "/niches",
  "/path",
  "/start",
  "/get-hired",
  "/deliver",
  "/level-up",
  "/languages",
  "/equipment",
  "/reality",
  "/conduct",
  "/english",
  "/simulator",
];
const ROUTE_PATTERN = new RegExp(
  `(${KNOWN_ROUTES.map((r) => r.replace("/", "\\/")).join("|")})(?=[\\s.,)]|$)`,
  "g",
);

function Linkify({ text }: { text: string }) {
  const parts = text.split(ROUTE_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        KNOWN_ROUTES.includes(part) ? (
          <Link
            key={i}
            href={part}
            className="font-semibold text-ink underline decoration-signal/50 underline-offset-2 hover:text-signal"
          >
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function MicroTasks() {
  const { state, hydrated, hasPath, toggleTask } = usePath();
  const tasks = tasksData.tasks;

  const [trackFilter, setTrackFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dodChecked, setDodChecked] = useState<Record<string, Record<number, boolean>>>({});
  const [critiqueChecked, setCritiqueChecked] = useState<Record<string, Record<number, boolean>>>({});
  const autoSelected = useRef(false);

  // Once path data has hydrated, default the track filter to the user's path.
  // The chosen track lives in localStorage, which is unreadable during the SSR
  // render, so seeding the filter from it in an effect is unavoidable. The ref
  // guard makes it run exactly once, no cascading renders.
  useEffect(() => {
    if (!hydrated || autoSelected.current) return;
    autoSelected.current = true;
    // Only auto-narrow when the track has dedicated tasks — several niches have
    // just the universal "any" task, and locking the filter onto those would
    // land the user on a near-empty page.
    const dedicated = tasks.some((t) => t.track === state.track);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasPath && state.track && dedicated) setTrackFilter(state.track);
  }, [hydrated, hasPath, state.track, tasks]);

  const filtered = tasks.filter((t) => {
    if (trackFilter !== "all" && !matchesTrack(t, trackFilter)) return false;
    if (difficultyFilter !== "all" && t.difficulty !== difficultyFilter) return false;
    return true;
  });

  const track = state.track;
  const recommended = hydrated && hasPath && track
    ? tasks.filter((t) => matchesTrack(t, track)).slice(0, 3)
    : [];

  const doneMap: Record<string, boolean> = hydrated ? state.tasks : {};
  const completedCount = Object.values(doneMap).filter(Boolean).length;
  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  function toggleDod(taskId: string, idx: number) {
    setDodChecked((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [idx]: !prev[taskId]?.[idx] },
    }));
  }
  function toggleCritique(taskId: string, idx: number) {
    setCritiqueChecked((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [idx]: !prev[taskId]?.[idx] },
    }));
  }

  return (
    <div>
      <PortfolioCounter count={completedCount} hydrated={hydrated} />

      <AnimatePresence mode="wait" initial={false}>
        {!selected ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {recommended.length > 0 && (
              <div className="mb-10 rounded-2xl border border-signal/30 bg-signal-tint/40 p-6">
                <p className="kicker text-signal-deep">
                  Recommended for your path, {trackNameById[state.track ?? ""]}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((t) => (
                    <TaskCard key={t.id} task={t} done={!!doneMap[t.id]} onOpen={() => setSelectedId(t.id)} />
                  ))}
                </div>
              </div>
            )}

            <div role="group" aria-label="Filter by track" className="flex flex-wrap gap-2">
              <FilterChip
                label="All tracks"
                count={tasks.length}
                active={trackFilter === "all"}
                onClick={() => setTrackFilter("all")}
              />
              {tracksData.tracks.map((t) => (
                <FilterChip
                  key={t.id}
                  label={t.name}
                  count={tasks.filter((task) => matchesTrack(task, t.id)).length}
                  active={trackFilter === t.id}
                  onClick={() => setTrackFilter(t.id)}
                />
              ))}
            </div>
            <div role="group" aria-label="Filter by difficulty" className="mt-3 flex flex-wrap gap-2">
              <FilterChip
                label="All levels"
                count={tasks.length}
                active={difficultyFilter === "all"}
                onClick={() => setDifficultyFilter("all")}
              />
              {tasksData.difficulties.map((d) => (
                <FilterChip
                  key={d}
                  label={d}
                  count={tasks.filter((task) => task.difficulty === d).length}
                  active={difficultyFilter === d}
                  onClick={() => setDifficultyFilter(d)}
                />
              ))}
            </div>

            <p className="mt-5 text-sm text-ink-faint" aria-live="polite">
              {filtered.length} task{filtered.length === 1 ? "" : "s"}
            </p>

            <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    done={!!doneMap[task.id]}
                    onOpen={() => setSelectedId(task.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
              <p className="mt-10 rounded-2xl border border-dashed border-line-strong bg-paper-2 p-8 text-center text-sm text-ink-soft">
                No micro-tasks match these filters yet.
              </p>
            )}
          </motion.div>
        ) : (
          <TaskDetail
            task={selected}
            isDone={hydrated && !!state.tasks[selected.id]}
            onToggleDone={() => toggleTask(selected.id)}
            onBack={() => setSelectedId(null)}
            dodChecked={dodChecked[selected.id] ?? {}}
            onToggleDod={(i) => toggleDod(selected.id, i)}
            critiqueChecked={critiqueChecked[selected.id] ?? {}}
            onToggleCritique={(i) => toggleCritique(selected.id, i)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PortfolioCounter({ count, hydrated }: { count: number; hydrated: boolean }) {
  const celebrate = hydrated && count > 0;
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6",
        celebrate ? "border-verified/40 bg-verified-tint/50" : "border-line bg-paper-2",
      )}
    >
      <div>
        <p className="kicker">Your portfolio</p>
        <p className="mt-1.5 max-w-xl font-display text-xl leading-snug text-balance sm:text-2xl">
          {celebrate ? (
            <>
              <span className="text-verified">{count}</span> micro-task{count === 1 ? "" : "s"} completed
              → your portfolio has {count} piece{count === 1 ? "" : "s"}.
            </>
          ) : (
            "0 completed. Pick one below, you'll have your first piece today."
          )}
        </p>
      </div>
      {celebrate && (
        <ButtonLink href="/build" variant="outline">
          Open the portfolio lab
        </ButtonLink>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "border-ink bg-ink text-paper-2"
          : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {label}
      <span className={active ? "text-paper-2/60" : "text-ink-faint"}>{count}</span>
    </button>
  );
}

function TaskCard({ task, done, onOpen }: { task: Task; done: boolean; onOpen: () => void }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "group flex h-full flex-col rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        done ? "border-verified/50 bg-verified-tint/40" : "border-line bg-paper-2 hover:border-ink",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            done ? "bg-verified text-white" : iconTone[task.accent],
          )}
        >
          {done ? <Check size={20} /> : <Icon name={task.icon} size={20} />}
        </span>
        <Pill tone={DIFFICULTY_TONE[task.difficulty] ?? "neutral"}>{task.difficulty}</Pill>
      </div>
      <p className={cn("mt-4 kicker", accentText[task.accent])}>{trackNameById[task.track]}</p>
      <h3 className="mt-1 font-display text-lg leading-tight">{task.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{task.proves}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-xs font-medium text-ink-faint">{task.time}</span>
        {done ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-verified">
            <Check size={14} /> Built
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
            Open the task
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </motion.button>
  );
}

type TaskDetailProps = {
  task: Task;
  isDone: boolean;
  onToggleDone: () => void;
  onBack: () => void;
  dodChecked: Record<number, boolean>;
  onToggleDod: (index: number) => void;
  critiqueChecked: Record<number, boolean>;
  onToggleCritique: (index: number) => void;
};

function TaskDetail({
  task,
  isDone,
  onToggleDone,
  onBack,
  dodChecked,
  onToggleDod,
  critiqueChecked,
  onToggleCritique,
}: TaskDetailProps) {
  const dodDone = task.definitionOfDone.filter((_, i) => dodChecked[i]).length;
  const critiqueDone = task.selfCritique.filter((_, i) => critiqueChecked[i]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        Back to all micro-tasks
      </button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-start gap-4">
          <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", iconTone[task.accent])}>
            <Icon name={task.icon} size={24} />
          </span>
          <div>
            <p className={cn("kicker", accentText[task.accent])}>{trackNameById[task.track]}</p>
            <h2 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{task.title}</h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill tone={DIFFICULTY_TONE[task.difficulty] ?? "neutral"}>{task.difficulty}</Pill>
          <Pill>{task.time}</Pill>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-line-strong bg-paper-3/60 p-5">
        <p className="kicker mb-1.5">What this proves</p>
        <p className="text-base leading-relaxed text-ink">{task.proves}</p>
      </div>

      {/* Prerequisites */}
      <section className="mt-10">
        <h3 className="kicker">1 · Prerequisite</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {task.prerequisites.map((p) => (
            <div key={p.skill} className="rounded-2xl border border-line bg-paper-2 p-5">
              <p className="font-display text-base leading-snug">{p.skill}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.why}</p>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                <strong className="font-semibold text-ink-soft">If you don&rsquo;t: </strong>
                <Linkify text={p.ifYouDont} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mt-10">
        <h3 className="kicker">2 · Resources</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {task.resources.map((r) => (
            <div key={r.name} className="flex flex-col rounded-2xl border border-line bg-paper-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <Pill tone="neutral">{r.type}</Pill>
                {r.free && <span className="text-xs font-semibold text-verified">Open</span>}
              </div>
              <p className="mt-3 font-display text-base leading-snug">{r.name}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{r.what}</p>
              {r.url === "#" ? (
                <span className="mt-4 inline-flex w-fit text-sm font-semibold text-ink-soft">
                  You pick the subject
                </span>
              ) : (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal"
                >
                  Open
                  <ExternalLink
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The Task */}
      <section className="mt-10 max-w-2xl">
        <h3 className="kicker">3 · The Task</h3>
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Scenario</p>
            <p className="mt-1.5 text-base leading-relaxed text-ink">{task.brief.scenario}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Deliverable</p>
            <p className="mt-1.5 text-base leading-relaxed text-ink">{task.brief.deliverable}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Constraints</p>
            <ul className="mt-2 space-y-1.5">
              {task.brief.constraints.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Steps</p>
            <ol className="mt-2 space-y-2.5">
              {task.brief.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className="shrink-0 font-display text-base text-line-strong">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Definition of done + Self-critique */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="kicker">Definition of done</h3>
            <Pill tone={dodDone === task.definitionOfDone.length ? "verified" : "neutral"}>
              {dodDone}/{task.definitionOfDone.length}
            </Pill>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper-2">
            {task.definitionOfDone.map((d, i) => {
              const fieldId = `${task.id}-dod-${i}`;
              const checked = !!dodChecked[i];
              return (
                <li key={d} className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleDod(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-verified"
                  />
                  <label
                    htmlFor={fieldId}
                    className={cn(
                      "flex-1 cursor-pointer text-sm leading-relaxed",
                      checked ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {d}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="kicker">Self-critique</h3>
            <Pill tone={critiqueDone === task.selfCritique.length ? "verified" : "neutral"}>
              {critiqueDone}/{task.selfCritique.length}
            </Pill>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper-2">
            {task.selfCritique.map((c, i) => {
              const fieldId = `${task.id}-critique-${i}`;
              const checked = !!critiqueChecked[i];
              return (
                <li key={c} className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleCritique(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-verified"
                  />
                  <label
                    htmlFor={fieldId}
                    className={cn(
                      "flex-1 cursor-pointer text-sm leading-relaxed",
                      checked ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {c}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Prove it */}
      <section className="mt-10 max-w-2xl">
        <h3 className="kicker">4 · Prove it</h3>
        <div className="mt-4 rounded-2xl border border-line-strong bg-paper-3/60 p-6">
          <p className="text-base leading-relaxed text-ink-soft">{task.presentIt}</p>
        </div>
      </section>

      {/* Stretch */}
      <section className="mt-6 max-w-2xl">
        <div className="flex items-start gap-3 rounded-2xl border border-info/25 bg-info-tint/50 p-5">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-info" />
          <div>
            <p className="kicker text-info">Stretch it further</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{task.stretch}</p>
          </div>
        </div>
      </section>

      {/* Completion */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 sm:p-8">
        <div>
          <p className="font-display text-xl leading-tight">
            {isDone ? "Marked as built. Nice." : "Finished building this?"}
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">
            {isDone
              ? "This is a real piece in your portfolio now."
              : "Mark it done, it becomes a real piece in your portfolio counter."}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleDone}
          aria-pressed={isDone}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
            isDone
              ? "bg-verified text-white hover:-translate-y-0.5"
              : "bg-ink text-paper-2 hover:-translate-y-0.5 hover:bg-signal",
          )}
        >
          {isDone ? <Check size={16} /> : <Sparkles size={16} />}
          {isDone ? "Built, undo" : "I built this"}
        </button>
      </div>
    </motion.div>
  );
}
