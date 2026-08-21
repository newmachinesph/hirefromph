import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import portfolio from "@/data/portfolio.json";
import { PRACTICE_KEYS } from "@/lib/practice-store";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { PortfolioLadder, rungKey } from "@/components/portfolio-ladder";

// Renders all 22 ladders from portfolio.json; slow on a loaded machine.
vi.setConfig({ testTimeout: 20_000 });

const renderLadder = () =>
  render(
    <PathProvider>
      <PortfolioLadder />
    </PathProvider>,
  );

/** Ladder headings (h3) in DOM order: the lead one first, then the accordion's. */
const ladderNames = () =>
  screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.replace("Your niche", ""));

describe("PortfolioLadder", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("without a chosen path, prompts for a niche and keeps all 22 ladders behind the accordion", () => {
    renderLadder();
    expect(screen.getByText(/choose a niche and its ladder will sit here/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pick your niche/i })).toHaveAttribute("href", "/niches");
    expect(screen.getByText(`Show all niches (${portfolio.tracks.length})`)).toBeInTheDocument();
    expect(ladderNames()).toHaveLength(portfolio.tracks.length);
  });

  it("renders one chip per niche, each anchored to that ladder's id", () => {
    renderLadder();
    const nav = screen.getByRole("navigation", { name: /jump to a niche/i });
    const chips = within(nav).getAllByRole("link");
    expect(chips.map((chip) => chip.getAttribute("href"))).toEqual(
      portfolio.tracks.map((entry) => `#${entry.id}`),
    );
    for (const entry of portfolio.tracks) {
      expect(document.getElementById(entry.id)).not.toBeNull();
    }
  });

  it("with a chosen path, leads with that niche and collapses the other 21", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ track: "bookkeeping" }));
    renderLadder();
    expect(await screen.findByText("Your niche")).toBeInTheDocument();
    expect(ladderNames()[0]).toBe("Bookkeeping & Accounting");
    expect(screen.getByText(`Show all niches (${portfolio.tracks.length - 1})`)).toBeInTheDocument();
    expect(screen.queryByText(/choose a niche/i)).not.toBeInTheDocument();
  });

  it("a chip brings that niche to the top", async () => {
    const user = userEvent.setup();
    renderLadder();
    const nav = screen.getByRole("navigation", { name: /jump to a niche/i });
    await user.click(within(nav).getByRole("link", { name: "Medical Operations Professional" }));
    expect(ladderNames()[0]).toBe("Medical Operations Professional");
    expect(within(nav).getByRole("link", { name: "Medical Operations Professional" })).toHaveAttribute("aria-current", "true");
  });

  it("marks a rung built and persists it in its own practice slot", async () => {
    const user = userEvent.setup();
    localStorage.setItem("hfph.path.v1", JSON.stringify({ track: "bookkeeping" }));
    renderLadder();
    await screen.findByText("Your niche");
    const start = screen.getAllByRole("checkbox", { name: /done: start rung/i })[0];
    await user.click(start);
    expect(start).toBeChecked();
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.portfolio) ?? "{}")).toEqual({
      [rungKey("bookkeeping", "Start")]: true,
    });
    await user.click(start);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.portfolio) ?? "{}")).toEqual({});
  });
});
