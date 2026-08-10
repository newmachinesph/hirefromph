"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { Check, ChevronLeft, RotateCcw } from "lucide-react";
import plan from "@/data/plan.json";
import tracksData from "@/data/tracks.json";
import site from "@/data/site.json";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type QuizOption = {
  value: string;
  label: string;
  desc: string;
  icon?: string;
  accent?: "signal" | "verified" | "caution" | "info";
};

type Question = {
  id: string;
  q: string;
  options: QuizOption[];
};

type RawQuestion = {
  id: string;
  q: string;
  options?: { value: string; label: string; desc: string }[];
  fromTracks?: boolean;
};

// Build the question list once, the "track" question pulls its options from
// tracks.json so the plan wizard stays wired to the same data as the rest of
// the site (and calling choosePath() keeps everything else personalized too).
const QUESTIONS: Question[] = (plan.questions as unknown as RawQuestion[]).map(
  (q) =>
    q.fromTracks
      ? {
          id: q.id,
          q: q.q,
          options: tracksData.tracks.map((t) => ({
            value: t.id,
            label: t.name,
            desc: t.tagline,
            icon: t.icon,
            accent: t.accent as QuizOption["accent"],
          })),
        }
      : { id: q.id, q: q.q, options: q.options ?? [] },
);

const TRACK_STEP_INDEX = QUESTIONS.findIndex((q) => q.id === "track");
const TOTAL_DAYS = plan.weeks.reduce((sum, w) => sum + w.days.length, 0);
const NAV_LABEL: Record<string, string> = {
  // /path is in no navGroup but plan.json day tools link to it.
  "/path": "Your path",
  ...Object.fromEntries(
    [...site.navGroups.flatMap((g) => g.links), ...site.primaryNav].map((n) => [
      n.href,
      n.label,
    ]),
  ),
};

const accentSelected: Record<string, string> = {
  signal: "aria-pressed:border-signal aria-pressed:bg-signal-tint",
  verified: "aria-pressed:border-verified aria-pressed:bg-verified-tint",
  caution: "aria-pressed:border-caution aria-pressed:bg-caution-tint",
  info: "aria-pressed:border-info aria-pressed:bg-info-tint",
  neutral: "aria-pressed:border-ink aria-pressed:bg-paper-3",
};
const iconTone: Record<string, string> = {
  signal: "bg-signal-tint text-signal-deep",
  verified: "bg-verified-tint text-verified",
  caution: "bg-caution-tint text-caution-text",
  info: "bg-info-tint text-info",
};

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -32 : 32 }),
};

function findLabel(questionId: string, value: string | undefined): string | undefined {
  if (!value) return undefined;
  return QUESTIONS.find((q) => q.id === questionId)?.options.find(
    (o) => o.value === value,
  )?.label;
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl leading-none">{value}</span>
        <span className="text-[10px] text-ink-faint">of {max}</span>
      </div>
    </div>
  );
}

