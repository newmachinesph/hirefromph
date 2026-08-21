"use client";

import { useCallback, useId, useMemo, useState } from "react";
import decksData from "@/data/decks.json";
import { formatIsoDate } from "@/lib/dates";
import { isDue, schedule } from "@/lib/leitner";
import { EMPTY_DECK, PRACTICE_KEYS, parseDeckState } from "@/lib/practice-store";
import { Badge, Button, Heading, Icon, ProgressBar, Source, Text } from "@/components/ui";
import { usePracticeSlot, useToday } from "./hooks";

export type DeckCard = {
  id: string;
  front: string;
  back: string;
  source?: { label: string; url: string };
};

export type DeckData = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  cards: DeckCard[];
};

export const DECKS = decksData.decks as DeckData[];

export function getDeck(id: string): DeckData | undefined {
  return DECKS.find((deck) => deck.id === id);
}

export function Deck({ deckId }: { deckId: string }) {
  const baseId = useId();
  const deck = getDeck(deckId);
  const today = useToday();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);

  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewAll, setReviewAll] = useState(false);
  const [done, setDone] = useState(0);

  const cards = deck?.cards;
  const ready = hydrated && today !== "";

  /**
   * The queue is built once per session. `value.cards` is deliberately left
   * out of the dependency array: recomputing the session after every verdict
   * would pull a card the visitor just demoted straight back to the front,
   * which is the opposite of spacing. The memo still reads the current
   * `value.cards` whenever it *does* re-run (a due/reviewAll/today change),
   * so the initial computation is never stale.
   */
  const session = useMemo(() => {
    if (!ready || !cards) return [];
    const due = cards.filter((card) => isDue(value.cards[card.id], today));
    if (due.length > 0) return due;
    return reviewAll ? cards : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cards, reviewAll, today]);

  const answer = useCallback(
    (card: DeckCard, correct: boolean) => {
      if (today !== "") {
        set((prev) => ({
          cards: { ...prev.cards, [card.id]: schedule(prev.cards[card.id], correct, today) },
        }));
      }
      setFlipped(false);
      setDone((count) => count + 1);
      setPosition((index) => index + 1);
    },
    [set, today],
  );

  if (!deck) return null;

  const card = session[position];
  const finished = ready && session.length > 0 && position >= session.length;
  const nothingDue = ready && session.length === 0;
  const nextUp = deck.cards
    .map((entry) => value.cards[entry.id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => (a.due < b.due ? -1 : 1))[0];

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={3} size="h4" id={`${baseId}-title`}>
            {deck.title}
          </Heading>
          <Text size="small">{deck.blurb}</Text>
        </div>
        <Badge tone={session.length > 0 ? "signal" : "neutral"}>
          {ready ? `${session.length} in this session` : `${deck.cards.length} cards`}
        </Badge>
      </div>

      {nothingDue && (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-line-strong bg-band p-5">
          <Text size="small">
            Nothing is due in this deck today. Spacing only works if you let the gap happen.
          </Text>
          <Button variant="outline" size="sm" onClick={() => setReviewAll(true)}>
            Review the whole deck anyway
          </Button>
        </div>
      )}

      {card && (
        <div className="flex flex-col gap-4">
          <ProgressBar
            value={position}
            max={session.length}
            label={`Card ${position + 1} of ${session.length}`}
            showValue
          />

          <div data-testid="deck-front" className="rounded-md border border-line bg-band p-5">
            <Text size="lead" tone="ink">
              {card.front}
            </Text>
          </div>

          {!flipped ? (
            <div>
              <Button variant="outline" onClick={() => setFlipped(true)}>
                Show the back
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div data-testid="deck-back" className="rounded-md border border-line bg-paper p-5">
                <Text tone="ink">{card.back}</Text>
              </div>
              {card.source && <Source label={card.source.label} url={card.source.url} />}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => answer(card, true)}>
                  Got it
                </Button>
                <Button variant="ghost" onClick={() => answer(card, false)}>
                  Not yet
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <Text tone="ink">
            <strong className="font-semibold">{done}</strong> cards reviewed. Come back when the
            next batch is due.
          </Text>
          {nextUp && <Text size="small">Next card due {formatIsoDate(nextUp.due)}.</Text>}
        </div>
      )}

      <div>
        <Button href={deck.href} variant="link" iconEnd={<Icon name="arrow-up-right" size={14} />}>
          Open the guide these came from
        </Button>
      </div>
    </section>
  );
}
