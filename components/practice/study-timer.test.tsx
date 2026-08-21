import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { StudyTimer } from "@/components/practice/study-timer";

describe("StudyTimer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 21, 9, 0, 0));
  });

  function setup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StudyTimer />);
    return user;
  }

  it("offers the three session shapes from the study protocol", () => {
    setup();
    expect(screen.getByRole("radio", { name: /15 min focus \/ 3 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /25 min focus \/ 5 min break/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /50 min focus \/ 10 min break/ })).toBeInTheDocument();
  });

  it("exposes the clock as a timer for assistive technology", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");
  });

  it("counts down", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(65_000);
    expect(screen.getByRole("timer")).toHaveTextContent("23:55");
  });

  it("persists the running block so a reload does not lose it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    const stored = JSON.parse(localStorage.getItem(PRACTICE_KEYS.timer) ?? "null");
    expect(stored.phase).toBe("focus");
    expect(stored.paused).toBe(false);
    expect(stored.shape).toBe("medium");
  });

  it("pauses and keeps the time left", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(60_000);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await vi.advanceTimersByTimeAsync(120_000);
    expect(screen.getByRole("timer")).toHaveTextContent("24:00");
  });

  it("moves to the break when the focus block runs out and says so once", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await vi.advanceTimersByTimeAsync(25 * 60_000 + 1_000);
    expect(screen.getByRole("status")).toHaveTextContent(/Break time/i);
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("resets back to a stopped focus block", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Start focus" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(localStorage.getItem(PRACTICE_KEYS.timer)).toBe("null");
  });
});
