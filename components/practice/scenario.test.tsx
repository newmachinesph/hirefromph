import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Scenario } from "@/components/practice/scenario";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

/** Walk the first branch to whatever ending it reaches. */
async function walkToEnd(user: ReturnType<typeof userEvent.setup>) {
  for (let step = 0; step < 15; step += 1) {
    const choices = screen.queryAllByTestId("scenario-choice");
    if (choices.length === 0) return;
    await user.click(choices[0]);
  }
}

describe("Scenario", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<Scenario scenarioId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens on the intro and the start node's choices", () => {
    render(<Scenario scenarioId="late-request" />);
    expect(screen.getByText(/Sunday night\. You are in bed\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
  });

  it("moves to the next node when a choice is taken and shows its consequence", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Leave it\. Answer at 8 am Monday/ }));
    expect(screen.getByText(/You put the phone face down/)).toBeInTheDocument();
  });

  it("lets the visitor step back one fork", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Reply with one question/ }));
    await user.click(screen.getByRole("button", { name: "Back one step" }));
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
  });

  it("restarts from the beginning", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await user.click(screen.getByRole("button", { name: /Reply with one question/ }));
    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByRole("button", { name: /Reply with one question/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back one step" })).toBeNull();
  });

  it("ends with a debrief listing the path taken and the rule each fork tested", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await walkToEnd(user);

    const debrief = screen.getByTestId("scenario-debrief");
    expect(within(debrief).getByText(/The path you took/i)).toBeInTheDocument();
    expect(within(debrief).getAllByTestId("scenario-tested").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Read the rule/i })).toHaveAttribute("href", "/conduct");
  });

  it("never shows a score", async () => {
    const user = userEvent.setup();
    render(<Scenario scenarioId="late-request" />);
    await walkToEnd(user);
    expect(screen.queryByText(/\bscore\b/i)).toBeNull();
  });
});
