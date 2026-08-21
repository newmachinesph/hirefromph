import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

// next/link and next/image need the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const pathState = { state: { steps: {}, stage: 1, startedAt: null }, hydrated: true };
vi.mock("@/lib/path-context", () => ({ usePath: () => pathState }));

import { StagePage } from "@/components/journey/stage-page";

/** Document position of the first match for each selector, so order can be asserted. */
function positions(container: HTMLElement, selectors: string[]): number[] {
  const all = Array.from(container.querySelectorAll("*"));
  return selectors.map((selector) => {
    const node = container.querySelector(selector);
    if (!node) throw new Error(`missing ${selector}`);
    return all.indexOf(node);
  });
}

describe("StagePage", () => {
  it("opens on the title and folds the TL;DR under the hero, before the stepper", () => {
    const { container } = render(<StagePage id="start" />);
    const [h1, tldr, stepper] = positions(container, [
      "h1",
      "details",
      "nav[aria-label='The five stages']",
    ]);
    expect(screen.getByText("TL;DR sa Tagalog")).toBeInTheDocument();
    expect(h1).toBeLessThan(tldr);
    expect(tldr).toBeLessThan(stepper);
  });

  it("puts the quiz after the closing and above the footer nav", () => {
    const { container } = render(<StagePage id="start" />);
    const [closing, quiz, footer] = positions(container, [
      "blockquote",
      "[id$='-title']",
      "nav[aria-label='Page navigation']",
    ]);
    expect(screen.getByRole("heading", { level: 2, name: "Check yourself" })).toBeInTheDocument();
    expect(closing).toBeLessThan(quiz);
    expect(quiz).toBeLessThan(footer);
  });

  it("drops the step range from the kicker, since no stage page names its roadmap steps", () => {
    render(<StagePage id="start" />);
    expect(screen.getByText("Stage 1 of 5")).toBeInTheDocument();
    expect(screen.queryByText(/Steps 1/)).toBeNull();
  });

  it("prints the stage's extra pages as one 'Also useful' line instead of a second card wall", () => {
    render(<StagePage id="start" />);
    expect(screen.queryByText("Tools for this stage")).toBeNull();
    const line = screen.getByText("Also useful at this stage:").parentElement as HTMLElement;
    expect(within(line).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/learn",
      "/tools",
    ]);
  });

  it("omits the line entirely when every tool is already a step", () => {
    render(<StagePage id="own" />);
    expect(screen.queryByText("Also useful at this stage:")).toBeNull();
  });

  it("renders stage-specific children between the steps and the closing", () => {
    const { container } = render(
      <StagePage id="deliver">
        <p data-testid="extra">Deliver-only content</p>
      </StagePage>,
    );
    const [stepper, extra, closing] = positions(container, [
      "nav[aria-label='The five stages']",
      "[data-testid='extra']",
      "blockquote",
    ]);
    expect(stepper).toBeLessThan(extra);
    expect(extra).toBeLessThan(closing);
  });
});
