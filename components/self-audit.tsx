"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Callout, Card, Field, Icon, ProgressBar, Radio, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

type Level = { min: number; max: number; label: string; desc: string };
type Answer = "agree" | "disagree" | null;

type Props = {
  statements: string[];
  levels: Level[];
};

export function SelfAudit({ statements, levels }: Props) {
  const [answers, setAnswers] = useState<Answer[]>(() => statements.map(() => null));

  const total = statements.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const score = answers.filter((a) => a === "agree").length;
  const done = answeredCount === total;

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

      <Card padding="md" className="lg:sticky lg:top-24">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4" aria-live="polite">
            <ProgressBar
              value={score}
              max={total}
              label={`Score ${score} of ${total}`}
              showValue
              tone="verified"
            />
            <Text size="caption" tone="faint">
              {answeredCount} of {total} answered
            </Text>

            <AnimatePresence mode="wait">
              {done && level ? (
                <motion.div
                  key={level.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Callout tone="verified" title={level.label}>
                    <Text size="small">{level.desc}</Text>
                  </Callout>
                </motion.div>
              ) : (
                <Text size="small">Answer all {total} to see where you stand.</Text>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            onClick={reset}
            icon={<Icon name="rotate-ccw" size={14} />}
          >
            Reset
          </Button>
        </div>
      </Card>
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
    <Card
      padding="sm"
      className={cn(answer === "agree" && "border-verified bg-verified-tint")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text size="small" tone="ink" className="font-medium sm:max-w-md">
          <span className="mr-2 text-caption tabular-nums text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          {statement}
        </Text>

        <Field as="group" label={`Agree or disagree: ${statement}`} hideLabel className="shrink-0">
          <div className="flex gap-4">
            {(["agree", "disagree"] as const).map((v) => (
              <Radio
                key={v}
                id={`${name}-${v}`}
                name={name}
                checked={answer === v}
                onChange={() => onChange(v)}
                label={<span className="capitalize">{v}</span>}
              />
            ))}
          </div>
        </Field>
      </div>
    </Card>
  );
}
