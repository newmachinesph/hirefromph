"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import tasksData from "@/data/tasks.json";
import tracksData from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Heading,
  Icon,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

type Task = (typeof tasksData.tasks)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Starter: "verified",
  Intermediate: "caution",
  Advanced: "signal",
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
          <Button key={i} href={part} variant="link">
            {part}
          </Button>
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
              <div className="mb-10 rounded-md border border-primary/30 bg-primary-tint/40 p-6">
                <p className="kicker text-primary-deep">
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
              <Button
                size="sm"
                variant={trackFilter === "all" ? "primary" : "outline"}
                onClick={() => setTrackFilter("all")}
                aria-label={`All tracks, ${tasks.length} tasks`}
                className="min-h-11"
                iconEnd={
                  <span
                    className={cn(
                      "tabular-nums",
                      trackFilter === "all" ? "text-white/70" : "text-ink-faint",
                    )}
                  >
                    {tasks.length}
                  </span>
                }
              >
                All tracks
              </Button>
              {tracksData.tracks.map((t) => {
                const count = tasks.filter((task) => matchesTrack(task, t.id)).length;
                const active = trackFilter === t.id;
                return (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    onClick={() => setTrackFilter(t.id)}
                    aria-label={`${t.name}, ${count} tasks`}
                    className="min-h-11"
                    iconEnd={
                      <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink-faint")}>
                        {count}
                      </span>
                    }
                  >
                    {t.name}
                  </Button>
                );
              })}
            </div>
            <div role="group" aria-label="Filter by difficulty" className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={difficultyFilter === "all" ? "primary" : "outline"}
                onClick={() => setDifficultyFilter("all")}
                aria-label={`All levels, ${tasks.length} tasks`}
                className="min-h-11"
                iconEnd={
                  <span
                    className={cn(
                      "tabular-nums",
                      difficultyFilter === "all" ? "text-white/70" : "text-ink-faint",
                    )}
                  >
                    {tasks.length}
                  </span>
                }
              >
                All levels
              </Button>
              {tasksData.difficulties.map((d) => {
                const count = tasks.filter((task) => task.difficulty === d).length;
                const active = difficultyFilter === d;
                return (
                  <Button
                    key={d}
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    onClick={() => setDifficultyFilter(d)}
                    aria-label={`${d}, ${count} tasks`}
                    className="min-h-11"
                    iconEnd={
                      <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink-faint")}>
                        {count}
                      </span>
                    }
                  >
                    {d}
                  </Button>
                );
              })}
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
              <EmptyState
                icon="list-checks"
                title="No micro-tasks match those filters"
                body="Widen the track or the difficulty, or clear both to see all forty."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTrackFilter("all");
                      setDifficultyFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
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
        "mb-8 flex flex-wrap items-center justify-between gap-4 rounded-md border p-6",
        celebrate ? "border-verified/40 bg-verified-tint/50" : "border-line bg-paper",
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
        <Button href="/build" variant="outline">
          Open the portfolio lab
        </Button>
      )}
    </div>
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
        "group flex h-full flex-col overflow-hidden rounded-md border p-6 text-left transition-colors duration-150 ease-out",
        done
          ? "border-verified/50 bg-verified-tint/40"
          : "border-line bg-paper hover:border-ink hover:bg-band",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
            done ? "bg-verified text-white" : accent(task.accent).soft,
          )}
        >
          {done ? <Icon name="check" size={20} /> : <Icon name={task.icon} size={20} />}
        </span>
        <Badge tone={DIFFICULTY_TONE[task.difficulty] ?? "neutral"}>{task.difficulty}</Badge>
      </div>
      <p className={cn("mt-4 kicker", accent(task.accent).text)}>{trackNameById[task.track]}</p>
      <Heading level={3} size="h5" className="mt-1">
        {task.title}
      </Heading>
      <Text size="small" className="mt-2 flex-1">
        {task.proves}
      </Text>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-xs font-medium text-ink-faint">{task.time}</span>
        {done ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-verified">
            <Icon name="check" size={14} /> Built
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
            Open the task
            <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
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
      <Button variant="link" onClick={onBack} icon={<Icon name="arrow-left" size={15} />}>
        Back to all micro-tasks
      </Button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-md",
              accent(task.accent).soft,
            )}
          >
            <Icon name={task.icon} size={24} />
          </span>
          <div>
            <p className={cn("kicker", accent(task.accent).text)}>{trackNameById[task.track]}</p>
            <Heading level={2} size="h3" className="mt-1">
              {task.title}
            </Heading>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={DIFFICULTY_TONE[task.difficulty] ?? "neutral"}>{task.difficulty}</Badge>
          <Badge>{task.time}</Badge>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-md border border-line-strong bg-band/60 p-5">
        <p className="kicker mb-1.5">What this proves</p>
        <Text size="base" tone="ink">
          {task.proves}
        </Text>
      </div>

      {/* Prerequisites */}
      <section className="mt-10">
        <h3 className="kicker">1 · Prerequisite</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {task.prerequisites.map((p) => (
            <Card key={p.skill} padding="md">
              <p className="font-display text-base leading-snug">{p.skill}</p>
              <Text size="small" className="mt-1.5">
                {p.why}
              </Text>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                <strong className="font-semibold text-ink-soft">If you don&rsquo;t: </strong>
                <Linkify text={p.ifYouDont} />
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mt-10">
        <h3 className="kicker">2 · Resources</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {task.resources.map((r) => (
            <Card key={r.name} padding="md">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="neutral">{r.type}</Badge>
                {r.free && <span className="text-xs font-semibold text-verified">Open</span>}
              </div>
              <p className="mt-3 font-display text-base leading-snug">{r.name}</p>
              <Text size="small" className="mt-1.5 flex-1">
                {r.what}
              </Text>
              {r.url === "#" ? (
                <span className="mt-4 inline-flex w-fit text-sm font-semibold text-ink-soft">
                  You pick the subject
                </span>
              ) : (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink hover:text-primary"
                >
                  Open
                  <Icon
                    name="arrow-up-right"
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* The Task */}
      <section className="mt-10 max-w-2xl">
        <h3 className="kicker">3 · The Task</h3>
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Scenario</p>
            <Text size="base" tone="ink" className="mt-1.5">
              {task.brief.scenario}
            </Text>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Deliverable</p>
            <Text size="base" tone="ink" className="mt-1.5">
              {task.brief.deliverable}
            </Text>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Constraints</p>
            <ul className="mt-2 space-y-1.5">
              {task.brief.constraints.map((c) => (
                <Text key={c} as="li" size="small" className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-pill bg-ink-faint" />
                  {c}
                </Text>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Steps</p>
            <ol className="mt-2 space-y-2.5">
              {task.brief.steps.map((s, i) => (
                <Text key={s} as="li" size="small" className="flex gap-3">
                  <span className="shrink-0 font-display text-base text-line-strong">{i + 1}</span>
                  {s}
                </Text>
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
            <Badge tone={dodDone === task.definitionOfDone.length ? "verified" : "neutral"}>
              {dodDone}/{task.definitionOfDone.length}
            </Badge>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-paper">
            {task.definitionOfDone.map((d, i) => {
              const fieldId = `${task.id}-dod-${i}`;
              const checked = !!dodChecked[i];
              return (
                <li key={d} className="p-4">
                  <Checkbox
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleDod(i)}
                    label={
                      <span className={cn(checked && "text-ink-faint line-through")}>{d}</span>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="kicker">Self-critique</h3>
            <Badge tone={critiqueDone === task.selfCritique.length ? "verified" : "neutral"}>
              {critiqueDone}/{task.selfCritique.length}
            </Badge>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-paper">
            {task.selfCritique.map((c, i) => {
              const fieldId = `${task.id}-critique-${i}`;
              const checked = !!critiqueChecked[i];
              return (
                <li key={c} className="p-4">
                  <Checkbox
                    id={fieldId}
                    checked={checked}
                    onChange={() => onToggleCritique(i)}
                    label={
                      <span className={cn(checked && "text-ink-faint line-through")}>{c}</span>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Prove it */}
      <section className="mt-10 max-w-2xl">
        <h3 className="kicker">4 · Prove it</h3>
        <div className="mt-4 rounded-md border border-line-strong bg-band/60 p-6">
          <Text size="base">{task.presentIt}</Text>
        </div>
      </section>

      {/* Stretch */}
      <section className="mt-6 max-w-2xl">
        <div className="rounded-md border border-info/25 bg-info-tint/50 p-5">
          <p className="kicker text-info">Stretch it further</p>
          <Text size="small" className="mt-1.5">
            {task.stretch}
          </Text>
        </div>
      </section>

      {/* Completion */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line-strong bg-paper p-6 sm:p-8">
        <div>
          <p className="font-display text-xl leading-tight">
            {isDone ? "Marked as built. Nice." : "Finished building this?"}
          </p>
          <Text size="small" className="mt-1.5">
            {isDone
              ? "This is a real piece in your portfolio now."
              : "Mark it done, it becomes a real piece in your portfolio counter."}
          </Text>
        </div>
        <Button
          onClick={onToggleDone}
          aria-label={isDone ? "Built, undo" : "I built this"}
          variant={isDone ? "secondary" : "primary"}
          icon={isDone ? <Icon name="check" size={16} /> : undefined}
        >
          {isDone ? "Built, undo" : "I built this"}
        </Button>
      </div>
    </motion.div>
  );
}
