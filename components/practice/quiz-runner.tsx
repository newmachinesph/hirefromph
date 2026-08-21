"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ACCENT } from "@/lib/accent";
import { formatIsoDate } from "@/lib/dates";
import { nextDue, schedule, type Schedule } from "@/lib/leitner";
import { EMPTY_QUIZ, PRACTICE_KEYS, parseQuizState } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Button, Heading, Icon, Kicker, ProgressBar, Source, Text } from "@/components/ui";
import { usePracticeSlot, useToday } from "./hooks";

export type QuizOption = { text: string; correct: boolean; why: string };

export type QuizQuestion = {
  id: string;
  type: "choice" | "reveal";
  prompt: string;
  options?: QuizOption[];
  answer?: string;
  source?: { label: string; url: string };
};

export function QuizRunner({
  route,
  questions,
}: {
  route: string;
  questions: QuizQuestion[];
}) {
  const baseId = useId();
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);

  const [index, setIndex] = useState(0);
  /** questionId -> answered from memory. */
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answersRef = useRef<Record<string, boolean>>({});
  /** choice questions: which option index was clicked. */
  const [picked, setPicked] = useState<Record<string, number>>({});
  /** reveal questions: has the answer been shown yet. */
  const [shown, setShown] = useState<Record<string, boolean>>({});

  const record = useCallback(
    (question: QuizQuestion, correct: boolean) => {
      const next = { ...answersRef.current, [question.id]: correct };
      answersRef.current = next;
      setAnswers(next);
      if (today === "") return;

      const complete = questions.every((candidate) => candidate.id in next);
      const score = questions.filter((candidate) => next[candidate.id]).length;

      set((prev) => ({
        questions: {
          ...prev.questions,
          [question.id]: schedule(prev.questions[question.id], correct, today),
        },
        routes: complete
          ? { ...prev.routes, [route]: { score, total: questions.length, taken: today } }
          : prev.routes,
      }));
    },
    [questions, route, set, today],
  );

  const reset = useCallback(() => {
    answersRef.current = {};
    setAnswers({});
    setPicked({});
    setShown({});
    setIndex(0);
  }, []);

  const current = questions[Math.min(index, questions.length - 1)];
  const answered = current.id in answers;
  const answeredCount = Object.keys(answers).length;
  const finished = questions.every((question) => question.id in answers);
  const score = questions.filter((question) => answers[question.id]).length;
  const isLast = index === questions.length - 1;

  const schedules = questions
    .map((question) => value.questions[question.id])
    .filter((entry): entry is Schedule => Boolean(entry));
  const due = nextDue(schedules);

  const promptId = `${baseId}-prompt`;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-3">
        <Kicker>Retrieval practice</Kicker>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          Check yourself
        </Heading>
        <Text>
          Three questions on this page. Pulling an answer out of your head is what makes it stay
          there.
        </Text>
      </div>

      <ProgressBar
        value={answeredCount}
        max={questions.length}
        label={`Question ${index + 1} of ${questions.length}`}
        showValue
      />

      <Text id={promptId} size="lead" tone="ink">
        {current.prompt}
      </Text>

      {current.type === "choice" ? (
        <div role="group" aria-labelledby={promptId} className="flex flex-col gap-3">
          {(current.options ?? []).map((option, optionIndex) => {
            const chosen = picked[current.id] === optionIndex;
            return (
              // A raw <button> rather than the Button primitive: an option row is
              // a full-width answer card whose border carries the verdict, which
              // none of Button's five variants can express.
              <button
                key={option.text}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked((prev) => ({ ...prev, [current.id]: optionIndex }));
                  record(current, option.correct);
                }}
                className={cn(
                  "rounded-md border p-4 text-left transition-colors duration-150 ease-out",
                  !answered && "border-line-strong hover:border-ink hover:bg-band",
                  answered && option.correct && ACCENT.verified.soft,
                  answered && !option.correct && chosen && ACCENT.coral.soft,
                  answered && !option.correct && !chosen && "border-line",
                )}
              >
                <span className="flex items-start gap-3">
                  {answered && (option.correct || chosen) && (
                    <Icon
                      name={option.correct ? "check-circle-2" : "shield-alert"}
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-medium text-ink">{option.text}</span>
                    {answered && <span className="text-small text-ink-soft">{option.why}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!shown[current.id] ? (
            <div>
              <Button
                variant="outline"
                onClick={() => setShown((prev) => ({ ...prev, [current.id]: true }))}
              >
                Show the answer
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-line bg-band p-4">
                <Text tone="ink">{current.answer}</Text>
              </div>
              {!answered && (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => record(current, true)}>
                    I had it
                  </Button>
                  <Button variant="ghost" onClick={() => record(current, false)}>
                    I missed it
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p role="status" className="text-small text-ink-soft">
        {answered
          ? answers[current.id]
            ? "Right. Next one."
            : "Not this one. The answer above says why."
          : ""}
      </p>

      {current.source && <Source label={current.source.label} url={current.source.url} />}

      {answered && !isLast && (
        <div>
          <Button variant="secondary" onClick={() => setIndex(index + 1)}>
            Next question
          </Button>
        </div>
      )}

      {finished && (
        <div data-testid="quiz-summary" className="flex flex-col gap-3 border-t border-line pt-6">
          <Text tone="ink">
            <strong className="font-semibold">
              {score} of {questions.length}
            </strong>{" "}
            answered from memory.
          </Text>
          {hydrated && due && <Text size="small">These come back on {formatIsoDate(due)}.</Text>}
          <div className="flex flex-wrap gap-3">
            <Button href="/practice" variant="secondary">
              See what is due
            </Button>
            <Button variant="ghost" onClick={reset}>
              Run it again
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
