"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Check, ChevronLeft, RotateCcw } from "lucide-react";
import learning from "@/data/learning.json";
import { CopyButton } from "@/components/copy-button";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const ADVANCE_DELAY_MS = 260;

type Option = { value: string; label: string; desc: string };
type Question = { id: string; q: string; help: string; options: Option[] };
type Work = {
  id: string;
  name: string;
  what: string;
  why: string;
  how: string;
  effort: string;
  payoff: string;
  icon: string;
  accent: string;
};
type FeelsGoodItem = {
  id: string;
  habit: string;
  whyItFeelsGood: string;
  whyItFails: string;
  doInstead: string;
};
type SessionShape = { label: string; pattern: string; perDay: string; desc: string };
type GoalRule = { techniques: string[]; note: string };
type ProtocolRules = {
  sessionShapes: Record<string, SessionShape>;
  time: Record<string, string>;
  energy: Record<string, string>;
  environment: Record<string, string>;
  feedback: Record<string, string>;
  goal: Record<string, GoalRule>;
  stopDoing: Record<string, string[]>;
};

const QUESTIONS = learning.protocol.questions as unknown as Question[];
const WORKS = learning.works as unknown as Work[];
const FEELS_GOOD = learning.feelsGood as unknown as FeelsGoodItem[];
const RULES = learning.protocolRules as unknown as ProtocolRules;

const stepVariants: Variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: EASE } },
};

type ProtocolSummary = {
  sessionShape: SessionShape;
  timeNote: string;
  energyNote: string;
  environmentNote: string;
  feedbackNote: string;
  goalNote: string;
  techniques: Work[];
  stopDoing: FeelsGoodItem[];
  text: string;
};

function buildProtocol(answers: Record<string, string>): ProtocolSummary | null {
  const sessionShape = RULES.sessionShapes[answers.attention];
  const goalRule = RULES.goal[answers.goal];
  if (!sessionShape || !goalRule) return null;

  const techniques = goalRule.techniques
    .map((id) => WORKS.find((w) => w.id === id))
    .filter((w): w is Work => Boolean(w));
  const stopDoing = (RULES.stopDoing[answers.goal] ?? [])
    .map((id) => FEELS_GOOD.find((f) => f.id === id))
    .filter((f): f is FeelsGoodItem => Boolean(f));

  const timeNote = RULES.time[answers.time] ?? "";
  const energyNote = RULES.energy[answers.energy] ?? "";
  const environmentNote = RULES.environment[answers.environment] ?? "";
  const feedbackNote = RULES.feedback[answers.feedback] ?? "";

  const text = [
    "MY STUDY PROTOCOL",
    "",
    `Session shape: ${sessionShape.label} — ${sessionShape.pattern}, ${sessionShape.perDay}`,
    sessionShape.desc,
    "",
    "My 3 techniques:",
    ...techniques.map((t, i) => `${i + 1}. ${t.name} — ${t.how}`),
    "",
    `Why these: ${goalRule.note}`,
    "",
    `Fit to my day: ${timeNote} ${energyNote} ${environmentNote}`,
    "",
    `Feedback loop: ${feedbackNote}`,
    "",
    "Stop doing:",
    ...stopDoing.map((f) => `- ${f.habit} -> ${f.doInstead}`),
  ].join("\n");

  return {
    sessionShape,
    timeNote,
    energyNote,
    environmentNote,
    feedbackNote,
    goalNote: goalRule.note,
    techniques,
    stopDoing,
    text,
  };
}

export function StudyProtocol() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const isResults = step >= QUESTIONS.length;
  const question = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const progressPct = Math.round(
    (Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100,
  );
  const summary = useMemo(
    () => (isResults ? buildProtocol(answers) : null),
    [isResults, answers],
  );

  function selectOption(questionId: string, value: string) {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, QUESTIONS.length));
    }, ADVANCE_DELAY_MS);
  }

  function goBack() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnswers({});
    setStep(0);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] sm:p-10 lg:p-14">
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
              className="h-full rounded-full bg-coral transition-[width] duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {isResults && summary ? (
          <motion.div
            key="results"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-live="polite"
          >
            <ProtocolResult summary={summary} onRestart={restart} />
          </motion.div>
        ) : (
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="mx-auto mt-8 max-w-2xl"
          >
            <fieldset>
              <legend className="font-display text-2xl leading-tight text-balance sm:text-3xl">
                {question.q}
              </legend>
              <p className="mt-2 text-sm text-ink-soft">{question.help}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {question.options.map((opt) => {
                  const id = `${question.id}-${opt.value}`;
                  const selected = answers[question.id] === opt.value;
                  return (
                    <div key={opt.value}>
                      <input
                        type="radio"
                        id={id}
                        name={question.id}
                        value={opt.value}
                        checked={selected}
                        onChange={() => selectOption(question.id, opt.value)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={id}
                        className={cn(
                          "group relative flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-line bg-paper p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] peer-checked:border-coral peer-checked:bg-coral-tint peer-focus-visible:ring-2 peer-focus-visible:ring-coral",
                        )}
                      >
                        <span className="pr-6 font-display text-lg leading-tight">
                          {opt.label}
                        </span>
                        <span className="text-sm leading-snug text-ink-soft">
                          {opt.desc}
                        </span>
                        <span
                          className={cn(
                            "absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-emerald text-white opacity-0 transition-opacity",
                            selected && "opacity-100",
                          )}
                        >
                          <Check size={14} />
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
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
    </div>
  );
}

function ProtocolResult({
  summary,
  onRestart,
}: {
  summary: ProtocolSummary;
  onRestart: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="kicker">Your study protocol</p>
          <h3 className="mt-2 font-display text-2xl leading-tight text-balance sm:text-3xl">
            {summary.sessionShape.label} —{" "}
            <span className="text-coral">{summary.sessionShape.pattern}</span>
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {summary.sessionShape.desc}
          </p>
        </div>
        <Pill tone="emerald" className="shrink-0">
          {summary.sessionShape.perDay}
        </Pill>
      </div>

      <div className="mt-8 rounded-2xl border border-line-strong bg-paper-3/60 p-5">
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-semibold">Fit to your day: </span>
          {summary.timeNote} {summary.energyNote} {summary.environmentNote}
        </p>
      </div>

      <div className="mt-8">
        <p className="kicker">Your 3 techniques</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {summary.goalNote}
        </p>
        <div className="mt-4 grid gap-3">
          {summary.techniques.map((t, i) => (
            <div
              key={t.id}
              className="rounded-2xl border border-line bg-paper p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm text-paper-2">
                  {i + 1}
                </span>
                <span className="font-display text-lg leading-tight">
                  {t.name}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                {t.how}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-coral/25 bg-coral-tint p-5">
          <p className="kicker text-coral-deep">Stop doing</p>
          <ul className="mt-3 space-y-3">
            {summary.stopDoing.map((f) => (
              <li key={f.id} className="text-sm leading-relaxed">
                <span className="font-semibold text-coral-deep line-through decoration-coral/50">
                  {f.habit}
                </span>
                <span className="mt-0.5 block text-ink-soft">
                  → {f.doInstead}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald/25 bg-emerald-tint p-5">
          <p className="kicker text-emerald">Close your feedback loop</p>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            {summary.feedbackNote}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
        <CopyButton value={summary.text} label="Copy my protocol" />
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-coral"
        >
          <RotateCcw size={14} />
          Start over
        </button>
      </div>
    </div>
  );
}
