import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { NicheExplorer } from "@/components/niche-explorer";

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
});
