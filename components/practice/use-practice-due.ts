"use client";

import { useMemo } from "react";
import decksData from "@/data/decks.json";
import practiceData from "@/data/practice.json";
import { isDue } from "@/lib/leitner";
import {
  EMPTY_DECK,
  EMPTY_QUIZ,
  PRACTICE_KEYS,
  parseDeckState,
  parseQuizState,
} from "@/lib/practice-store";
import { usePracticeSlot, useToday } from "./hooks";

const ALL_CARD_IDS = decksData.decks.flatMap((deck) => deck.cards.map((card) => card.id));
const ALL_QUESTION_IDS = Object.values(practiceData.routes).flatMap((entry) =>
  entry.questions.map((question) => question.id),
);

/** Totals derived from the data files, so no page hand-writes "86" or "54". */
export const DECK_COUNT = decksData.decks.length;
export const TOTAL_CARDS = ALL_CARD_IDS.length;
export const TOTAL_QUESTIONS = ALL_QUESTION_IDS.length;

export type PracticeDue = {
  cards: number;
  questions: number;
  /** Cards that have been answered at least once, in any deck. */
  reviewed: number;
  hydrated: boolean;
};

/** Due counts for `/practice` and the deck headers (spec §5.2b). */
export function usePracticeDue(): PracticeDue {
  const today = useToday();
  const deck = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);
  const quiz = usePracticeSlot(PRACTICE_KEYS.quiz, EMPTY_QUIZ, parseQuizState);
  const hydrated = deck.hydrated && quiz.hydrated && today !== "";
  const cards = deck.value.cards;
  const questions = quiz.value.questions;

  return useMemo(() => {
    if (!hydrated) return { cards: 0, questions: 0, reviewed: 0, hydrated: false };
    return {
      cards: ALL_CARD_IDS.filter((id) => isDue(cards[id], today)).length,
      questions: ALL_QUESTION_IDS.filter((id) => isDue(questions[id], today)).length,
      reviewed: ALL_CARD_IDS.filter((id) => Boolean(cards[id])).length,
      hydrated: true,
    };
  }, [hydrated, cards, questions, today]);
}
