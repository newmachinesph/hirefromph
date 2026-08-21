/**
 * The educator decks: one typed door onto data/decks/*.json.
 *
 * Client-safe on purpose (no node:* imports) — the presenter is a client
 * component and needs the types and the media helpers. The content hash and
 * the export contract live in scripts/build-decks.mjs.
 */
import master from "@/data/decks/master.json";
import sessionAskWell from "@/data/decks/session-ask-well.json";
import sessionDeconstructResume from "@/data/decks/session-deconstruct-resume.json";
import sessionVetOpportunity from "@/data/decks/session-vet-opportunity.json";

export const SLIDE_TYPES = [
  "title",
  "chapter",
  "statement",
  "method",
  "diagram",
  "list",
  "drill",
  "close",
] as const;
export type SlideType = (typeof SLIDE_TYPES)[number];

export const DECK_PHOTOS = ["deck-title", "deck-why", "deck-path", "deck-methods", "deck-close"] as const;
export type DeckPhoto = (typeof DECK_PHOTOS)[number];

export const METHOD_ICONS = ["find", "deconstruct", "learn", "vet", "ask", "unstick", "give"] as const;
export type MethodIcon = (typeof METHOD_ICONS)[number];

export const DECK_DIAGRAMS = ["journey-map", "method-loop"] as const;
export type DeckDiagram = (typeof DECK_DIAGRAMS)[number];

export type DeckSource = { label: string; url: string };

export type SlideMedia = {
  photo?: DeckPhoto;
  icon?: MethodIcon;
  diagram?: DeckDiagram;
};

export type Slide = {
  id: string;
  type: SlideType;
  kicker?: string;
  title: string;
  body?: string;
  items?: string[];
  /** Required whenever title, body or items carry a digit (the honesty rule). */
  source?: DeckSource;
  media?: SlideMedia;
  /** Speaker notes. Always present. */
  notes: string;
  /** Drill slides: how long the block runs. */
  minutes?: number;
};

export type Deck = {
  id: string;
  title: string;
  subtitle: string;
  minutes?: number;
  lastVerified: string;
  slides: Slide[];
};

export const DECKS: Deck[] = [
  master as Deck,
  sessionDeconstructResume as Deck,
  sessionVetOpportunity as Deck,
  sessionAskWell as Deck,
];

export const MASTER_DECK_ID = "master";

export function getDeck(id: string): Deck | undefined {
  return DECKS.find((deck) => deck.id === id);
}

export function photoSrc(photo: DeckPhoto): string {
  return `/images/${photo}.jpg`;
}

export function iconSrc(icon: MethodIcon): string {
  return `/images/deck/icons/${icon}.png`;
}

/** A digit anywhere in the visible copy means the slide needs a citation. */
export function slideRequiresSource(slide: Slide): boolean {
  const copy = [slide.title, slide.body ?? "", ...(slide.items ?? [])].join(" ");
  return /\d/.test(copy);
}

export const SLIDE_LIMITS = {
  title: 96,
  item: 120,
  items: 5,
} as const;

/**
 * Every rule the JSON must keep, as a list of human-readable problems.
 * Empty means valid. Used by lib/deck.test.ts and by scripts/build-decks.mjs,
 * so a bad deck can neither pass the suite nor ship a PDF.
 */
export function validateDeck(deck: Deck): string[] {
  const problems: string[] = [];
  const at = (slide: Slide, message: string) => problems.push(`${deck.id}/${slide.id}: ${message}`);

  if (!deck.id) problems.push("deck has no id");
  if (!deck.title) problems.push(`${deck.id}: no title`);
  if (!deck.subtitle) problems.push(`${deck.id}: no subtitle`);
  if (!/^\d{4}-\d{2}$/.test(deck.lastVerified)) problems.push(`${deck.id}: lastVerified is not YYYY-MM`);
  if (deck.minutes !== undefined && !(deck.minutes > 0)) problems.push(`${deck.id}: minutes must be positive`);
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) {
    problems.push(`${deck.id}: no slides`);
    return problems;
  }

  const seen = new Set<string>();
  deck.slides.forEach((slide, index) => {
    if (!slide.id) at(slide, "no id");
    if (seen.has(slide.id)) at(slide, "duplicate id");
    seen.add(slide.id);

    if (!SLIDE_TYPES.includes(slide.type)) at(slide, `unknown type "${slide.type}"`);
    if (index === 0 && slide.type !== "title") at(slide, "the first slide must be a title slide");
    if (index === deck.slides.length - 1 && slide.type !== "close") at(slide, "the last slide must be a close slide");

    if (!slide.title) at(slide, "no title");
    else if (slide.title.length > SLIDE_LIMITS.title) at(slide, `title is ${slide.title.length} chars (max ${SLIDE_LIMITS.title})`);

    if (slide.items) {
      if (slide.items.length > SLIDE_LIMITS.items) at(slide, `${slide.items.length} items (max ${SLIDE_LIMITS.items})`);
      slide.items.forEach((item, i) => {
        if (!item) at(slide, `item ${i + 1} is empty`);
        else if (item.length > SLIDE_LIMITS.item) at(slide, `item ${i + 1} is ${item.length} chars (max ${SLIDE_LIMITS.item})`);
      });
    }

    if (!slide.notes || !slide.notes.trim()) at(slide, "no speaker notes");

    if (slideRequiresSource(slide) && !slide.source) at(slide, "shows a number but has no source");
    if (slide.source) {
      if (!slide.source.label) at(slide, "source has no label");
      if (!/^https?:\/\//.test(slide.source.url ?? "")) at(slide, "source url is not a URL");
    }

    if (slide.media) {
      const { photo, icon, diagram } = slide.media;
      if (photo && !DECK_PHOTOS.includes(photo)) at(slide, `unknown photo "${photo}"`);
      if (icon && !METHOD_ICONS.includes(icon)) at(slide, `unknown icon "${icon}"`);
      if (diagram && !DECK_DIAGRAMS.includes(diagram)) at(slide, `unknown diagram "${diagram}"`);
    }
    if (slide.type === "method" && !slide.media?.icon) at(slide, "method slides need an icon");
    if (slide.type === "diagram" && !slide.media?.diagram) at(slide, "diagram slides need a diagram");
    if (slide.type === "drill" && slide.minutes !== undefined && !(slide.minutes > 0)) at(slide, "minutes must be positive");
  });

  return problems;
}
