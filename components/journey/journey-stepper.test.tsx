import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/link needs the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const usePath = vi.fn();
vi.mock("@/lib/path-context", () => ({ usePath: () => usePath() }));

import { JourneyStepper } from "@/components/journey/journey-stepper";

/** The slice of the context JourneyStepper reads. Everything else is unused. */
function pathState({
  steps = {},
  stage = 1,
  startedAt = null,
  hydrated = true,
}: {
  steps?: Record<number, boolean>;
  stage?: number;
  startedAt?: string | null;
  hydrated?: boolean;
} = {}) {
  return { state: { steps, stage, startedAt }, hydrated };
}

describe("JourneyStepper compact", () => {
  it("renders one marker per stage", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Deliver/ })).toHaveAttribute("href", "/deliver");
  });

  it("marks the current stage for assistive technology", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper current={3} />);
    expect(screen.getByRole("link", { name: /Deliver/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("link", { name: /Own/ })).not.toHaveAttribute("aria-current");
  });

  it("falls back to the saved stage when no current prop is given", () => {
    usePath.mockReturnValue(pathState({ stage: 4 }));
    render(<JourneyStepper />);
    expect(screen.getByRole("link", { name: /Level Up/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("shows a stage as done once every one of its roadmap steps is ticked", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true, 2: true } }));
    render(<JourneyStepper />);
    expect(screen.getByRole("link", { name: /Start Right/ })).toHaveAccessibleName(/done/i);
    expect(screen.getByRole("link", { name: /Get Hired/ })).not.toHaveAccessibleName(/done/i);
  });

  it("renders no diagram, bar or button in the compact variant", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("link", { name: /Open your path/ })).toBeNull();
  });
});

describe("JourneyStepper full", () => {
  it("adds the journey diagram, the progress bar and the dashboard link", () => {
    usePath.mockReturnValue(pathState());
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("img", { name: /five stages/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "11");
    expect(screen.getByRole("link", { name: /Open your path/ })).toHaveAttribute(
      "href",
      "/path",
    );
  });

  it("counts the ticked roadmap steps and offers to continue", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true, 2: true, 3: true } }));
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByRole("link", { name: /Continue/ })).toBeInTheDocument();
  });

  it("keeps the pre-hydration label so server and client markup agree", () => {
    usePath.mockReturnValue(pathState({ steps: { 1: true }, hydrated: false }));
    render(<JourneyStepper variant="full" />);
    expect(screen.getByRole("link", { name: /Open your path/ })).toBeInTheDocument();
  });
});
