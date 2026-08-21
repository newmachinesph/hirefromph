import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { QuizRunner, type QuizQuestion } from "@/components/practice/quiz-runner";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    type: "choice",
    prompt: "What proves you can do the work?",
    options: [
      { text: "One finished micro-task", correct: true, why: "It ends as a piece you can send today." },
      { text: "A certificate", correct: false, why: "A receipt that says you attended." },
    ],
  },
  {
    id: "q2",
    type: "reveal",
    prompt: "Think first: what is the requirement?",
    answer: "A working setup and the habit of finishing something real.",
    source: { label: "PSA Labour Force Survey", url: "https://psa.gov.ph/statistics/labor-force-survey" },
  },
  {
    id: "q3",
    type: "choice",
    prompt: "When does a favour become a job?",
    options: [
      { text: "When it is outside the agreed scope", correct: true, why: "Scope is the line." },
      { text: "When it takes over an hour", correct: false, why: "Time is not the test." },
    ],
  },
];

describe("QuizRunner", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // 2026-08-21
  });

  function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<QuizRunner route="/start" questions={QUESTIONS} />);
    return user;
  }

  it("shows one question at a time, starting at the first", () => {
    setup();
    expect(screen.getByText("What proves you can do the work?")).toBeInTheDocument();
    expect(screen.queryByText("When does a favour become a job?")).toBeNull();
  });

  it("hides every explanation until an option is chosen", () => {
    setup();
    expect(screen.queryByText("It ends as a piece you can send today.")).toBeNull();
  });

  it("reveals the explanation on every option once one is chosen", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    expect(screen.getByText("It ends as a piece you can send today.")).toBeInTheDocument();
    expect(screen.getByText("A receipt that says you attended.")).toBeInTheDocument();
  });

  it("announces the outcome once, in a status region", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    expect(screen.getByRole("status")).toHaveTextContent(/Not this one/i);
  });

  it("locks the options after an answer so the score cannot be farmed", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    expect(screen.getByRole("button", { name: /One finished micro-task/ })).toBeDisabled();
  });

  it("makes a reveal question think first, then self-grade", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.queryByText(/A working setup and the habit/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    expect(screen.getByText(/A working setup and the habit/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I had it" })).toBeInTheDocument();
  });

  it("shows the question's source when it has one", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByRole("link", { name: "PSA Labour Force Survey" })).toHaveAttribute(
      "href",
      "https://psa.gov.ph/statistics/labor-force-survey",
    );
  });

  it("reports the score and the next review date when all three are answered", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I had it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));

    const summary = screen.getByTestId("quiz-summary");
    expect(within(summary).getByText(/3 of 3/)).toBeInTheDocument();
    // Three correct answers put every question in box 2, which is two days out.
    expect(within(summary).getByText(/23 Aug 2026/)).toBeInTheDocument();
  });

  it("writes a Leitner schedule per question and one run per route", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /A certificate/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I missed it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));

    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.quiz) ?? "{}");
    expect(stored.questions.q1).toEqual({ box: 1, due: "2026-08-22" });
    expect(stored.questions.q3).toEqual({ box: 2, due: "2026-08-23" });
    expect(stored.routes["/start"]).toEqual({ score: 1, total: 3, taken: "2026-08-21" });
  });

  it("lets the visitor run it again without wiping the schedule", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /One finished micro-task/ }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "Show the answer" }));
    await user.click(screen.getByRole("button", { name: "I had it" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: /When it is outside the agreed scope/ }));
    await user.click(screen.getByRole("button", { name: "Run it again" }));

    expect(screen.getByText("What proves you can do the work?")).toBeInTheDocument();
    expect(screen.queryByTestId("quiz-summary")).toBeNull();
    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.quiz) ?? "{}");
    expect(Object.keys(stored.questions)).toHaveLength(3);
  });
});
