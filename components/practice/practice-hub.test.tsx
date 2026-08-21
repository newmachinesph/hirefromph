import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import decksData from "@/data/decks.json";
import practiceData from "@/data/practice.json";
import { PathProvider } from "@/lib/path-context";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { PracticeHub } from "@/components/practice/practice-hub";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const TOTAL_CARDS = decksData.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
const TOTAL_QUESTIONS = Object.values(practiceData.routes).reduce(
  (sum, route) => sum + route.questions.length,
  0,
);
const FIRST_DECK = decksData.decks[0];

function renderHub() {
  render(
    <PathProvider>
      <PracticeHub />
    </PathProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0));
});

describe("PracticeHub", () => {
  it("tells a first-time visitor to start with the first deck, on this page", async () => {
    renderHub();
    const nudge = await screen.findByTestId("first-visit");
    expect(nudge).toHaveTextContent(/haven.t started a deck yet/i);
    expect(screen.getByRole("link", { name: FIRST_DECK.title })).toHaveAttribute(
      "href",
      `#deck-${FIRST_DECK.id}`,
    );
    expect(screen.getByRole("link", { name: /How to study/i })).toHaveAttribute("href", "/learn");
    expect(screen.queryByText(/Nothing recorded yet/i)).not.toBeInTheDocument();
  });

  it("puts the decks above the due counts", async () => {
    renderHub();
    const decks = await screen.findByRole("heading", { name: /decks,/i });
    const due = screen.getByRole("heading", { name: /What is waiting for you/i });
    expect(decks.compareDocumentPosition(due) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("switches the nudge once a deck has been answered but no quiz taken", async () => {
    const card = FIRST_DECK.cards[0];
    localStorage.setItem(
      PRACTICE_KEYS.deck,
      JSON.stringify({ cards: { [card.id]: { box: 1, due: "2026-08-22" } } }),
    );
    renderHub();
    const nudge = await screen.findByTestId("first-visit");
    expect(nudge).toHaveTextContent(/No quiz recorded yet/i);
    expect(nudge).not.toHaveTextContent(/started a deck yet/i);
  });

  it("derives the due totals and the deck heading from the data", async () => {
    renderHub();
    expect(await screen.findByTestId("due-cards")).toHaveTextContent(String(TOTAL_CARDS));
    expect(screen.getByTestId("due-questions")).toHaveTextContent(String(TOTAL_QUESTIONS));
    expect(
      screen.getByRole("heading", { name: new RegExp(`^\\w+ decks, ${TOTAL_CARDS} cards$`) }),
    ).toBeInTheDocument();
  });

  it("shows all four decks", async () => {
    renderHub();
    const headings = await screen.findAllByRole("heading", { level: 3 });
    const titles = headings.map((heading) => heading.textContent);
    for (const title of ["Interview questions", "Red flags", "Get Legit terms", "English habits"]) {
      expect(titles).toContain(title);
    }
  });

  it("lists the quizzes already taken, with the score and the next review, and drops the nudge", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.quiz,
      JSON.stringify({
        questions: { "english-1": { box: 2, due: "2026-08-23" } },
        routes: { "/english": { score: 2, total: 3, taken: "2026-08-20" } },
      }),
    );
    renderHub();
    const history = await screen.findByTestId("quiz-history");
    expect(history).toHaveTextContent("English at Work");
    expect(history).toHaveTextContent("2 of 3");
    expect(history).toHaveTextContent("23 Aug 2026");
    expect(screen.queryByTestId("first-visit")).not.toBeInTheDocument();
  });

  it("carries the weekly journal", async () => {
    renderHub();
    expect(await screen.findByRole("textbox", { name: /this week/i })).toBeInTheDocument();
  });
});
