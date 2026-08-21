import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { StudyTimer } from "@/components/practice/study-timer";

describe("StudyTimer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0));
  });

  // `usePracticeSlot` reads localStorage in a mount effect. On pure virtual
  // time that effect still needs one microtask flush to land before the
  // first assertion, or `hydrated` is still false and the timer never renders.
  async function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudyTimer />);
    await act(async () => {});
    return user;
  }

  // Every clock advance is wrapped in `act` so React flushes the state
  // updates it produces before the next assertion runs — with pure virtual
  // time nothing else would trigger that flush.
  async function advance(ms: number) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  // `user.click` awaits @testing-library/react's `asyncWrapper`, which drains
  // its internal 0ms `setTimeout` by checking for a *Jest* global
  // (`jest.advanceTimersByTime`) — a check Vitest's `vi` never satisfies. On
  // pure fake timers that leaves the click's own promise chain permanently
  // pending, since nothing else ever fires that timer. Racing a zero-length
  // virtual advance alongside the click fires it without touching the wall
  // clock, and without weakening the fake-timer setup back to `shouldAdvanceTime`.
  async function click(user: ReturnType<typeof userEvent.setup>, element: Element) {
    const pending = user.click(element);
    await vi.advanceTimersByTimeAsync(0);
    await pending;
  }

  it("offers the three session shapes from the study protocol", async () => {
    await setup();
    expect(screen.getByRole("radio", { name: /15 min focus \/ 3 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /25 min focus \/ 5 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /50 min focus \/ 10 min break/ })).toBeInTheDocument();
  });

  it("exposes the clock as a timer for assistive technology", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");
  });

  it("counts down", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    await advance(65_000);
    expect(screen.getByRole("timer")).toHaveTextContent("23:55");
  });

  it("persists the running block so a reload does not lose it", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.timer) ?? "null");
    expect(stored.phase).toBe("focus");
    expect(stored.paused).toBe(false);
    expect(stored.shape).toBe("medium");
  });

  it("pauses and keeps the time left", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    await advance(60_000);
    await click(user, screen.getByRole("button", { name: "Pause" }));
    await advance(120_000);
    expect(screen.getByRole("timer")).toHaveTextContent("24:00");
  });

  it("moves to the break when the focus block runs out and says so once", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    await advance(25 * 60_000 + 1_000);
    expect(screen.getByRole("status")).toHaveTextContent(/Break time/i);
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("resets back to a stopped focus block", async () => {
    const user = await setup();
    await click(user, screen.getByRole("button", { name: "Start focus" }));
    await click(user, screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(localStorage.getItem(PRACTICE_KEYS.timer)).toBe("null");
  });
});
