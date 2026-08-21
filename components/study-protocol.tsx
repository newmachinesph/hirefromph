"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import learning from "@/data/learning.json";
import { CopyButton } from "@/components/copy-button";
import {
  Badge,
  Button,
  Callout,
  Card,
  ChoiceCard,
  Field,
  Heading,
  Icon,
  Kicker,
  ProgressBar,
  Text,
} from "@/components/ui";

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
    `Session shape: ${sessionShape.label}, ${sessionShape.pattern}, ${sessionShape.perDay}`,
    sessionShape.desc,
    "",
    "My 3 techniques:",
    ...techniques.map((t, i) => `${i + 1}. ${t.name}, ${t.how}`),
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
    <div className="rounded-lg border border-line bg-paper p-6 sm:p-10 lg:p-14">
      {!isResults && (
        <div className="mx-auto max-w-2xl">
          <ProgressBar
            value={Math.min(step, QUESTIONS.length)}
            max={QUESTIONS.length}
            label="Protocol progress"
            showValue
          />
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
            <Field
              as="group"
              label={question.q}
              hint={question.help}
              className="[&>legend]:font-display [&>legend]:text-h3"
            >
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {question.options.map((opt) => (
                  <ChoiceCard
                    key={opt.value}
                    name={question.id}
                    value={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    checked={answers[question.id] === opt.value}
                    onChange={(value) => selectOption(question.id, value)}
                  />
                ))}
              </div>
            </Field>
            {step > 0 && (
              <div className="mt-8">
                <Button
                  variant="link"
                  onClick={goBack}
                  icon={<Icon name="chevron-left" size={14} />}
                >
                  Back
                </Button>
              </div>
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
          <Kicker>Your study protocol</Kicker>
          <Heading level={3} size="h3" balance className="mt-2">
            {summary.sessionShape.label},{" "}
            <span className="text-primary">{summary.sessionShape.pattern}</span>
          </Heading>
          <Text size="small" className="mt-2 max-w-xl">
            {summary.sessionShape.desc}
          </Text>
        </div>
        <Badge tone="verified" className="shrink-0">
          {summary.sessionShape.perDay}
        </Badge>
      </div>

      <Card padding="md" onBand className="mt-8">
        <Text tone="ink" size="small">
          <span className="font-semibold">Fit to your day: </span>
          {summary.timeNote} {summary.energyNote} {summary.environmentNote}
        </Text>
      </Card>

      <div className="mt-8">
        <Kicker>Your 3 techniques</Kicker>
        <Text size="small" className="mt-2 max-w-2xl">
          {summary.goalNote}
        </Text>
        <div className="mt-4 grid gap-3">
          {summary.techniques.map((t, i) => (
            <Card key={t.id} padding="md">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-ink font-display text-sm text-paper">
                  {i + 1}
                </span>
                <span className="font-display text-lg leading-tight">
                  {t.name}
                </span>
              </div>
              <Text size="small" className="mt-2.5">
                {t.how}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Callout tone="signal" title="Stop doing">
          <ul className="mt-1 space-y-3">
            {summary.stopDoing.map((f) => (
              <li key={f.id} className="text-small leading-relaxed">
                <span className="font-semibold text-primary-deep line-through decoration-primary/50">
                  {f.habit}
                </span>
                <span className="mt-0.5 block text-ink-soft">
                  → {f.doInstead}
                </span>
              </li>
            ))}
          </ul>
        </Callout>
        <Callout tone="verified" title="Close your feedback loop">
          <Text tone="ink" size="small">
            {summary.feedbackNote}
          </Text>
        </Callout>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
        <CopyButton value={summary.text} label="Copy my protocol" />
        <Button
          variant="ghost"
          onClick={onRestart}
          icon={<Icon name="rotate-ccw" size={14} />}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}
