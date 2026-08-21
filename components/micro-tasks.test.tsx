import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { MicroTasks } from "@/components/micro-tasks";

const renderTasks = () =>
  render(
    <PathProvider>
      <MicroTasks />
    </PathProvider>,
  );

describe("MicroTasks", () => {
  it("renders the task gallery with filters", () => {
    renderTasks();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(3);
  });

  it("opens a task and shows its definition of done", async () => {
    const user = userEvent.setup();
    renderTasks();
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    expect(await screen.findByText(/definition of done/i)).toBeInTheDocument();
  });

  it("ticking a definition-of-done box updates the counter", async () => {
    const user = userEvent.setup();
    renderTasks();
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(boxes[0]).toBeChecked();
  });
});
