import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { NicheExplorer } from "@/components/niche-explorer";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("NicheExplorer", () => {
  it("renders the niche grid", () => {
    render(
      <PathProvider>
        <NicheExplorer />
      </PathProvider>,
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(10);
  });

  it("opening a niche reveals its detail panel", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <NicheExplorer />
      </PathProvider>,
    );
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    expect(await screen.findByRole("button", { name: /close niche details/i })).toBeInTheDocument();
  });

  it("choosing a niche as the path offers the 30-day plan link", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <NicheExplorer />
      </PathProvider>,
    );
    const cards = screen.getAllByRole("button");
    await user.click(cards[cards.length - 1]);
    await user.click(await screen.findByRole("button", { name: /choose this as my path/i }));
    const plan = await screen.findByRole("link", { name: /build your 30-day plan for this niche/i });
    expect(plan).toHaveAttribute("href", "/plan");
  });
});
