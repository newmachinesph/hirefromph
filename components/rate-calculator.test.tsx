import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
    // jsdom does not step range inputs on arrow keys; set the value directly.
    fireEvent.change(slider, { target: { value: String(Number(slider.value) + Number(slider.step || 1) * 3) } });
    expect(screen.getByText(/\/ hr$/).textContent).not.toBe(before);
  });
});
