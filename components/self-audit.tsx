"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Level = { min: number; max: number; label: string; desc: string };
type Answer = "agree" | "disagree" | null;

type Props = {
  statements: string[];
  levels: Level[];
};

export function SelfAudit({ statements, levels }: Props) {
  const [answers, setAnswers] = useState<Answer[]>(() =>
    statements.map(() => null),
  );

  const total = statements.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const score = answers.filter((a) => a === "agree").length;
  const done = answeredCount === total;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const level = useMemo(
    () => levels.find((l) => score >= l.min && score <= l.max) ?? null,
    [levels, score],
  );

  function setAnswer(i: number, value: Answer) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  function reset() {
    setAnswers(statements.map(() => null));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-3">
        {statements.map((statement, i) => (
          <StatementRow
            key={statement}
            index={i}
            statement={statement}
            answer={answers[i]}
            onChange={(v) => setAnswer(i, v)}
          />
        ))}
      </div>

      <aside className="flex flex-col gap-6 rounded-2xl border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:sticky lg:top-24">
        <div className="flex flex-col items-center text-center">
          <div
            role="img"
            aria-label={`Score ${score} of ${total}`}
            className="grid h-24 w-24 place-items-center rounded-full transition-[background] duration-500"
            style={{
              background: `conic-gradient(var(--verified) ${pct}%, var(--line) ${pct}% 100%)`,
            }}
          >
            <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-paper-2">
              <span className="font-display text-2xl text-ink">
                {score}/{total}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1" aria-live="polite">
            <p className="text-xs text-ink-faint">
              {answeredCount} of {total} answered
            </p>
            <AnimatePresence mode="wait">
              {done && level ? (
                <motion.div
                  key={level.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 w-full rounded-xl border border-verified/25 bg-verified-tint p-4 text-left"
                >
                  <p className="kicker text-verified">Your level</p>
                  <p className="mt-1 font-display text-xl text-ink">
                    {level.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {level.desc}
                  </p>
                </motion.div>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  Answer all {total} to see where you stand.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </aside>
    </div>
  );
}

function StatementRow({
  index,
  statement,
  answer,
  onChange,
}: {
  index: number;
  statement: string;
  answer: Answer;
  onChange: (v: Answer) => void;
}) {
  const name = `audit-${index}`;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between",
        answer === "agree"
          ? "border-verified/30 bg-verified-tint"
          : "border-line bg-paper-2",
      )}
    >
      <p className="text-sm font-medium text-ink sm:max-w-md">
        <span className="mr-2 font-mono text-xs text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
        {statement}
      </p>
      <fieldset className="flex shrink-0 gap-1.5 rounded-full border border-line-strong bg-paper-3 p-1">
        <legend className="sr-only">Agree or disagree: {statement}</legend>
        {(["agree", "disagree"] as const).map((v) => {
          const id = `${name}-${v}`;
          return (
            <div key={v}>
              <input
                type="radio"
                id={id}
                name={name}
                checked={answer === v}
                onChange={() => onChange(v)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "block cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold capitalize text-ink-soft transition-colors hover:text-ink",
                  v === "agree"
                    ? "peer-checked:bg-verified peer-checked:text-white"
                    : "peer-checked:bg-ink peer-checked:text-paper-2",
                )}
              >
                {v}
              </label>
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}
