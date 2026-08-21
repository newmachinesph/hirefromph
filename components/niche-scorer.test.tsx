import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NicheScorer } from "@/components/niche-scorer";

describe("NicheScorer", () => {
  it("renders the name field and a 1-5 scale per criterion", () => {
    render(<NicheScorer />);
    expect(screen.getByLabelText(/what niche are you evaluating/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio").length % 5).toBe(0);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("scoring everything at 5 moves the verdict to the top tier", async () => {
    const user = userEvent.setup();
    render(<NicheScorer />);
    const fives = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-5"));
    for (const r of fives) await user.click(r);
    expect(await screen.findByText(/strong niche/i)).toBeInTheDocument();
  });
});
