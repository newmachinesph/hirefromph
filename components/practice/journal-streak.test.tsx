import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { Journal } from "@/components/practice/journal";
import { Streak } from "@/components/practice/streak";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0)); // Friday, 2026-W34
});

describe("Journal", () => {
  it("shows this week's prompt and saves one entry for the week", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Journal />);

    expect(await screen.findByText(/should have been an SOP/)).toBeInTheDocument();

    const box = screen.getByRole("textbox", { name: /this week/i });
    await user.type(box, "Wrote the invoice SOP.");
    await user.click(screen.getByRole("button", { name: "Save this week" }));

    expect(screen.getByRole("status")).toHaveTextContent(/Saved/i);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.journal) ?? "{}")).toEqual({
      "2026-W34": { text: "Wrote the invoice SOP.", updated: "2026-08-21" },
    });
  });

  it("reloads an entry already written this week", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.journal,
      JSON.stringify({ "2026-W34": { text: "Already written.", updated: "2026-08-21" } }),
    );
    render(<Journal />);
    expect(await screen.findByDisplayValue("Already written.")).toBeInTheDocument();
  });
});

describe("Streak", () => {
  function renderStreak() {
    render(
      <PathProvider>
        <Streak />
      </PathProvider>,
    );
  }

  it("says nothing has been ticked yet rather than showing a zero", async () => {
    renderStreak();
    expect(await screen.findByText(/No plan days ticked yet/i)).toBeInTheDocument();
  });

  it("counts consecutive days ending today", async () => {
    localStorage.setItem(
      "hfph.path.v1",
      JSON.stringify({ planDays: { 1: true, 2: true, 3: true } }),
    );
    localStorage.setItem(
      PRACTICE_KEYS.planDays,
      JSON.stringify({ 1: "2026-08-19", 2: "2026-08-20", 3: "2026-08-21" }),
    );
    renderStreak();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(screen.getByText(/day streak/i)).toBeInTheDocument();
  });

  it("says how many older ticks carry no date instead of guessing one", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ planDays: { 1: true, 2: true } }));
    localStorage.setItem(PRACTICE_KEYS.planDays, JSON.stringify({ 2: "2026-08-21" }));
    renderStreak();
    expect(await screen.findByText(/1 day was ticked before this site started/i)).toBeInTheDocument();
  });

  it("shows no badge, no points and no warning about losing the streak", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ planDays: { 1: true } }));
    localStorage.setItem(PRACTICE_KEYS.planDays, JSON.stringify({ 1: "2026-08-21" }));
    renderStreak();
    await screen.findByText("1");
    expect(screen.queryByText(/badge|points|don't break|keep it alive/i)).toBeNull();
  });
});