export function PlanWizard() {
  const { state, hydrated, choosePath, togglePlanDay, setPlanAnswers } = usePath();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resumed, setResumed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume a previously completed plan once client state has hydrated. The saved
  // answers live in localStorage, which is unreadable during the SSR render, so
  // seeding from them in an effect is unavoidable. The `resumed` guard makes it
  // run exactly once, so there is no cascading-render risk.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!hydrated || resumed) return;
    const saved = state.planAnswers;
    // Every answer must still be a live option — a retired/renamed track id
    // would otherwise resume into a plan with a hole where the niche was.
    const valid = (q: Question) =>
      q.options.some((o) => o.value === saved[q.id]);
    if (QUESTIONS.every((q) => saved[q.id] && valid(q))) {
      setAnswers(saved);
      setStep(QUESTIONS.length);
    }
    setResumed(true);
  }, [hydrated, resumed, state.planAnswers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="animate-pulse rounded-[var(--radius-lg)] border border-line bg-paper-2 p-8 lg:p-12"
      >
        <div className="mx-auto h-1.5 w-full max-w-2xl rounded-full bg-line" />
        <div className="mx-auto mt-8 h-8 w-2/3 max-w-2xl rounded bg-line" />
        <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          <div className="h-24 rounded-2xl bg-line/60" />
          <div className="h-24 rounded-2xl bg-line/60" />
        </div>
      </div>
    );
  }

  const isResults = step >= QUESTIONS.length;
  const question = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const progressPct = Math.round((Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100);
  const doneCount = Object.values(state.planDays).filter(Boolean).length;

  function selectOption(questionId: string, value: string) {
    if (questionId === "track") choosePath(value);
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    setDirection(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (QUESTIONS.every((q) => next[q.id])) {
        setPlanAnswers(next);
        setStep(QUESTIONS.length);
      } else {
        setStep((s) => Math.min(s + 1, QUESTIONS.length - 1));
      }
    }, 260);
  }

  function goBack() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  function changePath() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDirection(-1);
    setStep(TRACK_STEP_INDEX);
  }

  function startOver() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDirection(-1);
    setAnswers({});
    setPlanAnswers({});
    setStep(0);
  }

  const trackLabel = findLabel("track", answers.track);
  const hoursLabel = findLabel("hours", answers.hours) ?? plan.commitment;
  const experienceLabel = findLabel("experience", answers.experience);

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] sm:p-10 lg:p-14">
      <MotionConfig reducedMotion="user">
        {!isResults && (
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              <p className="kicker">
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <p className="kicker">{progressPct}%</p>
            </div>
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={QUESTIONS.length}
              aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}
            >
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {isResults ? (
            <motion.div
              key="results"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="kicker">Your personalized plan</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-balance sm:text-3xl">
                    30 days for {trackLabel ?? "your online career"}, {" "}
                    <span className="text-signal">{hoursLabel} a day.</span>
                  </h3>
                  {experienceLabel && (
                    <p className="mt-2 text-sm text-ink-soft">
                      Starting point: <span className="font-semibold text-ink">{experienceLabel}</span>.
                      Check off each day as you go, your progress saves automatically.
                    </p>
                  )}
                </div>
                <ProgressRing value={doneCount} max={TOTAL_DAYS} />
              </div>

              <div className="mt-10 space-y-5">
                {plan.weeks.map((week) => {
                  const doneInWeek = week.days.filter((d) => state.planDays[d.day]).length;
                  return (
                    <div
                      key={week.week}
                      className="rounded-2xl border border-line bg-paper p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="kicker">Week {week.week}</p>
                          <h4 className="mt-1 font-display text-xl leading-tight">
                            {week.title}
                          </h4>
                          <p className="mt-1 text-sm text-ink-soft">{week.focus}</p>
                        </div>
                        <Pill tone={doneInWeek === week.days.length ? "verified" : "neutral"}>
                          {doneInWeek}/{week.days.length} done
                        </Pill>
                      </div>
                      <ul className="mt-4 divide-y divide-line">
                        {week.days.map((day) => {
                          const checked = !!state.planDays[day.day];
                          return (
                            <li key={day.day} className="flex items-start gap-3 py-3">
                              <input
                                type="checkbox"
                                id={`plan-day-${day.day}`}
                                checked={checked}
                                onChange={() => togglePlanDay(day.day)}
                                aria-label={`Mark day ${day.day} complete: ${day.task}`}
                                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-signal"
                              />
                              <label
                                htmlFor={`plan-day-${day.day}`}
                                className={cn(
                                  "flex-1 cursor-pointer text-sm leading-relaxed",
                                  checked ? "text-ink-faint line-through" : "text-ink",
                                )}
                              >
                                <span className="font-semibold">Day {day.day}.</span>{" "}
                                {day.task}
                              </label>
                              <Link
                                href={day.tool}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line-strong bg-paper-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
                              >
                                <Icon name="arrow-up-right" size={12} />
                                {NAV_LABEL[day.tool] ?? day.tool}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                <button
                  type="button"
                  onClick={changePath}
                  className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-2 px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
                >
                  Change my path
                </button>
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-signal"
                >
                  <RotateCcw size={14} />
                  Start over
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              className="mx-auto mt-8 max-w-2xl"
            >
              <h3 className="font-display text-2xl leading-tight text-balance sm:text-3xl">
                {question.q}
              </h3>
              <div
                className={cn(
                  "mt-6 grid gap-3",
                  question.options.length > 4
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2",
                )}
              >
                {question.options.map((opt) => {
                  const selected = answers[question.id] === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => selectOption(question.id, opt.value)}
                      aria-pressed={selected}
                      className={cn(
                        "group relative flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
                        accentSelected[opt.accent ?? "neutral"],
                      )}
                    >
                      {opt.icon && (
                        <span
                          className={cn(
                            "grid h-10 w-10 place-items-center rounded-xl",
                            iconTone[opt.accent ?? "neutral"] ?? "bg-paper-3 text-ink-soft",
                          )}
                        >
                          <Icon name={opt.icon} size={18} />
                        </span>
                      )}
                      <span className="pr-6">
                        <span className="block font-display text-lg leading-tight">
                          {opt.label}
                        </span>
                        <span className="mt-1 block text-sm leading-snug text-ink-soft">
                          {opt.desc}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-verified text-white opacity-0 transition-opacity",
                          selected && "opacity-100",
                        )}
                      >
                        <Check size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
