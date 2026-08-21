import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("explains the method to a visitor with no history", async () => {
    renderHub();
    expect(await screen.findByText(/Nothing recorded yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How to study/i })).toHaveAttribute("href", "/learn");
  });

  it("counts everything as due on a first visit", async () => {
    renderHub();
    expect(await screen.findByTestId("due-cards")).toHaveTextContent("86");
    expect(screen.getByTestId("due-questions")).toHaveTextContent("54");
  });

  it("shows all four decks", async () => {
    renderHub();
    const headings = await screen.findAllByRole("heading", { level: 3 });
    const titles = headings.map((heading) => heading.textContent);
    for (const title of ["Interview questions", "Red flags", "Get Legit terms", "English habits"]) {
      expect(titles).toContain(title);
    }
  });

  it("lists the quizzes already taken, with the score and the next review", async () => {
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
  });

  it("carries the weekly journal", async () => {
    renderHub();
    expect(await screen.findByRole("textbox", { name: /this week/i })).toBeInTheDocument();
  });
});
