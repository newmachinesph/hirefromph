import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DECKS,
  MASTER_DECK_ID,
  getDeck,
  iconSrc,
  photoSrc,
  slideRequiresSource,
  validateDeck,
  type Deck,
  type Slide,
} from "@/lib/deck";

const PUBLIC = join(process.cwd(), "public");

const base: Slide = { id: "s", type: "statement", title: "Plain title", notes: "Say this." };

function deckWith(slides: Partial<Slide>[]): Deck {
  return {
    id: "t",
    title: "Test",
    subtitle: "A test deck",
    lastVerified: "2026-08",
    slides: [
      { ...base, id: "title", type: "title" },
      ...slides.map((s, i) => ({ ...base, id: `s${i}`, ...s })),
      { ...base, id: "close", type: "close" },
    ],
  };
}

describe("the authored decks", () => {
  it("are four: the master and one per session", () => {
    expect(DECKS.map((deck) => deck.id)).toEqual([
      MASTER_DECK_ID,
      "session-deconstruct-resume",
      "session-vet-opportunity",
      "session-ask-well",
    ]);
  });

  it.each(DECKS.map((deck) => [deck.id, deck] as const))("%s validates", (_id, deck) => {
    expect(validateDeck(deck)).toEqual([]);
  });

  it("master covers the seven methods in doctrine order", () => {
    const master = getDeck(MASTER_DECK_ID)!;
    const icons = master.slides.filter((s) => s.type === "method").map((s) => s.media?.icon);
    expect(icons).toEqual(["find", "deconstruct", "learn", "vet", "ask", "unstick", "give"]);
  });

  it("session decks carry their length and a drill", () => {
    for (const deck of DECKS.filter((d) => d.id !== MASTER_DECK_ID)) {
      expect(deck.minutes).toBeGreaterThan(0);
      expect(deck.slides.some((s) => s.type === "drill")).toBe(true);
    }
  });

  it("reference media that exists on disk", () => {
    for (const deck of DECKS) {
      for (const slide of deck.slides) {
        if (slide.media?.photo) expect(existsSync(join(PUBLIC, photoSrc(slide.media.photo)))).toBe(true);
        if (slide.media?.icon) expect(existsSync(join(PUBLIC, iconSrc(slide.media.icon)))).toBe(true);
      }
    }
  });
});

describe("validateDeck", () => {
  it("accepts a minimal deck", () => {
    expect(validateDeck(deckWith([]))).toEqual([]);
  });

  it("enforces the honesty rule: a digit needs a source", () => {
    const problems = validateDeck(deckWith([{ title: "Ten steps, 3 of them free" }]));
    expect(problems).toContain("t/s0: shows a number but has no source");
    expect(slideRequiresSource({ ...base, title: "Eleven steps" })).toBe(false);
    expect(slideRequiresSource({ ...base, items: ["step 1"] })).toBe(true);
  });

  it("rejects duplicate ids, missing notes, too many items and a bad close", () => {
    const problems = validateDeck(
      deckWith([{ id: "dup" }, { id: "dup", notes: " " }, { items: ["a", "b", "c", "d", "e", "f"] }]),
    );
    expect(problems).toContain("t/dup: duplicate id");
    expect(problems).toContain("t/dup: no speaker notes");
    expect(problems).toContain("t/s2: 6 items (max 5)");

    const noClose = deckWith([]);
    noClose.slides[noClose.slides.length - 1] = { ...base, id: "end", type: "statement" };
    expect(validateDeck(noClose)).toContain("t/end: the last slide must be a close slide");
  });

  it("requires media for method and diagram slides", () => {
    const problems = validateDeck(deckWith([{ type: "method" }, { type: "diagram" }]));
    expect(problems).toContain("t/s0: method slides need an icon");
    expect(problems).toContain("t/s1: diagram slides need a diagram");
  });
});
