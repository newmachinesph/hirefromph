import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateCalculator } from "@/components/rate-calculator";

describe("RateCalculator", () => {
  it("renders one labelled slider per input", () => {
    render(<RateCalculator />);
    expect(screen.getAllByRole("slider")).toHaveLength(7);
    expect(screen.getByLabelText(/your billed rate/i)).toBeInTheDocument();
  });

  it("raising the billed rate raises the real hourly rate", async () => {
    render(<RateCalculator />);
    const slider = screen.getByLabelText(/your billed rate/i) as HTMLInputElement;
    const before = screen.getByText(/\/ hr$/).textContent;
    await userEvent.setup().type(slider, "{arrowright}{arrowright}{arrowright}");
    expect(screen.getByText(/\/ hr$/).textContent).not.toBe(before);
  });
});
