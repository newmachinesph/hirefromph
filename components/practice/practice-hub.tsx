"use client";

import { useMemo } from "react";
import practiceData from "@/data/practice.json";
import { formatIsoDate } from "@/lib/dates";
import { nextDue, type Schedule } from "@/lib/leitner";
import { LIBRARY } from "@/lib/nav";
import { EMPTY_QUIZ, PRACTICE_KEYS, parseQuizState } from "@/lib/practice-store";
import { CardGrid, SectionHeading } from "@/components/layout";
import { Button, Card, Heading, Icon, Stat, StatStrip, Text } from "@/components/ui";
import { DECKS, Deck } from "./deck";
import { usePracticeSlot } from "./hooks";
import { Journal } from "./journal";
import { Streak } from "./streak";
import { DECK_COUNT, TOTAL_CARDS, usePracticeDue } from "./use-practice-due";

const ROUTE_QUESTIONS = practiceData.routes as Record<string, { questions: { id: string }[] }>;

function labelFor(href: string): string {
  return LIBRARY.find((entry) => entry.href === href)?.label ?? href;
}

const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** "Four" for a heading, digits past ten — never a hand-written number. */
function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

const deckAnchor = (id: string) => `deck-${id}`;

/**
 * The `/practice` body (spec §7.4.1): the decks first, since they are the
 * thing a visitor can do right now, then what is due, what you have already
 * been quizzed on, the streak, and this week's journal prompt.
 */
export function PracticeHub() {
  const due = usePracticeDue();
  const { value: quiz, hydrated } = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);

  const history = useMemo(
    () =>
      Object.entries(quiz.routes)
        .map(([route, run]) => {
          const ids = ROUTE_QUESTIONS[route]?.questions.map((question) => question.id) ?? [];
          const schedules = ids
            .map((id) => quiz.questions[id])
            .filter((entry): entry is Schedule => Boolean(entry));
          return { route, run, due: nextDue(schedules) };
        })
        .sort((a, b) => (a.run.taken < b.run.taken ? 1 : -1)),
    [quiz],
  );

  const nothingYet = hydrated && history.length === 0;
  const firstDeck = DECKS[0];

  return (
    <div className="flex flex-col gap-16">
      <section id="decks" className="flex scroll-mt-28 flex-col gap-6">
        <SectionHeading
          kicker="Decks"
          title={`${countWord(DECK_COUNT)} decks, ${TOTAL_CARDS} cards`}
          lead="Answer from memory before you flip. The card you find hardest is the one that comes back soonest."
        />

        {nothingYet && firstDeck && (
          <div
            data-testid="first-visit"
            className="rounded-md border border-dashed border-line-strong bg-band p-5"
          >
            <Text size="small">
              {due.reviewed === 0 ? (
                <>
                  You haven&rsquo;t started a deck yet. Start with{" "}
                  <a
                    href={`#${deckAnchor(firstDeck.id)}`}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {firstDeck.title}
                  </a>
                  , just below.
                </>
              ) : (
                <>
                  No quiz recorded yet. Answer the three questions at the end of any guide and
                  this page starts tracking what to come back to.
                </>
              )}{" "}
              <Button
                href="/learn"
                variant="link"
                iconEnd={<Icon name="arrow-up-right" size={14} />}
              >
                How to study, and why this works
              </Button>
            </Text>
          </div>
        )}

        <CardGrid cols={2}>
          {DECKS.map((deck) => (
            <div key={deck.id} id={deckAnchor(deck.id)} className="flex scroll-mt-28 flex-col">
              <Deck deckId={deck.id} />
            </div>
          ))}
        </CardGrid>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading
          kicker="Due now"
          title="What is waiting for you"
          lead="Cards and questions come back on a widening schedule: one day, then two, four, eight, sixteen. Missing one sends it back to the start."
        />
        <StatStrip>
          <Stat
            value={<span data-testid="due-cards">{due.cards}</span>}
            label="cards due"
            sub={`across ${countWord(DECK_COUNT).toLowerCase()} decks`}
          />
          <Stat
            value={<span data-testid="due-questions">{due.questions}</span>}
            label="questions due"
            sub="from the quizzes at the end of each guide"
          />
        </StatStrip>
        <Streak />
      </section>

      {history.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading kicker="History" title="Guides you have been quizzed on" />
          <ul data-testid="quiz-history" className="flex flex-col gap-3">
            {history.map((entry) => (
              <li key={entry.route}>
                <Card padding="sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <Heading level={3} size="h5">
                        {labelFor(entry.route)}
                      </Heading>
                      <Text size="caption" tone="faint">
                        {entry.run.score} of {entry.run.total} on {formatIsoDate(entry.run.taken)}
                        {entry.due ? ` · back on ${formatIsoDate(entry.due)}` : ""}
                      </Text>
                    </div>
                    <Button
                      href={entry.route}
                      variant="link"
                      iconEnd={<Icon name="arrow-up-right" size={14} />}
                    >
                      Run it again
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <SectionHeading
          kicker="Reflection"
          title="One question a week"
          lead="Twelve prompts, rotating. Written in your browser, read by nobody else."
        />
        <Journal />
      </section>
    </div>
  );
}
