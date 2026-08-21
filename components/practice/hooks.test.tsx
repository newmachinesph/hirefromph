import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS, parseDeckState, EMPTY_DECK } from "@/lib/practice-store";
import { usePracticeSlot, useJournalWeek } from "@/components/practice/hooks";

beforeEach(() => {
  localStorage.clear();
});

function SlotHarness() {
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.deck, EMPTY_DECK, parseDeckState);
  return (
    <div>
      <p data-testid="hydrated">{String(hydrated)}</p>
      <p data-testid="count">{Object.keys(value.cards).length}</p>
      <button
        type="button"
        onClick={() => set((prev) => ({ cards: { ...prev.cards, a: { box: 2, due: "2026-08-23" } } }))}
      >
        Record a card
      </button>
    </div>
  );
}

describe("usePracticeSlot", () => {
  it("hydrates from storage after mount", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.deck,
      JSON.stringify({ cards: { a: { box: 3, due: "2026-08-25" } } }),
    );
    render(<SlotHarness />);
    expect(await screen.findByText("true")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("writes through to storage on set", async () => {
    const user = userEvent.setup();
    render(<SlotHarness />);
    await screen.findByText("true");
    await user.click(screen.getByRole("button", { name: "Record a card" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.deck) ?? "{}")).toEqual({
      cards: { a: { box: 2, due: "2026-08-23" } },
    });
  });

  it("starts from the empty value when the slot holds rubbish", async () => {
    localStorage.setItem(PRACTICE_KEYS.deck, "{{{");
    render(<SlotHarness />);
    expect(await screen.findByText("true")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});

function JournalHarness() {
  const { week, prompt, entry, save } = useJournalWeek();
  return (
    <div>
      <p data-testid="week">{week}</p>
      <p data-testid="prompt">{prompt}</p>
      <p data-testid="entry">{entry?.text ?? ""}</p>
      <button type="button" onClick={() => save("One client found off-board.")}>
        Save
      </button>
    </div>
  );
}

describe("useJournalWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("rotates the twelve prompts by ISO week and stores one entry per week", async () => {
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // Friday, 2026-W34
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<JournalHarness />);

    expect(await screen.findByTestId("week")).toHaveTextContent("2026-W34");
    // (34 - 1) % 12 === 9 → the tenth prompt.
    expect(screen.getByTestId("prompt")).toHaveTextContent(/should have been an SOP/);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByTestId("entry")).toHaveTextContent("One client found off-board.");
    expect(Object.keys(JSON.parse(localStorage.getItem(PRACTICE_KEYS.journal) ?? "{}"))).toEqual([
      "2026-W34",
    ]);
    vi.useRealTimers();
  });
});
