import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import decksData from "@/data/decks.json";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { Deck } from "@/components/practice/deck";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Deck", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // 2026-08-21
  });

  function setup(deckId = "interview-questions") {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Deck deckId={deckId} />);
    return user;
  }

  it("renders nothing for a deck that does not exist", () => {
    const { container } = render(<Deck deckId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the front first and hides the back", async () => {
    setup();
    expect(await screen.findByTestId("deck-front")).toBeInTheDocument();
    expect(screen.queryByTestId("deck-back")).toBeNull();
  });

  it("flips to the back and offers the two verdicts", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: "Show the back" }));
    expect(screen.getByTestId("deck-back")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not yet" })).toBeInTheDocument();
  });

  it("promotes a card the visitor got and moves on", async () => {
    const user = setup();
    const first = (await screen.findByTestId("deck-front")).textContent;
    await user.click(screen.getByRole("button", { name: "Show the back" }));
    await user.click(screen.getByRole("button", { name: "Got it" }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}");
    expect(Object.values(stored.cards)[0]).toEqual({ box: 2, due: "2026-08-23" });
    expect(screen.getByTestId("deck-front").textContent).not.toBe(first);
  });

  it("sends a missed card back to box 1", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: "Show the back" }));
    await user.click(screen.getByRole("button", { name: "Not yet" }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}");
    expect(Object.values(stored.cards)[0]).toEqual({ box: 1, due: "2026-08-22" });
  });

  it("says when nothing is due and offers a free review instead", async () => {
    const parked = decksData.decks.find((deck) => deck.id === "red-flags");
    if (!parked) throw new Error("red-flags deck missing");
    localStorage.setItem(
      PRACTICE_KEYS.deck,
      JSON.stringify({
        cards: Object.fromEntries(
          parked.cards.map((card) => [card.id, { box: 5, due: "2027-01-01" }]),
        ),
      }),
    );

    setup("red-flags");
    expect(await screen.findByText(/Nothing is due in this deck today/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review the whole deck anyway" })).toBeInTheDocument();
  });

  it("links back to the guide the deck came from", async () => {
    setup();
    expect(await screen.findByRole("link", { name: /Open the guide/i })).toHaveAttribute(
      "href",
      "/interview",
    );
  });
});
